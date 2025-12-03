"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Settings } from "../types";

interface HeroSectionProps {
  settings: Settings | null;
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-emerald-50/30 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
        >
          {settings?.heroTitle || "Selamat Datang di Cafetaria Kami"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          {settings?.heroDescription ||
            "Nikmati berbagai pilihan makanan dan minuman segar dengan harga terjangkau. Pesan sekarang dan ambil di cafetaria!"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-4 flex-wrap"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Mulai Pesan Sekarang
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="#menu"
              className="px-8 py-3 bg-white text-green-600 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border-2 border-green-600"
            >
              Lihat Menu
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
