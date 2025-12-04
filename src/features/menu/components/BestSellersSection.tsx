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
      {/* Section Header - iOS Style */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2.5 sm:p-3 rounded-2xl shadow-xl"
        >
          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Best Sellers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
            Produk paling laris minggu ini
          </p>
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
