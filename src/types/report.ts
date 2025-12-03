/**
 * Report Types
 * Centralized type definitions for all report-related data
 */

export interface TransactionDetail {
  id: number;
  itemId: number;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
  item: {
    namaBarang: string;
  };
}

export interface Transaction {
  id: number;
  totalHarga: number;
  status: string;
  createdAt: string;
  customerName: string | null;
  customerLocation: string | null;
  details: TransactionDetail[];
}

export interface DailyReport {
  date: string;
  dayName: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  transactions: Transaction[];
  topItems: Array<{
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    count: number;
    sales: number;
  }>;
}

export interface RangeReport {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  data: Array<{
    period: string;
    totalSales: number;
    transactionCount: number;
  }>;
}

export type FilterMode = "single" | "range";
export type Period = "daily" | "monthly" | "yearly";

export interface ReportTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}
