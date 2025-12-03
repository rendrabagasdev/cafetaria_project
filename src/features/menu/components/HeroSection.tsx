/**
 * Hero Section Component
 * iOS-style hero dengan animasi dan gradient
 */

"use client";

import { motion } from "framer-motion";
import { Utensils, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full"
          >
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-bold text-sm sm:text-base">Cafetaria</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Menu Hari Ini
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
            Nikmati berbagai pilihan makanan dan minuman segar yang tersedia
            untuk Anda
          </p>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded max-w-xs mx-auto"
          />
        </motion.div>
      </div>
    </div>
  );
}
