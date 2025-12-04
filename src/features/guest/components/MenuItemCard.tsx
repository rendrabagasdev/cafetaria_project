"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Item } from "../types";

interface MenuItemCardProps {
  item: Item;
  index?: number;
  isBestSeller?: boolean;
}

export function MenuItemCard({
  item,
  index = 0,
  isBestSeller = false,
}: MenuItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all ${
        isBestSeller
          ? "border-2 border-yellow-400 relative"
          : "border border-gray-200"
      }`}
    >
      {isBestSeller && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full z-10 flex items-center gap-1">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="hidden sm:inline">#{index + 1} Best Seller</span>
          <span className="sm:hidden">#{index + 1}</span>
        </div>
      )}

      <div className="relative h-40 sm:h-56">
        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {item.jumlahStok < 5 && item.jumlahStok > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
          >
            <span className="hidden sm:inline">Stok Terbatas</span>
            <span className="sm:hidden">Terbatas</span>
          </motion.div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {item.namaBarang}
        </h3>
        <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-lg sm:text-2xl font-bold text-green-600"
          >
            Rp {item.hargaSatuan.toLocaleString("id-ID")}
          </motion.span>
          <span
            className={`text-xs sm:text-sm px-2 py-1 rounded-full whitespace-nowrap ${
              item.jumlahStok > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Stok: {item.jumlahStok}
          </span>
        </div>
        {item._count && item._count.transactionDetails > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1"
          >
            <span>🔥</span>
            <span className="hidden sm:inline">
              {item._count.transactionDetails} kali dipesan
            </span>
            <span className="sm:hidden">{item._count.transactionDetails}x</span>
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
