/**
 * Cart Utility Functions
 *
 * Reusable helpers for cart calculations and transformations
 */

import { Decimal } from "@prisma/client/runtime/library";

export interface CartItem {
  itemId: number;
  namaBarang: string;
  quantity: number;
  hargaSatuan: number;
  subtotal: number;
  fotoUrl?: string;
}

export interface LocalCartItem {
  item: {
    id: number;
    namaBarang: string;
    fotoUrl: string;
    hargaSatuan: number | Decimal;
    jumlahStok: number;
  };
  quantity: number;
}

/**
 * Calculate total amount from cart items
 */
export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.subtotal, 0);
}

/**
 * Calculate total from local cart (kasir format)
 */
export function calculateLocalCartTotal(cart: LocalCartItem[]): number {
  return cart.reduce(
    (total, c) => total + Number(c.item.hargaSatuan) * c.quantity,
    0
  );
}

/**
 * Transform local cart to Firebase/API cart format
 */
export function transformToFirebaseCart(cart: LocalCartItem[]): CartItem[] {
  return cart.map((c) => ({
    itemId: c.item.id,
    namaBarang: c.item.namaBarang,
    quantity: c.quantity,
    hargaSatuan: Number(c.item.hargaSatuan),
    subtotal: Number(c.item.hargaSatuan) * c.quantity,
    fotoUrl: c.item.fotoUrl,
  }));
}

/**
 * Add item to cart or update quantity if exists
 */
export function addItemToCart(
  cart: LocalCartItem[],
  item: {
    id: number;
    namaBarang: string;
    fotoUrl: string;
    hargaSatuan: number | Decimal;
    jumlahStok: number;
  }
): { cart: LocalCartItem[]; error?: string } {
  const existingItem = cart.find((c) => c.item.id === item.id);

  if (existingItem) {
    if (existingItem.quantity >= item.jumlahStok) {
      return { cart, error: "Stok tidak cukup!" };
    }
    return {
      cart: cart.map((c) =>
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ),
    };
  }

  return { cart: [...cart, { item, quantity: 1 }] };
}

/**
 * Remove item from cart
 */
export function removeItemFromCart(
  cart: LocalCartItem[],
  itemId: number
): LocalCartItem[] {
  return cart.filter((c) => c.item.id !== itemId);
}

/**
 * Update item quantity in cart
 */
export function updateItemQuantity(
  cart: LocalCartItem[],
  itemId: number,
  quantity: number,
  maxStock: number
): { cart: LocalCartItem[]; error?: string } {
  if (quantity <= 0) {
    return { cart: removeItemFromCart(cart, itemId) };
  }

  if (quantity > maxStock) {
    return { cart, error: "Stok tidak cukup!" };
  }

  return {
    cart: cart.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)),
  };
}

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: number | Decimal): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

/**
 * Validate cart before checkout
 */
export function validateCart(cart: LocalCartItem[]): {
  valid: boolean;
  error?: string;
} {
  if (cart.length === 0) {
    return { valid: false, error: "Keranjang masih kosong!" };
  }

  for (const item of cart) {
    if (item.quantity > item.item.jumlahStok) {
      return {
        valid: false,
        error: `Stok ${item.item.namaBarang} tidak cukup!`,
      };
    }
    if (item.quantity <= 0) {
      return {
        valid: false,
        error: `Quantity untuk ${item.item.namaBarang} tidak valid!`,
      };
    }
  }

  return { valid: true };
}
