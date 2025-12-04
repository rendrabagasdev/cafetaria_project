/**
 * Full Menu Section Component
 * iOS-style menu dengan search dan grid cards
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, X } from "lucide-react";
import { MenuItem } from "../types";
import { MenuItemCard } from "./MenuItemCard";

interface FullMenuSectionProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FullMenuSection({
  items,
  onAddToCart,
  searchQuery,
  onSearchChange,
}: FullMenuSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Section Header with Search - Enhanced iOS Style */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.3, bounce: 0.6 }}
            className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl shadow-green-500/50"
          >
            <Package className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl sm:rounded-3xl" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Semua Menu
              </h2>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-2xl sm:text-3xl"
              >
                🍽️
              </motion.div>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 font-semibold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-black">
                {items.length} produk
              </span>{" "}
              {searchQuery ? "ditemukan" : "tersedia"} untuk Anda
            </p>
          </div>
        </div>

        {/* Search Bar - Enhanced iOS Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="relative group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari menu favorit..."
              className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm sm:text-base outline-none shadow-xl shadow-green-100/50 font-medium placeholder:text-gray-400"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSearchChange("")}
                className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full transition-all shadow-lg"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {searchQuery && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs sm:text-sm text-gray-600 mt-3 ml-1 font-medium"
            >
              Mencari:{" "}
              <span className="font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                &ldquo;{searchQuery}&rdquo;
              </span>
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Menu Grid */}
      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-lg"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              ) : (
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              )}
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Belum ada menu tersedia saat ini"}
            </p>
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSearchChange("")}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Hapus Pencarian
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MenuItemCard item={item} onAddToCart={onAddToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
