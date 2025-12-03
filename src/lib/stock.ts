/**
 * Stock Management Library
 *
 * Handles atomic stock deduction with audit trail
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface StockSnapshot {
  stokSebelum: number;
  stokSesudah: number;
}

/**
 * Deduct stock atomically with validation
 *
 * @param itemId - Item ID to deduct stock from
 * @param quantity - Amount to deduct
 * @param tx - Prisma transaction client (optional)
 * @returns Stock snapshot (before and after)
 * @throws Error if item not found or insufficient stock
 */
export async function deductStock(
  itemId: number,
  quantity: number,
  tx: any = prisma
): Promise<StockSnapshot> {
  // Get current item state
  const item = await tx.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error(`Item dengan ID ${itemId} tidak ditemukan`);
  }

  // Validate stock availability
  if (item.jumlahStok < quantity) {
    throw new Error(
      `Stok tidak cukup untuk ${item.namaBarang}. ` +
        `Tersedia: ${item.jumlahStok}, Diminta: ${quantity}`
    );
  }

  // Deduct stock
  await tx.item.update({
    where: { id: itemId },
    data: {
      jumlahStok: {
        decrement: quantity,
      },
    },
  });

  return {
    stokSebelum: item.jumlahStok,
    stokSesudah: item.jumlahStok - quantity,
  };
}

/**
 * Restore stock (for cancelled transactions)
 *
 * @param itemId - Item ID to restore stock to
 * @param quantity - Amount to restore
 * @param tx - Prisma transaction client (optional)
 */
export async function restoreStock(
  itemId: number,
  quantity: number,
  tx: any = prisma
): Promise<void> {
  await tx.item.update({
    where: { id: itemId },
    data: {
      jumlahStok: {
        increment: quantity,
      },
    },
  });
}

/**
 * Check stock availability for multiple items
 *
 * @param items - Array of {itemId, quantity}
 * @returns Array of items with insufficient stock (empty if all OK)
 */
export async function checkStockAvailability(
  items: Array<{ itemId: number; quantity: number }>
): Promise<
  Array<{
    itemId: number;
    namaBarang: string;
    available: number;
    requested: number;
  }>
> {
  const insufficientStock = [];

  for (const { itemId, quantity } of items) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      insufficientStock.push({
        itemId,
        namaBarang: "Unknown",
        available: 0,
        requested: quantity,
      });
      continue;
    }

    if (item.jumlahStok < quantity) {
      insufficientStock.push({
        itemId,
        namaBarang: item.namaBarang,
        available: item.jumlahStok,
        requested: quantity,
      });
    }
  }

  return insufficientStock;
}

/**
 * Get low stock items (below threshold)
 *
 * @param threshold - Stock level threshold (default: 5)
 * @returns Items with stock below threshold
 */
export async function getLowStockItems(threshold: number = 5) {
  return await prisma.item.findMany({
    where: {
      jumlahStok: {
        lte: threshold,
      },
      status: "TERSEDIA",
    },
    include: {
      mitra: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      jumlahStok: "asc",
    },
  });
}
