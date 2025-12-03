import { NextRequest, NextResponse } from "next/server";
import { updateFirebaseSessionStatus } from "@/lib/firebase";

/**
 * POST /api/pos-sessions/[sessionId]/payment
 * Update Firebase session dengan QR code dan expiry time
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params; // 🔥 Await params in Next.js 15
    const body = await request.json();
    const { qrisUrl, expireAt, grossAmount } = body;

    console.log("[API Payment Session] 🔥 Updating Firebase:", {
      sessionId,
      qrisUrl,
      expireAt,
      grossAmount,
      grossAmountType: typeof grossAmount,
    });

    if (!qrisUrl) {
      return NextResponse.json(
        { error: "qrisUrl is required" },
        { status: 400 }
      );
    }

    // Update Firebase session to PAYMENT status with QR code and amount
    await updateFirebaseSessionStatus(sessionId, "PAYMENT", {
      qrisUrl,
      expireAt,
      grossAmount, // 🔥 Simpan total amount
    });

    console.log("[API Payment Session] ✅ Firebase updated successfully");

    return NextResponse.json({
      success: true,
      message: "Payment session updated",
    });
  } catch (error: any) {
    console.error("Error updating payment session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment session" },
      { status: 500 }
    );
  }
}
