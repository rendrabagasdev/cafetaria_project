"use client";

import { useState } from "react";
import { LocalCartItem } from "@/lib/cart-utils";
import { Decimal } from "@prisma/client/runtime/library";

export function useCart() {
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("CASH");

  const addItem = (item: {
    id: number;
    namaBarang: string;
    fotoUrl: string;
    hargaSatuan: number | Decimal;
    jumlahStok: number;
  }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: number) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, quantity } : c))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    setCart,
    addItem,
    addToCart: addItem,
    removeItem,
    removeFromCart: removeItem,
    updateQuantity,
    clearCart,
    paymentMethod,
    setPaymentMethod,
  };
}
