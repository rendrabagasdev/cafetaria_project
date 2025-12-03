"use client";

import { useCallback, useState } from "react";
import { LocalCartItem, transformToFirebaseCart } from "@/lib/cart-utils";
import {
  initializePosSession,
  syncCartToFirebase,
  updatePosSessionStatus,
} from "../services/api";

export function usePosSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customerDisplayUrl, setCustomerDisplayUrl] = useState<string | null>(
    null
  );
  const [showSessionQR, setShowSessionQR] = useState(false);

  const createSession = useCallback(
    async (kasirId: number, kasirName: string) => {
      try {
        // API route handles Firebase initialization server-side
        const data = await initializePosSession();
        setSessionId(data.sessionId);

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const displayUrl = `${baseUrl}/customer-display?session=${data.sessionId}`;
        setCustomerDisplayUrl(displayUrl);

        console.log("[POS] Session created:", data.sessionId);
      } catch (error) {
        console.error("[POS] Failed to create session:", error);
      }
    },
    []
  );

  const syncCart = useCallback(
    async (cart: LocalCartItem[]) => {
      if (!sessionId) return;

      try {
        const firebaseCart = transformToFirebaseCart(cart);
        await syncCartToFirebase(sessionId, firebaseCart);
        console.log("[KASIR] Cart synced successfully");
      } catch (error) {
        console.error("[KASIR] Failed to sync cart:", error);
      }
    },
    [sessionId]
  );

  const updateSessionStatus = useCallback(
    async (status: string) => {
      if (!sessionId) return;

      try {
        await updatePosSessionStatus(sessionId, status);
      } catch (error) {
        console.error("[POS] Failed to update status:", error);
      }
    },
    [sessionId]
  );

  return {
    sessionId,
    isSessionActive: !!sessionId,
    customerDisplayUrl,
    showSessionQR,
    setShowSessionQR,
    createSession,
    syncCart,
    updateSessionStatus,
  };
}
