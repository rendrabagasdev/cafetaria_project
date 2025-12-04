/**
 * Hero Section Component
 * iOS-style hero dengan animasi dan gradient
 */

"use client";

import { motion } from "framer-motion";
import { Utensils, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Animated Background Decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-orange-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-emerald-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Food Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 text-6xl"
        >
          🍕
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, -5, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-32 right-1/4 text-5xl"
        >
          🍔
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-32 left-1/3 text-5xl"
        >
          🥤
        </motion.div>
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, -8, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-24 right-1/3 text-6xl"
        >
          🍰
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, delay: 0.2 }}
            className="inline-flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-5 sm:px-7 py-3 sm:py-4 rounded-full shadow-2xl border border-white/30"
          >
            <Utensils className="w-5 h-5 sm:w-7 sm:h-7 animate-bounce" />
            <span className="font-black text-sm sm:text-lg tracking-wide">
              Cafetaria
            </span>
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
          </motion.div>

          {/* Title with Gradient Animation */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
          >
            <span className="inline-block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-pulse">
              Menu Hari Ini
            </span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="inline-block ml-4 text-5xl sm:text-6xl md:text-7xl"
            >
              ✨
            </motion.span>
          </motion.h1>

          {/* Description with better styling */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed px-4 font-medium"
          >
            Nikmati berbagai pilihan{" "}
            <span className="font-bold text-yellow-300">makanan</span> dan{" "}
            <span className="font-bold text-yellow-300">minuman segar</span>{" "}
            yang tersedia untuk Anda 🎉
          </motion.p>

          {/* Decorative Elements */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
          >
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-white/50 to-white rounded" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"
            />
            <div className="flex-1 h-1 bg-gradient-to-l from-transparent via-white/50 to-white rounded" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
