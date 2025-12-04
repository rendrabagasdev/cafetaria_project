/**
 * PengurusReportPage Component
 * Laporan lengkap untuk Pengurus
 */

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  BarChart3,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/cart-utils";
import { SalesChart } from "@/features/mitra/components/SalesChart";
import { TopProductsChart } from "@/features/mitra/components/TopProductsChart";
import { MitraPerformanceChart } from "@/features/mitra/components/MitraPerformanceChart";
import { MitraRevenueTable } from "@/components/reports/MitraRevenueTable";

interface TopProduct {
  id: number;
  namaBarang: string;
  fotoUrl: string;
  soldInPeriod: number;
  revenueInPeriod: number;
}

interface MitraPerformance {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
  grossRevenue: number;
  paymentFee: number;
  platformFee: number;
  netRevenue: number;
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
    activeItems: number;
    lowStock: number;
    // Pembagian Hasil
    totalPaymentFee: number;
    totalNetRevenue: number;
    totalPlatformFee: number;
    totalMitraRevenue: number;
  };
  chartData: ChartDataPoint[];
  topProducts: TopProduct[];
  topMitras: MitraPerformance[];
  allMitras: MitraPerformance[];
  period: string;
}

type PeriodType = "today" | "week" | "month" | "year";

export function PengurusReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("week");

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/pengurus?period=${period}`);
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
    activeItems: 0,
    lowStock: 0,
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/dashboard/pengurus")}
                className="p-1.5 sm:p-2 hover:bg-green-50 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  Laporan Pengurus
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {session?.user?.name || "Pengurus"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-green-600 flex-shrink-0">
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
            <Calendar className="w-5 h-5 text-green-600" />
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
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {periodLabels[p]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-green-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
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
                <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalItems}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Produk
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-emerald-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.activeItems}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Produk Aktif
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-orange-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.lowStock}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Stok Menipis
            </p>
          </motion.div>
        </div>

        {/* Pembagian Hasil Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
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
              <p className="text-sm sm:text-base lg:text-xl font-bold text-blue-900 truncate">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>

            {/* Biaya Payment Gateway */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-orange-700 mb-1">
                Biaya Payment
              </p>
              <p className="text-sm sm:text-base lg:text-xl font-bold text-orange-900 truncate">
                {formatCurrency(stats.totalPaymentFee)}
              </p>
            </div>

            {/* Bagian Platform/Pengurus */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-700 mb-1">
                Bagian Pengurus
              </p>
              <p className="text-sm sm:text-base lg:text-xl font-bold text-green-900 truncate">
                {formatCurrency(stats.totalPlatformFee)}
              </p>
            </div>

            {/* Bagian Mitra */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-purple-700 mb-1">
                Bagian Mitra
              </p>
              <p className="text-sm sm:text-base lg:text-xl font-bold text-purple-900 truncate">
                {formatCurrency(stats.totalMitraRevenue)}
              </p>
            </div>
          </div>

          {/* Summary Formula */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-semibold">Formula:</span> Total Pendapatan -
              Biaya Payment = Pendapatan Bersih → Bagian Pengurus (10%) + Bagian
              Mitra (90%)
            </p>
          </div>
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {/* Sales Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Produk Terlaris
            </h3>
            <TopProductsChart products={reportData?.topProducts || []} />
          </motion.div>
        </div>

        {/* Mitra Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8"
        >
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
            Performa Mitra
          </h3>
          <MitraPerformanceChart mitras={reportData?.topMitras || []} />
        </motion.div>

        {/* Tabel Pendapatan Per Mitra */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Detail Pendapatan Per Mitra
            </h3>
          </div>
          <MitraRevenueTable mitras={reportData?.allMitras || []} />
        </motion.div>
      </div>
    </div>
  );
}
