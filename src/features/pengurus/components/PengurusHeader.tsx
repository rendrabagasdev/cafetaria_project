/**
 * PengurusHeader Component
 * Responsive header dengan navigasi untuk dashboard pengurus
 */

"use client";

import { motion } from "framer-motion";
import { Shield, Settings, LogOut, FileText } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface PengurusHeaderProps {
  pengurusName?: string;
}

export function PengurusHeader({ pengurusName }: PengurusHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-white/20 p-2.5 sm:p-3 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard Pengurus</h1>
              {pengurusName && (
                <p className="text-green-100 text-sm sm:text-base">Selamat datang, {pengurusName}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 sm:gap-3"
          >
            <Link href="/dashboard/pengurus/laporan" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Laporan</span>
              </motion.button>
            </Link>

            <Link href="/dashboard/pengurus/settings" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium hover:bg-white/30 transition-colors text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Pengaturan</span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-red-500/90 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Keluar</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
