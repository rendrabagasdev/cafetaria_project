/**
 * Fee Calculator Library
 *
 * Calculates payment fees, platform commission, and mitra revenue
 * Always reads fee percentages from Settings table (NEVER hardcode!)
 */

import { Decimal } from "@prisma/client/runtime/library";
import { getSettings } from "./settings";
import { PaymentMethod } from "@prisma/client";

export interface FeeCalculation {
  grossAmount: Decimal; // Total sebelum potongan
  paymentFee: Decimal; // Biaya payment gateway (QRIS saja)
  netAmount: Decimal; // Setelah potong payment fee
  platformFee: Decimal; // Komisi platform (10%)
  mitraRevenue: Decimal; // Pendapatan mitra (yang diterima partner)
}

/**
 * Calculate all fees based on Settings configuration
 *
 * @param grossAmount - Total belanja sebelum potongan
 * @param paymentMethod - QRIS atau CASH
 * @returns Complete fee breakdown
 *
 * @example
 * const fees = await calculateFees(50000, 'QRIS');
 * // Result:
 * // {
 * //   grossAmount: 50000,
 * //   paymentFee: 350,      // 50000 × 0.7%
 * //   netAmount: 49650,     // 50000 - 350
 * //   platformFee: 4965,    // 49650 × 10%
 * //   mitraRevenue: 44685   // 49650 - 4965
 * // }
 */
export async function calculateFees(
  grossAmount: number | Decimal,
  paymentMethod: PaymentMethod
): Promise<FeeCalculation> {
  // Get fee percentages from Settings
  const settings = await getSettings();

  // Convert to Decimal for precision
  const gross = new Decimal(grossAmount);

  // Step 1: Calculate payment gateway fee (QRIS only)
  const paymentFee =
    paymentMethod === "QRIS"
      ? gross
          .mul(settings.qrisFeePercent)
          .div(100)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP) // Round to nearest Rupiah
      : new Decimal(0);

  // Step 2: Calculate net amount (after payment fee)
  const netAmount = gross.sub(paymentFee);

  // Step 3: Calculate platform commission (from net amount)
  const platformFee = netAmount
    .mul(settings.platformCommissionPercent)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  // Step 4: Calculate mitra revenue (final payout to partner)
  const mitraRevenue = netAmount.sub(platformFee);

  return {
    grossAmount: gross,
    paymentFee,
    netAmount,
    platformFee,
    mitraRevenue,
  };
}

/**
 * Format Decimal to Rupiah string
 *
 * @example
 * formatRupiah(50000) // "Rp 50.000"
 */
export function formatRupiah(amount: number | Decimal): string {
  const value = typeof amount === "number" ? amount : amount.toNumber();
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate total from cart items
 */
export function calculateCartTotal(
  items: Array<{ hargaSatuan: number | Decimal; quantity: number }>
): Decimal {
  return items.reduce((total, item) => {
    // Validate item has required properties
    if (!item || item.hargaSatuan === undefined || item.hargaSatuan === null) {
      console.error("[fee-calculator] Invalid item:", item);
      throw new Error("Item hargaSatuan is required");
    }
    if (!item.quantity || item.quantity <= 0) {
      console.error("[fee-calculator] Invalid quantity:", item);
      throw new Error("Item quantity must be greater than 0");
    }

    const price = new Decimal(item.hargaSatuan);
    const subtotal = price.mul(item.quantity);
    return total.add(subtotal);
  }, new Decimal(0));
}
