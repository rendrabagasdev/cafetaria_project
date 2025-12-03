"use client";

import { useCallback, useEffect, useState } from "react";
import { Item, PendingTransaction } from "../types";
import {
  fetchItems as fetchItemsApi,
  fetchPendingOrders as fetchPendingOrdersApi,
} from "../services/api";

export function useKasirData() {
  const [items, setItems] = useState<Item[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const data = await fetchItemsApi();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, []);

  const fetchPendingOrders = useCallback(async () => {
    try {
      const data = await fetchPendingOrdersApi();
      setPendingOrders(data);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchPendingOrders()]);
      setLoading(false);
    };
    loadData();
  }, [fetchItems, fetchPendingOrders]);

  // Firebase realtime listener untuk stock updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("firebase/database").then(({ onValue, ref }) => {
      import("@/lib/firebase-client").then(({ initializeFirebaseClient }) => {
        const { db } = initializeFirebaseClient();
        if (!db) {
          console.warn(
            "[useKasirData] Firebase not initialized, skipping realtime updates"
          );
          return;
        }

        const stockRef = ref(db, "stock-updates");

        // Listen untuk stock changes
        onValue(stockRef, (snapshot: any) => {
          const stockData = snapshot.val();
          if (stockData) {
            // Update stock di items
            setItems((prevItems) =>
              prevItems.map((item) => {
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

  return {
    items,
    pendingOrders,
    loading,
    isLoading: loading,
    fetchItems,
    fetchPendingOrders,
    refreshPendingOrders: fetchPendingOrders,
  };
}
