/**
 * StatsSection Component
 * Stats overview dengan animasi
 */

"use client";

import { motion } from "framer-motion";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { MitraItem } from "../types";

interface StatsSectionProps {
  items: MitraItem[];
}

export function StatsSection({ items }: StatsSectionProps) {
  const stats = {
    total: items.length,
    tersedia: items.filter((i) => i.status === "TERSEDIA").length,
    pending: items.filter(
      (i) => i.status === "MENUNGGU_KONFIRMASI" || i.status === "PENDING"
    ).length,
    habis: items.filter((i) => i.status === "HABIS").length,
  };

  const statCards = [
    {
      label: "Total Barang",
      value: stats.total,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Tersedia",
      value: stats.tersedia,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Menunggu",
      value: stats.pending,
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Habis",
      value: stats.habis,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 lg:p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-500 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 truncate">
                {stat.label}
              </p>
              <p
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.textColor} truncate`}
              >
                {stat.value}
              </p>
            </div>

            <div
              className={`${stat.bgColor} p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl flex-shrink-0`}
            >
              <stat.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${stat.textColor}`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
