/**
 * Best Sellers Section Component
 * iOS-style best sellers dengan animasi
 */

"use client";

import { motion } from "framer-motion";
import { Star, Flame } from "lucide-react";
import { MenuItem } from "../types";
import { MenuItemCard } from "./MenuItemCard";

interface BestSellersSectionProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export function BestSellersSection({
  items,
  onAddToCart,
}: BestSellersSectionProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 sm:mb-16"
    >
      {/* Section Header - Enhanced iOS Style */}
      <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
          className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl shadow-yellow-500/50"
        >
          <Star className="w-6 h-6 sm:w-9 sm:h-9 text-white fill-white animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl sm:rounded-3xl" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Best Sellers
            </h2>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-2xl sm:text-3xl"
            >
              🔥
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 animate-bounce" />
            <p className="text-xs sm:text-sm text-gray-700 font-semibold">
              Produk paling{" "}
              <span className="text-orange-600 font-black">LARIS</span> minggu
              ini!
            </p>
          </div>
        </div>
      </div>

      {/* Items Grid - Responsive */}
      <div className="grid gap-3 sm:gap-5 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MenuItemCard
              item={item}
              onAddToCart={onAddToCart}
              isBestSeller
              bestSellerRank={index + 1}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
