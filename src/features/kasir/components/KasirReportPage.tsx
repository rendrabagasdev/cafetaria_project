/**
 * KasirReportPage Component
 * Laporan untuk Kasir dengan grafik
 */

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/cart-utils";
import { SalesChart } from "@/features/mitra/components/SalesChart";
import { TopProductsChart } from "@/features/mitra/components/TopProductsChart";

interface TopProduct {
  id: number;
  namaBarang: string;
  fotoUrl: string;
  soldInPeriod: number;
  revenueInPeriod: number;
}

interface Transaction {
  id: number;
  createdAt: Date;
  customerName: string;
  total: number;
  itemCount: number;
  status: string;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  quantity: number;
}

interface ReportData {
  stats: {
    totalTransactions: number;
    totalRevenue: number;
    totalItems: number;
    averageTransaction: number;
    // Pembagian Hasil
    totalPaymentFee: number;
    totalNetRevenue: number;
    totalPlatformFee: number;
    totalMitraRevenue: number;
  };
  chartData: ChartDataPoint[];
  topProducts: TopProduct[];
  recentTransactions: Transaction[];
  period: string;
}

type PeriodType = "today" | "week" | "month" | "year";

export function KasirReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("week");

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/kasir?period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const stats = reportData?.stats || {
    totalTransactions: 0,
    totalRevenue: 0,
    totalItems: 0,
    averageTransaction: 0,
    totalPaymentFee: 0,
    totalNetRevenue: 0,
    totalPlatformFee: 0,
    totalMitraRevenue: 0,
  };

  const periodLabels: Record<PeriodType, string> = {
    today: "Hari Ini",
    week: "7 Hari Terakhir",
    month: "30 Hari Terakhir",
    year: "1 Tahun Terakhir",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/dashboard/kasir")}
                className="p-1.5 sm:p-2 hover:bg-teal-50 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  Laporan Penjualan
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {session?.user?.name || "Kasir"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-teal-600 flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Period Filter */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Periode Laporan
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {(["today", "week", "month", "year"] as PeriodType[]).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  period === p
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {periodLabels[p]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-teal-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalTransactions}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Transaksi
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-blue-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Pendapatan
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-purple-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalItems}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Item Terjual
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-cyan-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-600" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
              {formatCurrency(stats.averageTransaction)}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Rata-rata / Transaksi
            </p>
          </motion.div>
        </div>

        {/* Pembagian Hasil Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Pembagian Hasil
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Pendapatan Kotor */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-700 mb-1">
                Total Pendapatan
              </p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-900 truncate">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>

            {/* Biaya Payment Gateway */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-orange-700 mb-1">
                Biaya Payment
              </p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-orange-900 truncate">
                {formatCurrency(stats.totalPaymentFee)}
              </p>
            </div>

            {/* Bagian Platform */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-700 mb-1">
                Bagian Platform
              </p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-green-900 truncate">
                {formatCurrency(stats.totalPlatformFee)}
              </p>
            </div>

            {/* Bagian Mitra */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-purple-700 mb-1">
                Bagian Mitra
              </p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-900 truncate">
                {formatCurrency(stats.totalMitraRevenue)}
              </p>
            </div>
          </div>

          {/* Summary Formula */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-semibold">Pembagian:</span> Total Pendapatan
              - Biaya Payment = Pendapatan Bersih → Platform (10%) + Mitra (90%)
            </p>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {/* Sales Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Tren Penjualan
            </h3>
            <SalesChart data={reportData?.chartData || []} period={period} />
          </motion.div>

          {/* Top Products Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Produk Terlaris
            </h3>
            <TopProductsChart products={reportData?.topProducts || []} />
          </motion.div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              Transaksi Terbaru
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700">
                    Tanggal
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700">
                    Items
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData?.recentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-teal-50/50 transition-colors"
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <span className="font-mono text-xs text-gray-600">
                        #{transaction.id}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <span className="text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                      <span className="font-medium text-gray-900">
                        {transaction.customerName}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                        {transaction.itemCount} items
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-bold text-teal-600">
                      {formatCurrency(transaction.total)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {(!reportData?.recentTransactions ||
              reportData.recentTransactions.length === 0) && (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  Tidak ada transaksi
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
