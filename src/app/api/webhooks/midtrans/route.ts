import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { deductStock } from "@/lib/stock";
import { logger } from "@/lib/logger";
import { updateFirebaseSessionStatus } from "@/lib/firebase";

/**
 * POST /api/webhooks/midtrans
 *
 * Handles payment notifications from Midtrans
 * This is a CRITICAL endpoint - it processes real money transactions!
 *
 * Security:
 * - MUST verify signature before processing
 * - MUST be idempotent (can handle duplicate notifications)
 * - MUST respond quickly (< 5 seconds) to avoid retries
 */
export async function POST(request: NextRequest) {
  let orderId: string | undefined;
  try {
    const body = await request.json();

    orderId = body.order_id;

    logger.info("Midtrans webhook notification received", {
      service: "Webhook",
      action: "POST",
      orderId: body.order_id,
      transactionStatus: body.transaction_status,
      fraudStatus: body.fraud_status,
    });

    console.log("[Midtrans Webhook] Received notification:", {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      fraud_status: body.fraud_status,
    });

    // Extract notification data
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      settlement_time,
    } = body;

    // CRITICAL: Verify signature to prevent fake notifications
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      logger.error("Midtrans webhook signature verification failed", {
        service: "Webhook",
        action: "POST",
        orderId: order_id,
        statusCode: status_code,
        grossAmount: gross_amount,
      });
      console.error("[Midtrans Webhook] Invalid signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Find transaction by Midtrans order ID
    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: order_id },
      include: {
        details: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!transaction) {
      logger.error("Midtrans webhook - transaction not found", {
        service: "Webhook",
        action: "POST",
        orderId: order_id,
      });
      console.error("[Midtrans Webhook] Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log("[Midtrans Webhook] 📦 Transaction found:", {
      id: transaction.id,
      orderId: transaction.midtransOrderId,
      firebaseSessionId: transaction.firebaseSessionId,
      hasFirebaseId: !!transaction.firebaseSessionId,
    });

    // Map Midtrans status to our TransactionStatus
    let newStatus = transaction.status;
    let shouldDeductStock = false;

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        newStatus = "SETTLEMENT";
        shouldDeductStock = true;
      }
    } else if (transaction_status === "settlement") {
      newStatus = "SETTLEMENT";
      shouldDeductStock = true;
    } else if (transaction_status === "pending") {
      newStatus = "PENDING";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel"
    ) {
      newStatus = "CANCEL";
    } else if (transaction_status === "expire") {
      newStatus = "EXPIRE";
    }

    // Update transaction status
    await prisma.$transaction(async (tx) => {
      // Update transaction
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          settledAt: settlement_time ? new Date(settlement_time) : null,
        },
      });

      // Deduct stock if payment successful and not already deducted
      if (shouldDeductStock && transaction.status === "PENDING") {
        console.log("[Midtrans Webhook] Deducting stock for order:", order_id);
        logger.info("Deducting stock for successful payment", {
          service: "Webhook",
          action: "deductStock",
          orderId: order_id,
          itemCount: transaction.details.length,
        });

        for (const detail of transaction.details) {
          try {
            await deductStock(detail.itemId, detail.jumlah, tx);
          } catch (error: any) {
            logger.error(
              "Stock deduction failed for item",
              {
                service: "Webhook",
                action: "deductStock",
                orderId: order_id,
                itemId: detail.itemId,
                quantity: detail.jumlah,
                errorMessage: error.message,
              },
              error
            );
            console.error(
              `[Midtrans Webhook] Stock deduction failed for item ${detail.itemId}:`,
              error.message
            );
            // Continue processing other items
          }
        }
      }
    });

    // 🔥 UPDATE FIREBASE - Customer Display akan otomatis terupdate
    if (transaction.firebaseSessionId) {
      try {
        const firebaseStatus =
          newStatus === "SETTLEMENT"
            ? "CLOSED"
            : newStatus === "PENDING"
            ? "PAYMENT"
            : "CLOSED";

        console.log("[Midtrans Webhook] 🔥 Updating Firebase:", {
          sessionId: transaction.firebaseSessionId,
          firebaseStatus,
          paymentStatus: newStatus,
          paidAt: settlement_time,
        });

        await updateFirebaseSessionStatus(
          transaction.firebaseSessionId,
          firebaseStatus,
          {
            paymentStatus: newStatus,
            paidAt: settlement_time
              ? new Date(settlement_time).toISOString()
              : undefined,
          }
        );

        console.log("[Midtrans Webhook] ✅ Firebase updated successfully");

        logger.info("Firebase session updated via webhook", {
          service: "Webhook",
          action: "updateFirebase",
          sessionId: transaction.firebaseSessionId,
          paymentStatus: newStatus,
        });
      } catch (firebaseError: any) {
        logger.error("Failed to update Firebase from webhook", {
          service: "Webhook",
          action: "updateFirebase",
          sessionId: transaction.firebaseSessionId,
          errorMessage: firebaseError.message,
        });
        // Don't fail the webhook if Firebase update fails
      }
    }

    logger.info("Midtrans webhook processed successfully", {
      service: "Webhook",
      action: "POST",
      orderId: order_id,
      oldStatus: transaction.status,
      newStatus,
      stockDeducted: shouldDeductStock,
    });

    console.log("[Midtrans Webhook] Transaction updated:", {
      orderId: order_id,
      oldStatus: transaction.status,
      newStatus,
    });

    // Respond immediately to Midtrans (< 5 sec)
    return NextResponse.json({
      status: "OK",
      message: "Notification processed successfully",
    });
  } catch (error: any) {
    logger.error(
      "Midtrans webhook processing failed",
      {
        service: "Webhook",
        action: "POST",
        orderId: orderId || "unknown",
        errorMessage: error.message,
      },
      error
    );
    console.error("[Midtrans Webhook] Error processing notification:", error);

    // Return 200 even on error to prevent Midtrans retries
    // Log the error for manual investigation
    return NextResponse.json({
      status: "ERROR",
      message: error.message,
    });
  }
}

/**
 * GET /api/webhooks/midtrans
 *
 * Healthcheck endpoint (optional)
 */
export async function GET() {
  return NextResponse.json({
    service: "Midtrans Webhook Handler",
    status: "Active",
    timestamp: new Date().toISOString(),
  });
}
