/**
 * MitraReportPage Component
 * Laporan individual untuk produk-produk mitra
 */

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/cart-utils";
import Image from "next/image";
import { SalesChart } from "./SalesChart";
import { TopProductsChart } from "./TopProductsChart";

interface ProductReport {
  id: number;
  namaBarang: string;
  fotoUrl: string;
  jumlahStok: number;
  hargaSatuan: number;
  status: string;
  soldInPeriod: number;
  revenueInPeriod: number;
  totalSales: number;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  quantity: number;
}

interface ReportData {
  stats: {
    totalProducts: number;
    totalStock: number;
    totalSold: number;
    totalRevenue: number;
  };
  products: ProductReport[];
  chartData: ChartDataPoint[];
  topProducts: ProductReport[];
  period: string;
}

type PeriodType = "today" | "week" | "month" | "year";

export function MitraReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("week");
  const [filter, setFilter] = useState<"all" | "best" | "low">("all");

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/mitra?period=${period}`);
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

  const filteredProducts =
    reportData?.products.filter((p) => {
      if (filter === "best") return p.soldInPeriod > 0;
      if (filter === "low") return p.jumlahStok < 5;
      return true;
    }) || [];

  const stats = reportData?.stats || {
    totalProducts: 0,
    totalStock: 0,
    totalSold: 0,
    totalRevenue: 0,
  };

  const periodLabels: Record<PeriodType, string> = {
    today: "Hari Ini",
    week: "7 Hari Terakhir",
    month: "30 Hari Terakhir",
    year: "1 Tahun Terakhir",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/dashboard/mitra")}
                className="p-1.5 sm:p-2 hover:bg-emerald-50 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  Laporan Produk
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {session?.user?.name || "Mitra"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 flex-shrink-0">
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
            <Calendar className="w-5 h-5 text-emerald-600" />
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
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
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
              <div className="bg-emerald-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalProducts}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Produk
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
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalStock}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Total Stok
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-orange-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {stats.totalSold}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Terjual ({periodLabels[period]})
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="bg-green-100 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">
              {formatCurrency(stats.totalRevenue)}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Pendapatan ({periodLabels[period]})
            </p>
          </motion.div>
        </div>

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

        {/* Filter */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            Filter
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("all")}
              className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua Produk
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("best")}
              className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                filter === "best"
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Best Seller
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter("low")}
              className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                filter === "low"
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Stok Menipis
            </motion.button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 lg:p-6 border-b">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              Detail Produk ({filteredProducts.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700">
                    Produk
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700">
                    Stok
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-700">
                    Harga
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700">
                    Terjual
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-700">
                    Pendapatan
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => {
                  const sold = product.soldInPeriod;
                  const revenue = product.revenueInPeriod;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.fotoUrl}
                              alt={product.namaBarang}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium text-gray-900 line-clamp-2">
                            {product.namaBarang}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                            product.jumlahStok === 0
                              ? "bg-red-100 text-red-800"
                              : product.jumlahStok < 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.jumlahStok}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(Number(product.hargaSatuan))}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          {sold}x
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-bold text-green-600">
                        {formatCurrency(revenue)}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                        <span
                          className={`inline-flex px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                            product.jumlahStok === 0
                              ? "bg-red-100 text-red-800"
                              : product.status === "TERSEDIA"
                              ? "bg-green-100 text-green-800"
                              : product.status === "MENUNGGU_KONFIRMASI"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.jumlahStok === 0
                            ? "Habis"
                            : product.status === "TERSEDIA"
                            ? "Tersedia"
                            : product.status === "MENUNGGU_KONFIRMASI"
                            ? "Menunggu"
                            : product.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  Tidak ada produk
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
