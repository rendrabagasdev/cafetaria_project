/**
 * Menu Item Card Component
 * iOS-style card dengan animasi Framer Motion
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MenuItem } from "../types";
import { formatCurrency } from "@/lib/cart-utils";
import { Star, ShoppingCart, Flame } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  isBestSeller?: boolean;
  bestSellerRank?: number;
}

export function MenuItemCard({
  item,
  onAddToCart,
  isBestSeller = false,
  bestSellerRank,
}: MenuItemCardProps) {
  const handleAddToCart = () => {
    if (item.jumlahStok === 0) return;
    onAddToCart(item);
  };

  const isOutOfStock = item.jumlahStok === 0;
  const isLowStock = item.jumlahStok < 5 && item.jumlahStok > 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl transition-all ${
        isBestSeller
          ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 shadow-xl shadow-yellow-200/50 hover:shadow-2xl hover:shadow-yellow-300/60 ring-2 ring-yellow-400"
          : "bg-gradient-to-br from-white via-green-50/30 to-white shadow-lg shadow-green-100/50 hover:shadow-2xl hover:shadow-green-200/60 border border-green-100"
      }`}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-emerald-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Best Seller Badge */}
      {isBestSeller && bestSellerRank && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10"
        >
          <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-lg">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white animate-pulse" />
            <span className="hidden sm:inline">#{bestSellerRank} Best</span>
            <span className="sm:hidden">#{bestSellerRank}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
          </div>
        </motion.div>
      )}

      {/* Stock Warning Badge */}
      {isLowStock && !isBestSeller && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10"
        >
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 animate-bounce" />
            <span className="hidden sm:inline">Terbatas</span>
          </div>
        </motion.div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-xl z-10">
          Habis
        </div>
      )}

      {/* Image with Overlay */}
      <div className="relative h-32 sm:h-48 lg:h-56 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 overflow-hidden">
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />

        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className={`object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">HABIS</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-3">
        <h3 className="text-xs sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
          {item.namaBarang}
        </h3>

        <div className="flex justify-between items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <div className="text-base sm:text-2xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatCurrency(Number(item.hargaSatuan))}
            </div>
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-full" />
          </div>
          <div className="relative">
            <div className="text-[10px] sm:text-sm text-gray-700 bg-gradient-to-br from-green-100 via-emerald-100 to-green-100 border border-green-200 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full font-bold whitespace-nowrap shadow-sm">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Stok: {item.jumlahStok}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        {item._count && item._count.transactionDetails > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full w-fit shadow-md"
          >
            <Flame className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-pulse" />
            <span className="hidden sm:inline">
              {item._count.transactionDetails}x dipesan
            </span>
            <span className="sm:hidden">{item._count.transactionDetails}x</span>
          </motion.div>
        )}

        {/* Add to Cart Button - iOS Style */}
        <motion.button
          whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
          whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`relative w-full py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden group/btn ${
            isBestSeller && !isOutOfStock
              ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/60"
              : isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-md"
              : "bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60"
          }`}
        >
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          )}
          <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 relative z-10" />
          <span className="relative z-10">
            {isOutOfStock ? "Habis" : "+ Keranjang"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
