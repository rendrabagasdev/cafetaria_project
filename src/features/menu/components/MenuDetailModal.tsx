/**
 * Menu Item Detail Modal
 * Displays full item details with large image
 */

"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { MenuItem } from "../types";
import { formatCurrency } from "@/lib/cart-utils";
import { Star, ShoppingCart } from "lucide-react";

interface MenuDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuDetailModal({
  isOpen,
  onClose,
  item,
  onAddToCart,
}: MenuDetailModalProps) {
  if (!item) return null;

  const handleAddToCart = () => {
    if (item.jumlahStok === 0) return;
    onAddToCart(item);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Menu" maxWidth="xl">
      <div className="space-y-6">
        {/* Image */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={item.fotoUrl}
            alt={item.namaBarang}
            fill
            className="object-cover"
          />
          {item.jumlahStok < 5 && item.jumlahStok > 0 && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg">
              ⚠️ Stok terbatas
            </div>
          )}
          {item.jumlahStok === 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg">
              ❌ Stok habis
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {item.namaBarang}
          </h2>

          {/* Price & Stock Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <p className="text-sm text-gray-600 mb-1">Harga</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(Number(item.hargaSatuan))}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Stok Tersedia</p>
              <p className="text-3xl font-bold text-blue-600">
                {item.jumlahStok}
              </p>
            </div>
          </div>

          {/* Popularity Badge */}
          {item._count && item._count.transactionDetails > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">Menu Populer!</p>
                  <p className="text-sm text-yellow-700">
                    Sudah dipesan {item._count.transactionDetails} kali
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={item.jumlahStok === 0}
              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Tambah ke Keranjang
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
