/**
 * ItemManagementTab Component
 * Tab untuk approve/reject barang
 */

"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PengurusItem } from "../types";
import { approveItem, rejectItem } from "../services/api";
import { formatCurrency } from "@/lib/cart-utils";

interface ItemManagementTabProps {
  items: PengurusItem[];
  showPendingOnly?: boolean;
  onItemUpdated: () => void;
}

export function ItemManagementTab({
  items,
  showPendingOnly = false,
  onItemUpdated,
}: ItemManagementTabProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filteredItems = showPendingOnly
    ? items.filter((item) => item.status === "PENDING")
    : items;

  const handleApprove = async (itemId: number) => {
    try {
      setLoadingId(itemId);
      await approveItem(itemId);
      onItemUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal approve barang");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (itemId: number) => {
    if (!confirm("Yakin ingin reject barang ini?")) return;

    try {
      setLoadingId(itemId);
      await rejectItem(itemId);
      onItemUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal reject barang");
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          {showPendingOnly ? "Tidak ada barang pending" : "Tidak ada barang"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
    >
      {filteredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
        >
          {/* Image */}
          <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {item.fotoUrl ? (
              <Image
                src={item.fotoUrl}
                alt={item.namaBarang}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              {item.status === "PENDING" && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              )}
              {item.status === "TERSEDIA" && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Tersedia
                </span>
              )}
              {item.status === "DITOLAK" && (
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Ditolak
                </span>
              )}
              {item.status === "HABIS" && (
                <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  Habis
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5">
            <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
              {item.namaBarang}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 flex items-center gap-1">
              <span className="text-gray-500">Stok:</span>
              <span className="font-semibold text-gray-800">
                {item.jumlahStok} unit
              </span>
            </p>

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(item.hargaSatuan)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  per item
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Mitra</p>
                <p className="font-semibold text-gray-700 text-xs sm:text-sm line-clamp-1 max-w-[100px]">
                  {item.mitra?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {item.status === "PENDING" && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApprove(item.id)}
                  disabled={loadingId === item.id}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{loadingId === item.id ? "..." : "Approve"}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReject(item.id)}
                  disabled={loadingId === item.id}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Reject</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
