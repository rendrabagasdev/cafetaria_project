import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  updateFirebaseCart,
  updateFirebaseSessionStatus,
} from "@/lib/firebase";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: {
    sessionId: string;
  };
}

/**
 * GET /api/pos/session/[sessionId]
 * Get session data for customer display
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    console.log("[API] Getting session data:", sessionId);

    const posSession = await prisma.posSession.findUnique({
      where: { sessionId },
      include: {
        kasir: {
          select: {
            name: true,
          },
        },
        transactions: {
          where: {
            status: {
              in: ["PENDING", "SETTLEMENT", "CASH"],
            },
          },
          include: {
            details: {
              include: {
                item: {
                  select: {
                    namaBarang: true,
                    fotoUrl: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!posSession) {
      logger.warn("Session not found", {
        service: "API",
        action: "GET /api/pos/session/[sessionId]",
        sessionId,
      });
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get current transaction (if any)
    const currentTransaction = posSession.transactions[0];

    // Build cart from transaction details
    const cart = currentTransaction
      ? currentTransaction.details.map((detail) => ({
          itemId: detail.itemId,
          namaBarang: detail.item.namaBarang,
          quantity: detail.jumlah,
          hargaSatuan: parseFloat(detail.hargaSatuan.toString()),
          subtotal: parseFloat(detail.subtotal.toString()),
          fotoUrl: detail.item.fotoUrl,
        }))
      : [];

    const session = {
      sessionId: posSession.sessionId,
      kasirName: posSession.kasir.name,
      status: posSession.status,
      cart,
      grossAmount: currentTransaction
        ? parseFloat(currentTransaction.grossAmount.toString())
        : 0,
      qrisUrl: currentTransaction?.qrisUrl || undefined,
      expireAt: currentTransaction?.paymentExpireAt?.toISOString(),
      updatedAt: posSession.updatedAt.toISOString(),
    };

    console.log("[API] Sending session data:", {
      sessionId,
      status: session.status,
      cartItems: cart.length,
      grossAmount: session.grossAmount,
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    logger.error(
      "Failed to get session",
      {
        service: "API",
        action: "GET /api/pos/session/[sessionId]",
        errorMessage: error.message,
      },
      error
    );

    console.error("[API] Get session error:", error);
    return NextResponse.json(
      { error: "Failed to get session", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pos/session/[sessionId]
 * Update session status or cart
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { status, cart, grossAmount } = body;

    logger.info("Updating POS session", {
      service: "API",
      action: "PATCH /api/pos/session/[sessionId]",
      sessionId,
      hasStatus: !!status,
      hasCart: !!cart,
      cartItems: cart?.length,
      grossAmount,
    });

    // Update Firebase first (for real-time sync)
    if (cart !== undefined) {
      console.log("[API] Syncing cart to Firebase:", {
        sessionId,
        itemCount: cart.length,
        grossAmount,
      });

      await updateFirebaseCart(sessionId, cart);

      logger.info("Cart synced to Firebase", {
        service: "API",
        action: "PATCH /api/pos/session/[sessionId]",
        sessionId,
        itemCount: cart.length,
      });
    }

    if (status) {
      console.log("[API] Updating session status:", { sessionId, status });
      await updateFirebaseSessionStatus(sessionId, status);

      logger.info("Session status updated in Firebase", {
        service: "API",
        action: "PATCH /api/pos/session/[sessionId]",
        sessionId,
        status,
      });
    }

    // Update database
    const updated = await prisma.posSession.update({
      where: { sessionId },
      data: {
        ...(status && {
          status,
          ...(status === "CLOSED" && { closedAt: new Date() }),
        }),
      },
    });

    console.log("[API] Session updated successfully:", sessionId);
    return NextResponse.json({ session: updated });
  } catch (error: any) {
    logger.error(
      "Failed to update session",
      {
        service: "API",
        action: "PATCH /api/pos/session/[sessionId]",
        errorMessage: error.message,
      },
      error
    );

    console.error("[API] Update session error:", error);
    return NextResponse.json(
      { error: "Failed to update session", details: error.message },
      { status: 500 }
    );
  }
}
