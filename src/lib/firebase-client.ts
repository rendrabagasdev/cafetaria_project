/**
 * Firebase Client Library (Browser-side)
 *
 * For real-time synchronization using Firebase Realtime Database
 * Uses push-based events (onValue) instead of polling
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, ref, onValue, off, Database } from "firebase/database";

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

/**
 * Initialize Firebase client
 * Call this once in your app
 */
export function initializeFirebaseClient() {
  if (firebaseApp && database) {
    console.log("[Firebase Client] Already initialized");
    return { app: firebaseApp, db: database };
  }

  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (!databaseURL) {
    console.warn("[Firebase Client] NEXT_PUBLIC_FIREBASE_DATABASE_URL not set");
    return { app: null, db: null };
  }

  try {
    // Check if already initialized
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0];
    } else {
      // Initialize with minimal config (only need database URL for RTDB)
      firebaseApp = initializeApp({
        databaseURL,
      });
    }

    database = getDatabase(firebaseApp);
    console.log("[Firebase Client] Initialized successfully");

    return { app: firebaseApp, db: database };
  } catch (error) {
    console.error("[Firebase Client] Initialization failed:", error);
    return { app: null, db: null };
  }
}

export interface FirebaseCartItem {
  itemId: number;
  namaBarang: string;
  quantity: number;
  hargaSatuan: number;
  subtotal: number;
  fotoUrl?: string;
}

export interface FirebasePosSession {
  sessionId: string;
  kasirId: number;
  kasirName: string;
  status: "OPEN" | "PAYMENT" | "CLOSED";
  cart: FirebaseCartItem[];
  grossAmount: number;
  qrisUrl?: string;
  expireAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscribe to real-time session updates
 * Returns unsubscribe function
 */
export function subscribeToSession(
  sessionId: string,
  callback: (session: FirebasePosSession | null) => void
): () => void {
  const { db } = initializeFirebaseClient();

  if (!db) {
    console.error("[Firebase Client] Database not initialized");
    return () => {};
  }

  const sessionRef = ref(db, `pos-sessions/${sessionId}`);

  console.log("[Firebase Client] Subscribing to session:", sessionId);

  // Real-time listener (push-based, not polling!)
  onValue(
    sessionRef,
    (snapshot) => {
      const data = snapshot.val();
      console.log("[Firebase Client] Real-time update received:", {
        sessionId,
        hasData: !!data,
        cartItems: data?.cart?.length || 0,
      });
      callback(data);
    },
    (error) => {
      console.error("[Firebase Client] Error listening to session:", error);
      callback(null);
    }
  );

  // Return cleanup function
  return () => {
    console.log("[Firebase Client] Unsubscribing from session:", sessionId);
    off(sessionRef);
  };
}

/**
 * Get session data once (no real-time updates)
 */
export async function getSessionOnce(
  sessionId: string
): Promise<FirebasePosSession | null> {
  const { db } = initializeFirebaseClient();

  if (!db) {
    console.error("[Firebase Client] Database not initialized");
    return null;
  }

  const sessionRef = ref(db, `pos-sessions/${sessionId}`);

  return new Promise((resolve) => {
    onValue(
      sessionRef,
      (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      },
      { onlyOnce: true }
    );
  });
}

/**
 * Get initialized database instance
 */
export function getFirebaseDatabase(): Database | null {
  const { db } = initializeFirebaseClient();
  return db;
}

// Export direct access to database for advanced usage
export { database, firebaseApp };
