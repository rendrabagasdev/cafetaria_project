import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { TransactionStatus, PaymentMethod } from "@prisma/client";
import { calculateFees, calculateCartTotal } from "@/lib/fee-calculator";
import { createQrisPayment, generateOrderId } from "@/lib/midtrans";
import { deductStock, checkStockAvailability } from "@/lib/stock";
import { Decimal } from "@prisma/client/runtime/library";
import { logger } from "@/lib/logger";

// GET /api/transactions - Get all transactions (with filters)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PENGURUS and KASIR can view transactions
    if (token.role !== "PENGURUS" && token.role !== "KASIR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const statusParam = searchParams.get("status");

    const where: {
      createdAt?: { gte?: Date; lte?: Date };
      userId?: number;
      status?: TransactionStatus;
    } = {};

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Filter by user
    if (userId) {
      where.userId = parseInt(userId);
    }

    // Filter by status
    if (
      statusParam &&
      Object.values(TransactionStatus).includes(
        statusParam as TransactionStatus
      )
    ) {
      where.status = statusParam as TransactionStatus;
    }

    // KASIR can see:
    // 1. Their own completed transactions (userId = their id)
    // 2. All PENDING transactions (for approval)
    if (token.role === "KASIR") {
      // If filtering by PENDING, show all pending (no userId filter)
      // Otherwise, show only their own transactions
      if (statusParam !== "PENDING") {
        where.userId = parseInt(token.id as string);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        details: {
          include: {
            item: {
              select: {
                id: true,
                namaBarang: true,
                hargaSatuan: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    logger.error(
      "Failed to fetch transactions",
      {
        service: "API",
        action: "GET /api/transactions",
        errorMessage: error.message,
      },
      error
    );
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction with QRIS or CASH payment
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow both KASIR and USER to create transactions
    if (token.role !== "KASIR" && token.role !== "USER") {
      return NextResponse.json(
        { error: "Forbidden - Only KASIR and USER can create transactions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      items,
      paymentMethod,
      customerName,
      customerLocation,
      notes,
      posSessionId,
    } = body;

    console.log("[API] POST /api/transactions - Request body:", {
      itemsCount: items?.length,
      items,
      paymentMethod,
      posSessionId,
      hasSessionId: !!posSessionId,
    });

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["QRIS", "CASH"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method. Must be QRIS or CASH" },
        { status: 400 }
      );
    }

    // Check stock availability for all items
    const insufficientStock = await checkStockAvailability(items);
    if (insufficientStock.length > 0) {
      return NextResponse.json(
        {
          error: `Insufficient stock: ${insufficientStock
            .map(
              (i: any) =>
                `${i.namaBarang} (available: ${i.available}, requested: ${i.requested})`
            )
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Fetch item details (including hargaSatuan) from database
    const itemsWithPrices = await Promise.all(
      items.map(async (item: { itemId: number; quantity: number }) => {
        const dbItem = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: { hargaSatuan: true },
        });

        if (!dbItem) {
          throw new Error(`Item with ID ${item.itemId} not found`);
        }

        return {
          hargaSatuan: dbItem.hargaSatuan,
          quantity: item.quantity,
        };
      })
    );

    // Calculate cart total
    const cartTotal = calculateCartTotal(itemsWithPrices);

    // Calculate fees based on payment method
    const fees = await calculateFees(cartTotal, paymentMethod as PaymentMethod);

    // Generate Midtrans order ID
    const midtransOrderId = generateOrderId();

    // Create QRIS payment if payment method is QRIS
    let qrisData = null;
    if (paymentMethod === "QRIS") {
      try {
        qrisData = await createQrisPayment({
          orderId: midtransOrderId,
          grossAmount: parseFloat(fees.grossAmount.toString()),
          customerName: customerName || "Customer",
        });

        logger.info("QRIS payment created successfully", {
          service: "API",
          action: "POST /api/transactions",
          orderId: midtransOrderId,
          grossAmount: fees.grossAmount.toString(),
        });
      } catch (error: any) {
        logger.error(
          "Failed to create QRIS payment",
          {
            service: "API",
            action: "POST /api/transactions",
            orderId: midtransOrderId,
            grossAmount: fees.grossAmount.toString(),
            errorMessage: error.message,
          },
          error
        );
        return NextResponse.json(
          { error: `Failed to create QRIS payment: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Create transaction with atomic stock deduction
    const transaction = await prisma.$transaction(async (tx) => {
      // Prepare transaction details with stock snapshots
      const transactionDetails = [];

      for (const cartItem of items) {
        const item = await tx.item.findUnique({
          where: { id: cartItem.itemId },
        });

        if (!item) {
          throw new Error(`Item ${cartItem.itemId} not found`);
        }

        const stokSebelum = item.jumlahStok;
        const stokSesudah = stokSebelum - cartItem.quantity;
        const hargaSatuan = new Decimal(item.hargaSatuan.toString());
        const subtotal = hargaSatuan.mul(cartItem.quantity);

        transactionDetails.push({
          itemId: cartItem.itemId,
          jumlah: cartItem.quantity,
          hargaSatuan: hargaSatuan,
          subtotal: subtotal,
          stokSebelum,
          stokSesudah,
        });
      }

      // Determine transaction status
      let status: TransactionStatus;
      if (paymentMethod === "CASH") {
        status = "CASH"; // Cash immediately settled
      } else {
        status = "PENDING"; // QRIS awaiting payment
      }

      // Get PosSession ID (integer) from sessionId (UUID string) if provided
      let posSessionDbId: number | null = null;
      if (posSessionId) {
        const posSession = await prisma.posSession.findUnique({
          where: { sessionId: posSessionId },
          select: { id: true },
        });
        posSessionDbId = posSession?.id || null;
      }

      // Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          userId: parseInt(token.id as string),
          posSessionId: posSessionDbId,
          firebaseSessionId: posSessionId || null, // 🔥 STORE Firebase UUID for webhook updates
          grossAmount: fees.grossAmount,
          paymentFee: fees.paymentFee,
          platformFee: fees.platformFee,
          netAmount: fees.netAmount,
          mitraRevenue: fees.mitraRevenue,
          paymentMethod: paymentMethod as PaymentMethod,
          status,
          midtransOrderId: paymentMethod === "QRIS" ? midtransOrderId : null,
          qrisUrl: qrisData?.qrisUrl || null,
          paymentExpireAt: qrisData?.expireTime
            ? new Date(qrisData.expireTime)
            : null,
          customerName: customerName || null,
          customerLocation: customerLocation || null,
          notes: notes || null,
          createdBy: parseInt(token.id as string),
          details: {
            create: transactionDetails,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          details: {
            include: {
              item: {
                select: {
                  id: true,
                  namaBarang: true,
                  hargaSatuan: true,
                  fotoUrl: true,
                },
              },
            },
          },
        },
      });

      // Deduct stock for all items (only for CASH, QRIS waits for webhook)
      if (paymentMethod === "CASH") {
        for (const cartItem of items) {
          await deductStock(cartItem.itemId, cartItem.quantity, tx);
        }
      }

      return newTransaction;
    });

    logger.info("Transaction created successfully", {
      service: "API",
      action: "POST /api/transactions",
      transactionId: transaction.id,
      orderId: transaction.midtransOrderId || "CASH",
      paymentMethod,
      grossAmount: transaction.grossAmount.toString(),
      itemCount: items.length,
    });

    // Trigger Firebase untuk stock updates (untuk CASH yang langsung deduct)
    if (paymentMethod === "CASH") {
      try {
        const firebaseAdmin = await import("@/lib/firebase-admin");
        const { getDatabase } = await import("firebase-admin/database");

        const db = getDatabase(firebaseAdmin.app);
        const stockRef = db.ref("stock-updates");

        // Get updated stock untuk semua items yang terpengaruh
        const affectedItems = await prisma.item.findMany({
          where: {
            id: {
              in: items.map((item) => item.itemId),
            },
          },
          select: {
            id: true,
            jumlahStok: true,
          },
        });

        // Update Firebase dengan stock terbaru
        const stockUpdates: Record<string, any> = {};
        affectedItems.forEach((item) => {
          stockUpdates[item.id] = {
            stock: item.jumlahStok,
            timestamp: Date.now(),
          };
        });

        await stockRef.update(stockUpdates);
      } catch (firebaseError: any) {
        logger.error("Failed to update Firebase stock", {
          service: "API",
          action: "POST /api/transactions",
          transactionId: transaction.id,
          errorMessage: firebaseError.message,
        });
        // Don't fail the transaction if Firebase update fails
      }
    }

    // Trigger Firebase untuk realtime notification ke kasir
    try {
      const firebaseAdmin = await import("@/lib/firebase-admin");
      const { getDatabase } = await import("firebase-admin/database");

      const db = getDatabase(firebaseAdmin.app);
      const triggerRef = db.ref("pending-orders-trigger");

      await triggerRef.set({
        transactionId: transaction.id,
        timestamp: Date.now(),
        status: transaction.status,
      });

      logger.info("Firebase trigger sent for new transaction", {
        service: "API",
        action: "POST /api/transactions",
        transactionId: transaction.id,
      });
    } catch (firebaseError: any) {
      logger.error("Failed to trigger Firebase notification", {
        service: "API",
        action: "POST /api/transactions",
        transactionId: transaction.id,
        errorMessage: firebaseError.message,
      });
      // Don't fail the transaction if Firebase trigger fails
    }

    // Return response with QRIS data if applicable
    return NextResponse.json(
      {
        id: transaction.id,
        orderId: transaction.midtransOrderId,
        status: transaction.status,
        grossAmount: transaction.grossAmount.toString(),
        paymentFee: transaction.paymentFee.toString(),
        platformFee: transaction.platformFee.toString(),
        netAmount: transaction.netAmount.toString(),
        mitraRevenue: transaction.mitraRevenue.toString(),
        paymentMethod: transaction.paymentMethod,
        qrisUrl: transaction.qrisUrl,
        paymentExpireAt: transaction.paymentExpireAt,
        createdAt: transaction.createdAt.toISOString(),
        details: transaction.details?.map((detail) => ({
          id: detail.id,
          itemId: detail.itemId,
          jumlah: detail.jumlah,
          quantity: detail.jumlah, // Alias
          hargaSatuan: detail.hargaSatuan.toString(),
          subtotal: detail.subtotal.toString(),
          item: detail.item,
        })),
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error(
      "Failed to create transaction",
      {
        service: "API",
        action: "POST /api/transactions",
        errorMessage: error.message,
      },
      error
    );
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
