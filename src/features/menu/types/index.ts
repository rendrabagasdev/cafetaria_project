/**
 * Menu Feature Types
 * Generated from Prisma schema - DO NOT use manual types
 */

import { Item as PrismaItem, ItemStatus } from "@prisma/client";

// Re-export Prisma types
export type { ItemStatus };

// Extended types with relations for menu display
export interface MenuItem extends PrismaItem {
  _count?: {
    transactionDetails: number;
  };
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface CheckoutFormData {
  customerName: string;
  customerLocation: string;
  notes?: string;
  paymentMethod: "QRIS" | "CASH";
}

export interface OrderData {
  items: {
    itemId: number;
    quantity: number;
  }[];
  customerName: string;
  customerLocation: string;
  notes?: string;
  paymentMethod: "QRIS" | "CASH";
}
