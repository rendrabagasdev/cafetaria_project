"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "../types";

interface HeaderProps {
  settings: Settings | null;
}

export function Header({ settings }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            {settings?.logoUrl ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                <Image
                  src={settings.logoUrl}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">
                  {settings?.cafeteriaName?.[0] || "C"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {settings?.cafeteriaName || "Cafetaria"}
              </h1>
              <p className="text-xs text-gray-500">
                {settings?.cafeteriaTagline || "Delicious & Fresh"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex gap-3"
          >
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
              >
                Daftar
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
