/**
 * TabNavigation Component
 * Responsive tab navigation dengan animasi dan horizontal scroll di mobile
 */

"use client";

import { motion } from "framer-motion";
import { Package, Clock, Receipt, Users } from "lucide-react";
import { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

const tabs = [
  { id: "pending" as TabType, label: "Pending Approval", shortLabel: "Pending", icon: Clock },
  { id: "items" as TabType, label: "Semua Barang", shortLabel: "Items", icon: Package },
  { id: "transactions" as TabType, label: "Transaksi", shortLabel: "Trans", icon: Receipt },
  { id: "users" as TabType, label: "Pengguna", shortLabel: "Users", icon: Users },
];

export function TabNavigation({
  activeTab,
  onTabChange,
  pendingCount = 0,
}: TabNavigationProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1.5 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(tab.id)}
              className="relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl shadow-md"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div
                className={`relative px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
                  isActive ? "text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
                {tab.id === "pending" && pendingCount > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
