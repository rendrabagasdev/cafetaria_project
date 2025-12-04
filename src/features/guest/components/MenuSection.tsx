"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Item } from "../types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuSectionProps {
  items: Item[];
  bestSellers: Item[];
  loading: boolean;
}

export function MenuSection({ items, bestSellers, loading }: MenuSectionProps) {
  const [showFullMenu, setShowFullMenu] = useState(false);

  if (loading) {
    return (
      <section id="menu" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Menu Hari Ini
            </h2>
            <p className="text-lg text-gray-600">
              Lihat menu yang tersedia dan stoknya
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Menu Hari Ini
          </h2>
          <p className="text-lg text-gray-600">
            Lihat menu yang tersedia dan stoknya
          </p>
        </motion.div>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-3xl font-bold text-gray-900">
                  Best Sellers
                </h3>
              </motion.div>
              <div className="h-1 flex-1 bg-gradient-to-r from-yellow-400 to-transparent rounded"></div>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {bestSellers.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  isBestSeller
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Menu Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Full Menu</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFullMenu(!showFullMenu)}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center gap-2 shadow-md"
            >
              {showFullMenu ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Sembunyikan
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Lihat Semua Menu
                </>
              )}
            </motion.button>
          </div>

          {showFullMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500 text-lg">
                    Belum ada menu tersedia saat ini.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item, index) => (
                    <MenuItemCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
