"use client";

import { useEffect, useState } from "react";
import { Item, Settings } from "../types";
import { fetchItems, fetchBestSellers, fetchSettings } from "../services/api";

export function useGuestData() {
  const [items, setItems] = useState<Item[]>([]);
  const [bestSellers, setBestSellers] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [itemsData, bestSellersData, settingsData] = await Promise.all([
      fetchItems(),
      fetchBestSellers(),
      fetchSettings(),
    ]);
    setItems(itemsData);
    setBestSellers(bestSellersData);
    setSettings(settingsData);
    setLoading(false);
  };

  return {
    items,
    bestSellers,
    settings,
    loading,
  };
}
