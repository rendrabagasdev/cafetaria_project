/**
 * Firebase Realtime Database Library
 *
 * Handles dual-screen POS session synchronization
 * Kasir screen and customer display sync via Firebase
 *
 * Configuration from environment variables (NOT from database):
 * - FIREBASE_SERVICE_ACCOUNT (JSON string)
 * - FIREBASE_DATABASE_URL
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { logger } from "./logger";

// Initialize Firebase Admin (server-side)
if (!getApps().length) {
  try {
    // Initialize with service account
    // Note: In production, store credentials in environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      logger.info("Firebase Admin initialized successfully", {
        service: "Firebase",
        action: "initialize",
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      // Fallback for development (if not configured yet)
      const warningMessage =
        "Firebase not configured. Dual-screen sync will not work. " +
        "Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL environment variables.";
      logger.warn(warningMessage, {
        service: "Firebase",
        action: "initialize",
        missingVariables: ["FIREBASE_SERVICE_ACCOUNT", "FIREBASE_DATABASE_URL"],
      });
      console.warn(warningMessage);
    }
  } catch (error: any) {
    logger.error(
      "Firebase initialization failed",
      {
        service: "Firebase",
        action: "initialize",
        errorMessage: error.message,
      },
      error
    );
  }
}

export interface CartItem {
  itemId: number;
  namaBarang: string;
  quantity: number;
  hargaSatuan: number;
  subtotal: number;
  fotoUrl?: string;
}

export interface PosSessionData {
  sessionId: string;
  kasirId: number;
  kasirName: string;
  status: "OPEN" | "PAYMENT" | "CLOSED";
  cart: CartItem[];
  grossAmount?: number; // Total amount (from cart or transaction)
  qrisUrl?: string;
  expireAt?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize Firebase session for dual-screen sync
 */
export async function initializeFirebaseSession(
  sessionId: string,
  kasirId: number,
  kasirName: string
): Promise<void> {
  console.log("[Firebase] initializeFirebaseSession called:", {
    sessionId,
    kasirId,
    kasirName,
  });

  if (!getApps().length) {
    const error = "Firebase not initialized. Skipping session creation.";
    logger.warn(error, {
      service: "Firebase",
      action: "initializeFirebaseSession",
      sessionId,
    });
    console.warn("[Firebase]", error);
    return;
  }

  try {
    console.log("[Firebase] Getting database reference...");
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);

    const sessionData: PosSessionData = {
      sessionId,
      kasirId,
      kasirName,
      status: "OPEN",
      cart: [],
      grossAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("[Firebase] Writing session data to Firebase:", sessionData);
    await sessionRef.set(sessionData);
    console.log("[Firebase] ✅ Session data written successfully!");

    logger.info("Firebase session initialized", {
      service: "Firebase",
      action: "initializeFirebaseSession",
      sessionId,
      kasirId,
      kasirName,
    });
  } catch (error: any) {
    console.error("[Firebase] ❌ Error writing to Firebase:", error);
    logger.error(
      "Failed to initialize Firebase session",
      {
        service: "Firebase",
        action: "initializeFirebaseSession",
        sessionId,
        kasirId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Update cart in Firebase (real-time sync)
 */
export async function updateFirebaseCart(
  sessionId: string,
  cart: CartItem[]
): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Skipping cart update.", {
      service: "Firebase",
      action: "updateFirebaseCart",
      sessionId,
    });
    return;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);

    // 🔥 Check session status first
    const snapshot = await sessionRef.once("value");
    const currentSession = snapshot.val();
    const currentStatus = currentSession?.status;

    const newGrossAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // 🔥 Jika status PAYMENT atau CLOSED, jangan overwrite grossAmount
    // (karena sudah di-set saat checkout dengan total yang benar)
    const updateData: any = {
      cart,
      updatedAt: new Date().toISOString(),
    };

    // Hanya update grossAmount jika status masih OPEN (belum checkout)
    if (currentStatus === "OPEN" || !currentStatus) {
      updateData.grossAmount = newGrossAmount;
    }

    await sessionRef.update(updateData);

    logger.info("Firebase cart updated", {
      service: "Firebase",
      action: "updateFirebaseCart",
      sessionId,
      itemCount: cart.length,
      grossAmount: updateData.grossAmount ?? "preserved",
      status: currentStatus,
    });
  } catch (error: any) {
    logger.error(
      "Failed to update Firebase cart",
      {
        service: "Firebase",
        action: "updateFirebaseCart",
        sessionId,
        itemCount: cart.length,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Update session status in Firebase
 */
export async function updateFirebaseSessionStatus(
  sessionId: string,
  status: "OPEN" | "PAYMENT" | "CLOSED",
  additionalData?: {
    qrisUrl?: string;
    expireAt?: string;
    paymentStatus?: string;
    paidAt?: string;
    grossAmount?: number; // 🔥 Total amount
  }
): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Skipping status update.", {
      service: "Firebase",
      action: "updateFirebaseSessionStatus",
      sessionId,
      status,
    });
    return;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);

    await sessionRef.update({
      status,
      ...additionalData,
      updatedAt: new Date().toISOString(),
    });

    logger.info("Firebase session status updated", {
      service: "Firebase",
      action: "updateFirebaseSessionStatus",
      sessionId,
      status,
      hasQrisUrl: !!additionalData?.qrisUrl,
    });
  } catch (error: any) {
    logger.error(
      "Failed to update Firebase session status",
      {
        service: "Firebase",
        action: "updateFirebaseSessionStatus",
        sessionId,
        status,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Get session data from Firebase
 */
export async function getFirebaseSession(
  sessionId: string
): Promise<PosSessionData | null> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Cannot get session.", {
      service: "Firebase",
      action: "getFirebaseSession",
      sessionId,
    });
    return null;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);
    const snapshot = await sessionRef.get();

    const exists = snapshot.exists();

    if (exists) {
      logger.info("Firebase session retrieved", {
        service: "Firebase",
        action: "getFirebaseSession",
        sessionId,
        status: snapshot.val().status,
      });
    } else {
      logger.warn("Firebase session not found", {
        service: "Firebase",
        action: "getFirebaseSession",
        sessionId,
      });
    }

    return exists ? snapshot.val() : null;
  } catch (error: any) {
    logger.error(
      "Failed to get Firebase session",
      {
        service: "Firebase",
        action: "getFirebaseSession",
        sessionId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Delete Firebase session (cleanup)
 */
export async function deleteFirebaseSession(sessionId: string): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Cannot delete session.", {
      service: "Firebase",
      action: "deleteFirebaseSession",
      sessionId,
    });
    return;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);
    await sessionRef.remove();

    logger.info("Firebase session deleted", {
      service: "Firebase",
      action: "deleteFirebaseSession",
      sessionId,
    });
  } catch (error: any) {
    logger.error(
      "Failed to delete Firebase session",
      {
        service: "Firebase",
        action: "deleteFirebaseSession",
        sessionId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Add item to Firebase cart
 */
export async function addItemToFirebaseCart(
  sessionId: string,
  item: CartItem
): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Cannot add item to cart.", {
      service: "Firebase",
      action: "addItemToFirebaseCart",
      sessionId,
      itemId: item.itemId,
    });
    return;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);
    const snapshot = await sessionRef.get();

    if (!snapshot.exists()) {
      const error = new Error("Session not found in Firebase");
      logger.error("Cannot add item - session not found", {
        service: "Firebase",
        action: "addItemToFirebaseCart",
        sessionId,
        itemId: item.itemId,
      });
      throw error;
    }

    const sessionData = snapshot.val() as PosSessionData;
    const existingItemIndex = sessionData.cart.findIndex(
      (i) => i.itemId === item.itemId
    );

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedCart = [...sessionData.cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + item.quantity,
        subtotal:
          (updatedCart[existingItemIndex].quantity + item.quantity) *
          item.hargaSatuan,
      };
    } else {
      // Add new item
      updatedCart = [...sessionData.cart, item];
    }

    await updateFirebaseCart(sessionId, updatedCart);

    logger.info("Item added to Firebase cart", {
      service: "Firebase",
      action: "addItemToFirebaseCart",
      sessionId,
      itemId: item.itemId,
      quantity: item.quantity,
      isUpdate: existingItemIndex >= 0,
    });
  } catch (error: any) {
    logger.error(
      "Failed to add item to Firebase cart",
      {
        service: "Firebase",
        action: "addItemToFirebaseCart",
        sessionId,
        itemId: item.itemId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Remove item from Firebase cart
 */
export async function removeItemFromFirebaseCart(
  sessionId: string,
  itemId: number
): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Cannot remove item from cart.", {
      service: "Firebase",
      action: "removeItemFromFirebaseCart",
      sessionId,
      itemId,
    });
    return;
  }

  try {
    const db = getDatabase();
    const sessionRef = db.ref(`pos-sessions/${sessionId}`);
    const snapshot = await sessionRef.get();

    if (!snapshot.exists()) {
      const error = new Error("Session not found in Firebase");
      logger.error("Cannot remove item - session not found", {
        service: "Firebase",
        action: "removeItemFromFirebaseCart",
        sessionId,
        itemId,
      });
      throw error;
    }

    const sessionData = snapshot.val() as PosSessionData;
    const updatedCart = sessionData.cart.filter((i) => i.itemId !== itemId);

    await updateFirebaseCart(sessionId, updatedCart);

    logger.info("Item removed from Firebase cart", {
      service: "Firebase",
      action: "removeItemFromFirebaseCart",
      sessionId,
      itemId,
    });
  } catch (error: any) {
    logger.error(
      "Failed to remove item from Firebase cart",
      {
        service: "Firebase",
        action: "removeItemFromFirebaseCart",
        sessionId,
        itemId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}

/**
 * Clear Firebase cart
 */
export async function clearFirebaseCart(sessionId: string): Promise<void> {
  if (!getApps().length) {
    logger.warn("Firebase not initialized. Cannot clear cart.", {
      service: "Firebase",
      action: "clearFirebaseCart",
      sessionId,
    });
    return;
  }

  try {
    await updateFirebaseCart(sessionId, []);

    logger.info("Firebase cart cleared", {
      service: "Firebase",
      action: "clearFirebaseCart",
      sessionId,
    });
  } catch (error: any) {
    logger.error(
      "Failed to clear Firebase cart",
      {
        service: "Firebase",
        action: "clearFirebaseCart",
        sessionId,
        errorMessage: error.message,
      },
      error
    );
    throw error;
  }
}
