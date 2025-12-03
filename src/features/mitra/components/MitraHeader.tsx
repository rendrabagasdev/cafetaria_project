/**
 * MitraHeader Component
 * Header dengan animasi untuk dashboard mitra
 */

"use client";

import { motion } from "framer-motion";
import { Package, Plus, LogOut, BarChart3 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MitraHeaderProps {
  mitraName?: string;
  onAddItem: () => void;
}

export function MitraHeader({ mitraName, onAddItem }: MitraHeaderProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="flex items-center justify-between gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 sm:gap-3 min-w-0"
          >
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-2xl font-bold truncate">
                Dashboard Mitra
              </h1>
              {mitraName && (
                <p className="text-emerald-100 text-xs sm:text-sm truncate">
                  Selamat datang, {mitraName}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/mitra/laporan")}
              className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-white/30 transition-colors"
              title="Laporan"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm lg:text-base">
                Laporan
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddItem}
              className="flex items-center gap-1 sm:gap-2 bg-white text-emerald-600 px-2 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              title="Tambah Barang"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm lg:text-base">
                Tambah
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-white/30 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-sm lg:text-base">
                Keluar
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
