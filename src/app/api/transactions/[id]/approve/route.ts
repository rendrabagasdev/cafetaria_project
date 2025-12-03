import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// POST /api/transactions/[id]/approve - Approve transaction (KASIR only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "KASIR") {
      return NextResponse.json(
        { error: "Forbidden - Only KASIR can approve transactions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        details: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: "Transaction is not pending" },
        { status: 400 }
      );
    }

    // Update transaction and stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
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
      });

      // Update stock for each item
      for (const detail of transaction.details) {
        const item = await tx.item.findUnique({
          where: { id: detail.itemId },
        });

        if (!item) {
          throw new Error(`Item ${detail.itemId} not found`);
        }

        if (item.jumlahStok < detail.jumlah) {
          throw new Error(
            `Insufficient stock for ${item.namaBarang}. Available: ${item.jumlahStok}`
          );
        }

        await tx.item.update({
          where: { id: detail.itemId },
          data: {
            jumlahStok: {
              decrement: detail.jumlah,
            },
          },
        });

        // Update status to HABIS if stock is 0
        const updatedItem = await tx.item.findUnique({
          where: { id: detail.itemId },
        });

        if (updatedItem && updatedItem.jumlahStok === 0) {
          await tx.item.update({
            where: { id: detail.itemId },
            data: { status: "HABIS" },
          });
        }
      }

      return updatedTransaction;
    });

    // Trigger Firebase untuk stock updates
    try {
      const firebaseAdmin = await import("@/lib/firebase-admin");
      const { getDatabase } = await import("firebase-admin/database");

      const db = getDatabase(firebaseAdmin.app);
      const stockRef = db.ref("stock-updates");

      // Get updated stock untuk semua items yang terpengaruh
      const affectedItems = await prisma.item.findMany({
        where: {
          id: {
            in: transaction.details.map((d) => d.itemId),
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
      console.error("Failed to update Firebase stock:", firebaseError);
      // Don't fail the approval if Firebase update fails
    }

    return NextResponse.json({ transaction: result });
  } catch (error) {
    console.error("POST /api/transactions/[id]/approve error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
