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
      className={`group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all relative ${
        isBestSeller
          ? "ring-2 ring-yellow-400 ring-offset-2"
          : "border border-gray-200"
      }`}
    >
      {/* Best Seller Badge */}
      {isBestSeller && bestSellerRank && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 shadow-xl"
        >
          <Star className="w-3.5 h-3.5 fill-white" />#{bestSellerRank} Best
        </motion.div>
      )}

      {/* Stock Warning Badge */}
      {isLowStock && !isBestSeller && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-xl z-10 flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Terbatas
        </div>
      )}

      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-xl z-10">
          Habis
        </div>
      )}

      {/* Image with Overlay */}
      <div className="relative h-36 sm:h-48 lg:h-56 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">HABIS</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors leading-tight">
          {item.namaBarang}
        </h3>

        <div className="flex justify-between items-center gap-2">
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(Number(item.hargaSatuan))}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold whitespace-nowrap">
            Stok: {item.jumlahStok}
          </span>
        </div>

        {/* Transaction Count */}
        {item._count && item._count.transactionDetails > 0 && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit">
            <Flame className="w-3.5 h-3.5" />
            {item._count.transactionDetails}x dipesan
          </div>
        )}

        {/* Add to Cart Button - iOS Style */}
        <motion.button
          whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
          whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg ${
            isBestSeller && !isOutOfStock
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white hover:shadow-2xl"
              : isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-2xl"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          {isOutOfStock ? "Habis" : "+ Keranjang"}
        </motion.button>
      </div>
    </motion.div>
  );
}
