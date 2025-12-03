/**
 * Validation Utilities
 *
 * Common validation functions for API requests
 */

import { PaymentMethod, TransactionStatus } from "@prisma/client";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number (format: 08XX or 628XX)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(08|628)\d{8,12}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ""));
}

/**
 * Sanitize user input (prevent XSS)
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove potential HTML tags
}

/**
 * Validate payment method
 */
export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return ["QRIS", "CASH"].includes(method);
}

/**
 * Validate transaction status
 */
export function isValidTransactionStatus(
  status: string
): status is TransactionStatus {
  return [
    "PENDING",
    "SETTLEMENT",
    "EXPIRE",
    "CANCEL",
    "CASH",
    "COMPLETED",
    "REJECTED",
  ].includes(status);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Validate quantity (positive integer)
 */
export function isValidQuantity(value: any): boolean {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate;
}

/**
 * Parse date string to Date object (with validation)
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
