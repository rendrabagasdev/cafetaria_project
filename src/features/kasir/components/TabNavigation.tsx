"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Clock } from "lucide-react";

interface TabNavigationProps {
  activeTab: "menu" | "pending";
  onTabChange: (tab: "menu" | "pending") => void;
  pendingCount?: number;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  pendingCount = 0,
}: TabNavigationProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTabChange("menu")}
        className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "menu"
            ? "text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {activeTab === "menu" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Menu
        </span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTabChange("pending")}
        className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "pending"
            ? "text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {activeTab === "pending" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending
          {pendingCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "pending"
                  ? "bg-white text-emerald-600"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {pendingCount}
            </motion.span>
          )}
        </span>
      </motion.button>
    </div>
  );
}
