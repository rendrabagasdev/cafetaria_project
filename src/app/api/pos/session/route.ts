import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { initializeFirebaseSession } from "@/lib/firebase";
import { logger } from "@/lib/logger";

/**
 * POST /api/pos/session
 * Create new POS session for dual-screen
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "KASIR") {
      return NextResponse.json(
        { error: "Unauthorized. KASIR role required." },
        { status: 403 }
      );
    }

    const sessionId = uuidv4();
    const kasirId = parseInt(token.id as string);
    const kasirName = token.name as string;

    console.log("[API] Creating POS session:", {
      sessionId,
      kasirId,
      kasirName,
    });

    // Create session in database
    const posSession = await prisma.posSession.create({
      data: {
        sessionId,
        kasirId,
        status: "OPEN",
        firebaseSessionPath: `/pos-sessions/${sessionId}`,
      },
      include: {
        kasir: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Initialize session in Firebase Realtime Database
    console.log("[API] Initializing Firebase session:", sessionId);
    try {
      await initializeFirebaseSession(sessionId, kasirId, kasirName);
      console.log("[API] ✅ Firebase session initialized successfully");
    } catch (firebaseError: any) {
      console.error("[API] ❌ Firebase initialization failed:", firebaseError);
      // Don't fail the whole request if Firebase fails, just log it
      logger.error(
        "Firebase session initialization failed but continuing",
        {
          service: "API",
          action: "POST /api/pos/session",
          sessionId,
          errorMessage: firebaseError.message,
        },
        firebaseError
      );
    }

    logger.info("POS session created", {
      service: "API",
      action: "POST /api/pos/session",
      sessionId,
      kasirId,
    });

    return NextResponse.json({
      sessionId: posSession.sessionId,
      kasirName: posSession.kasir.name,
      qrCodeUrl: `${process.env.NEXTAUTH_URL}/customer-display?sessionId=${sessionId}`,
      firebaseSessionPath: posSession.firebaseSessionPath,
    });
  } catch (error: any) {
    logger.error(
      "Failed to create session",
      {
        service: "API",
        action: "POST /api/pos/session",
        errorMessage: error.message,
      },
      error
    );

    console.error("[API] Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session", details: error.message },
      { status: 500 }
    );
  }
}
