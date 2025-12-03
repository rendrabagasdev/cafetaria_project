/**
 * Menu Feature API Service
 * Handles all menu-related API calls
 */

import { MenuItem, OrderData } from "../types";

export const menuApi = {
  /**
   * Fetch all available items
   */
  async fetchItems(): Promise<MenuItem[]> {
    const res = await fetch("/api/items?status=TERSEDIA");
    const data = await res.json();
    return data.items || [];
  },

  /**
   * Fetch best seller items
   */
  async fetchBestSellers(limit: number = 4): Promise<MenuItem[]> {
    const res = await fetch(
      `/api/items?status=TERSEDIA&bestSeller=true&limit=${limit}`
    );
    const data = await res.json();
    return data.items || [];
  },

  /**
   * Create order (transaction)
   */
  async createOrder(orderData: OrderData) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    return data;
  },
};
