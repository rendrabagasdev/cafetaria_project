/**
 * ItemCard Component
 * Card dengan animasi untuk menampilkan item mitra
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Edit, Trash2, Package, DollarSign, Clock } from "lucide-react";
import { MitraItem } from "../types";
import { formatCurrency } from "@/lib/cart-utils";
import { formatDate } from "@/lib/date-utils";

interface ItemCardProps {
  item: MitraItem;
  index: number;
  onEdit: (item: MitraItem) => void;
  onDelete: (itemId: number) => void;
}

const statusColors = {
  TERSEDIA: "bg-green-100 text-green-800",
  HABIS: "bg-red-100 text-red-800",
  MENUNGGU_KONFIRMASI: "bg-yellow-100 text-yellow-800",
  DITOLAK: "bg-gray-100 text-gray-800",
  PENDING: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  TERSEDIA: "Tersedia",
  HABIS: "Habis",
  MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
  DITOLAK: "Ditolak",
  PENDING: "Pending",
};

export function ItemCard({ item, index, onEdit, onDelete }: ItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 lg:h-48 bg-gradient-to-br from-emerald-50 to-green-50">
        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className="object-cover"
        />

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
              item.jumlahStok === 0
                ? statusColors.HABIS
                : statusColors[item.status as keyof typeof statusColors]
            }`}
          >
            {item.jumlahStok === 0
              ? "Habis"
              : statusLabels[item.status as keyof typeof statusLabels]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-5">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
          {item.namaBarang}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 min-w-0">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              Stok: {item.jumlahStok}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 min-w-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 truncate">
              {formatCurrency(Number(item.hargaSatuan))}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 text-xs mb-3 sm:mb-4">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {formatDate(new Date(item.createdAt))}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Edit</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm(`Hapus ${item.namaBarang}?`)) {
                onDelete(item.id);
              }
            }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-red-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Hapus</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
