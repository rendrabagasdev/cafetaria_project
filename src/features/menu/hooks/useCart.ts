/**
 * Cart Hook
 * Manages shopping cart state and operations
 */

"use client";

import { useState } from "react";
import { CartItem, MenuItem } from "../types";

export function useMenuCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.item.id === item.id);

    if (existingItem) {
      // Check stock availability
      if (existingItem.quantity >= item.jumlahStok) {
        throw new Error(`Stok tidak cukup untuk ${item.namaBarang}!`);
      }

      setCart(
        cart.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const cartItem = cart.find((c) => c.item.id === itemId);
    if (!cartItem) return;

    // Check stock availability
    if (quantity > cartItem.item.jumlahStok) {
      throw new Error(`Stok tidak cukup untuk ${cartItem.item.namaBarang}!`);
    }

    setCart(cart.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce(
      (total, c) => total + Number(c.item.hargaSatuan) * c.quantity,
      0
    );
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  };
}
