/**
 * Menu Feature Hook
 * Manages menu items and best sellers state with Firebase realtime stock updates
 */

"use client";

import { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { menuApi } from "../services/api";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMenuData();
  }, []);

  // Firebase realtime listener untuk stock updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("firebase/database").then(({ onValue, ref }) => {
      import("@/lib/firebase-client").then(({ initializeFirebaseClient }) => {
        const { db } = initializeFirebaseClient();
        if (!db) {
          console.warn(
            "[useMenu] Firebase not initialized, skipping realtime updates"
          );
          return;
        }

        const stockRef = ref(db, "stock-updates");

        // Listen untuk stock changes
        onValue(stockRef, (snapshot: any) => {
          const stockData = snapshot.val();
          if (stockData) {
            // Update stock di items dan bestSellers
            setItems((prevItems) =>
              prevItems.map((item) => {
                const stockUpdate = stockData[item.id];
                if (stockUpdate) {
                  return { ...item, jumlahStok: stockUpdate.stock };
                }
                return item;
              })
            );

            setBestSellers((prevBestSellers) =>
              prevBestSellers.map((item) => {
                const stockUpdate = stockData[item.id];
                if (stockUpdate) {
                  return { ...item, jumlahStok: stockUpdate.stock };
                }
                return item;
              })
            );
          }
        });
      });
    });
  }, []);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      const [itemsData, bestSellersData] = await Promise.all([
        menuApi.fetchItems(),
        menuApi.fetchBestSellers(4),
      ]);

      setItems(itemsData);
      setBestSellers(bestSellersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
      console.error("Error loading menu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMenu = () => {
    loadMenuData();
  };

  return {
    items,
    bestSellers,
    isLoading,
    error,
    refreshMenu,
  };
}
