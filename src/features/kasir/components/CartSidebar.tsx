"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LocalCartItem,
  calculateLocalCartTotal,
  formatCurrency,
} from "@/lib/cart-utils";

interface CartSidebarProps {
  cart: LocalCartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: () => void;
  paymentMethod: "QRIS" | "CASH";
  onPaymentMethodChange: (method: "QRIS" | "CASH") => void;
  processing?: boolean;
}

export function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  paymentMethod,
  onPaymentMethodChange,
  processing = false,
}: CartSidebarProps) {
  const total = calculateLocalCartTotal(cart);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="w-6 h-6 text-teal-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Keranjang
      </h2>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Metode Pembayaran
        </label>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onPaymentMethodChange("CASH")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === "CASH"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💵 Cash
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onPaymentMethodChange("QRIS")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === "QRIS"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📱 QRIS
          </motion.button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-gray-400"
            >
              <svg
                className="w-16 h-16 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p>Keranjang kosong</p>
            </motion.div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="bg-gray-50 rounded-lg p-3 flex gap-3"
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.item.fotoUrl}
                    alt={item.item.namaBarang}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {item.item.namaBarang}
                  </h4>
                  <p className="text-teal-600 font-bold text-sm">
                    {formatCurrency(item.item.hargaSatuan)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        onUpdateQuantity(item.item.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </motion.button>

                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        onUpdateQuantity(item.item.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4"
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

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemoveItem(item.item.id)}
                      className="ml-auto p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Total & Checkout */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-gray-900">Total:</span>
          <span className="text-teal-600">{formatCurrency(total)}</span>
        </div>

        <motion.button
          whileHover={{ scale: cart.length === 0 || processing ? 1 : 1.02 }}
          whileTap={{ scale: cart.length === 0 || processing ? 1 : 0.98 }}
          onClick={onCheckout}
          disabled={cart.length === 0 || processing}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Memproses...
            </span>
          ) : (
            "Checkout"
          )}
        </motion.button>
      </div>
    </div>
  );
}
