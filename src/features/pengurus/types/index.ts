/**
 * Pengurus Feature Types
 * Based on Prisma schema
 */

import {
  Item,
  Transaction,
  TransactionDetail,
  User,
  ItemStatus,
  TransactionStatus,
  Role,
} from "@prisma/client";

// Item type with mitra relation
export type PengurusItem = Item & {
  mitra?: {
    id: number;
    name: string;
    email: string;
  };
};

// Transaction type with user and details
export type PengurusTransaction = Transaction & {
  user?: {
    id: number;
    name: string;
    role: string;
  };
  details: (TransactionDetail & {
    item?: {
      namaBarang: string;
    };
  })[];
};

// User type
export type PengurusUser = User;

// Tab types
export type TabType = "pending" | "items" | "transactions" | "users";

// User role filter
export type UserRoleFilter = "ALL" | Role;

// Re-export Prisma enums
export { ItemStatus, TransactionStatus, Role };
