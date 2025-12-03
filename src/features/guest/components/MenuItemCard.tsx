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
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          #{index + 1} Best Seller
        </div>
      )}

      <div className="relative h-56">
        <Image
          src={item.fotoUrl}
          alt={item.namaBarang}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {item.jumlahStok < 5 && item.jumlahStok > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
          >
            Stok Terbatas
          </motion.div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {item.namaBarang}
        </h3>
        <div className="flex justify-between items-center mb-3">
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-green-600"
          >
            Rp {item.hargaSatuan.toLocaleString("id-ID")}
          </motion.span>
          <span
            className={`text-sm px-2 py-1 rounded-full ${
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
            className="text-xs text-gray-500 flex items-center gap-1"
          >
            <span>🔥</span>
            {item._count.transactionDetails} kali dipesan
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
