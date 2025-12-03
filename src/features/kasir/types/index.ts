import { PaymentMethod, TransactionStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Item sesuai Prisma schema
export interface Item {
  id: number;
  namaBarang: string;
  fotoUrl: string;
  jumlahStok: number;
  hargaSatuan: Decimal | number;
}

// Cart item untuk local state
export interface CartItem {
  item: Item;
  quantity: number;
}

// Transaction detail sesuai Prisma schema
export interface TransactionDetailWithItem {
  id: number;
  transactionId: number;
  itemId: number;
  jumlah: number; // Prisma field name
  quantity: number; // Alias untuk komponen
  hargaSatuan: Decimal | number;
  subtotal: Decimal | number;
  stokSebelum?: number;
  stokSesudah?: number;
  item?: {
    id: number;
    namaBarang: string;
    hargaSatuan: Decimal | number;
  };
}

// Pending transaction (PENDING status)
export interface PendingTransaction {
  id: number;
  grossAmount: Decimal | number;
  netAmount: Decimal | number;
  mitraRevenue: Decimal | number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  customerName: string | null;
  createdAt: Date;
  details: TransactionDetailWithItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Transaction response dari API
export interface TransactionResponse {
  id: number;
  grossAmount: Decimal | number;
  netAmount?: Decimal | number;
  mitraRevenue?: Decimal | number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: Date | string;
  customerName?: string | null;
  qrisUrl?: string | null;
  paymentExpireAt?: Date | string | null;
  midtransOrderId?: string | null;
  details?: TransactionDetailWithItem[];
}
