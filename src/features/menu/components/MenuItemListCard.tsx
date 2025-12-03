/**
 * Menu Item List Card Component
 * Horizontal card layout for full menu section
 */

"use client";

import Image from "next/image";
import { Info, ShoppingCart } from "lucide-react";
import { MenuItem } from "../types";
import { formatCurrency } from "@/lib/cart-utils";

interface MenuItemListCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
}

export function MenuItemListCard({
  item,
  onAddToCart,
  onViewDetail,
}: MenuItemListCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-gray-100">
          <Image
            src={item.fotoUrl}
            alt={item.namaBarang}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
          {item.jumlahStok < 5 && item.jumlahStok > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              Stok terbatas
            </div>
          )}
          {item.jumlahStok === 0 && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
              Habis
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.namaBarang}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(Number(item.hargaSatuan))}
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Stok: {item.jumlahStok}
              </span>
            </div>
            {item._count && item._count.transactionDetails > 0 && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                🔥 Sudah dipesan {item._count.transactionDetails}x
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onViewDetail(item)}
              className="flex-1 sm:flex-none bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Info className="w-5 h-5" />
              Detail
            </button>
            <button
              onClick={() => onAddToCart(item)}
              disabled={item.jumlahStok === 0}
              className="flex-1 bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />+ Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
