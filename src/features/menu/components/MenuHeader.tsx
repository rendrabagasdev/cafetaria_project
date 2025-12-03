/**
 * Menu Header Component
 * iOS-style sticky header dengan glass morphism
 */

"use client";

import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { ShoppingCart, LogOut, User } from "lucide-react";

interface MenuHeaderProps {
  userName?: string;
  cartCount: number;
  onCartClick: () => void;
}

export function MenuHeader({
  userName,
  cartCount,
  onCartClick,
}: MenuHeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Logo & User Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
              Menu Cafetaria
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {userName || "Guest"}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0">
            {/* Cart Button - iOS Style */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl transition-all font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-2xl text-sm sm:text-base"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg ring-2 ring-white"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Logout Button - iOS Style */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl sm:rounded-2xl transition-all font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-2xl text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
