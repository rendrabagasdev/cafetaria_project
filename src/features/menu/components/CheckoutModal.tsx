/**
 * Checkout Modal Component
 * iOS-style checkout dengan payment method selection
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Modal from "@/components/Modal";
import { CartItem, CheckoutFormData } from "../types";
import { formatCurrency } from "@/lib/cart-utils";
import {
  MessageCircle,
  Banknote,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: (
    formData: CheckoutFormData & { paymentMethod: "QRIS" | "CASH" }
  ) => Promise<void>;
  isProcessing: boolean;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isProcessing,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [notes, setNotes] = useState("");
  // Menu page hanya support CASH payment
  const paymentMethod = "CASH";

  const total = cart.reduce(
    (sum, c) => sum + Number(c.item.hargaSatuan) * c.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!customerName || !customerLocation) {
      alert("Mohon isi nama dan lokasi Anda");
      return;
    }

    await onCheckout({
      customerName,
      customerLocation,
      notes,
      paymentMethod,
    });

    // Reset form
    setCustomerName("");
    setCustomerLocation("");
    setNotes("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keranjang Belanja"
      maxWidth="lg"
    >
      <div className="space-y-4 sm:space-y-6">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              Keranjang masih kosong
            </p>
          </motion.div>
        ) : (
          <>
            {/* Cart Items - iOS Style */}
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {cart.map((cartItem) => (
                  <motion.div
                    key={cartItem.item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:shadow-xl hover:border-green-200 transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                        <Image
                          src={cartItem.item.fotoUrl}
                          alt={cartItem.item.namaBarang}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {cartItem.item.namaBarang}
                        </h4>
                        <p className="text-xs sm:text-sm font-semibold text-green-600 mt-0.5">
                          {formatCurrency(Number(cartItem.item.hargaSatuan))}
                        </p>

                        {/* Quantity Controls - iOS Style */}
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onUpdateQuantity(
                                cartItem.item.id,
                                cartItem.quantity - 1
                              )
                            }
                            className="bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                          </motion.button>

                          <span className="text-sm sm:text-base font-bold w-8 sm:w-10 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {cartItem.quantity}
                          </span>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onUpdateQuantity(
                                cartItem.item.id,
                                cartItem.quantity + 1
                              )
                            }
                            className="bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-md"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Price & Delete */}
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-sm sm:text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatCurrency(
                            Number(cartItem.item.hargaSatuan) *
                              cartItem.quantity
                          )}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveItem(cartItem.item.id)}
                          className="bg-red-50 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Payment Method Info - Cash Only */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-5 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2.5 sm:p-3 rounded-xl">
                  <Banknote className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 text-sm sm:text-base">
                    Pembayaran Tunai (Cash)
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-0.5">
                    Bayar langsung ke kasir saat pengambilan
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Form - iOS Style */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                Info Pembeli
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm sm:text-base outline-none"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lokasi/Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm sm:text-base outline-none"
                  placeholder="Contoh: Kelas 12 A, Kantin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm sm:text-base outline-none resize-none"
                  placeholder="Tambahkan catatan..."
                  rows={3}
                />
              </div>
            </div>

            {/* Total & Checkout Button - iOS Style */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-gray-700">
                  Total Pembayaran
                </span>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isProcessing || !customerName || !customerLocation}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                {isProcessing ? "Memproses..." : "Pesan via WhatsApp"}
              </motion.button>

              <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                Pesanan akan disimpan dan menunggu konfirmasi pembayaran tunai
                dari kasir
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
