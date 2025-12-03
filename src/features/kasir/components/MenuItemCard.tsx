"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Item } from "../types";

interface MenuItemCardProps {
  item: Item;
  index: number;
  onAddToCart: (item: Item) => void;
}

export function MenuItemCard({ item, index, onAddToCart }: MenuItemCardProps) {
  const isOutOfStock = item.jumlahStok <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
        isOutOfStock
          ? "border-gray-200 opacity-60"
          : "border-transparent hover:border-teal-500 hover:shadow-xl"
      }`}
    >
      <div className="relative h-40">
        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {item.jumlahStok < 10 && item.jumlahStok > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Stok: {item.jumlahStok}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              HABIS
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-gray-900 mb-2 truncate">
          {item.namaBarang}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-teal-600">
            Rp {item.hargaSatuan.toLocaleString("id-ID")}
          </span>
          <motion.button
            whileHover={{ scale: isOutOfStock ? 1 : 1.1 }}
            whileTap={{ scale: isOutOfStock ? 1 : 0.9 }}
            onClick={() => !isOutOfStock && onAddToCart(item)}
            disabled={isOutOfStock}
            className={`p-2 rounded-lg transition-colors ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
