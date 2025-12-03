/**
 * Mitra Feature Types
 * Generated from Prisma schema
 */

import { Item, ItemStatus } from "@prisma/client";

export type MitraItem = Item;

export interface MitraItemFormData {
  namaBarang: string;
  jumlahStok: number;
  hargaSatuan: number;
  fotoUrl: string;
}

export interface MitraItemWithStats extends Item {
  totalSales?: number;
  revenue?: number;
}

export type { ItemStatus };
