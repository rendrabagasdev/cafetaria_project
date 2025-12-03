"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ShoppingBag } from "lucide-react";
import { TransactionResponse } from "../types";

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionResponse | null;
}

export function TransactionSuccessModal({
  isOpen,
  onClose,
  transaction,
}: TransactionSuccessModalProps) {
  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4">
              {/* Success Icon */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div className="bg-white rounded-full p-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-white"
                >
                  <h2 className="text-2xl font-bold mb-2">
                    Transaksi Berhasil!
                  </h2>
                  <p className="text-white/90 text-sm">
                    Pembayaran telah dikonfirmasi
                  </p>
                </motion.div>
              </div>

              {/* Transaction Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 space-y-4"
              >
                {/* Transaction ID & Date */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Transaction ID
                    </span>
                    <span className="font-mono font-semibold text-gray-900">
                      #{transaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tanggal</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(transaction.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Metode Pembayaran
                    </span>
                    <span className="text-sm font-semibold text-gray-900 uppercase">
                      {transaction.paymentMethod}
                    </span>
                  </div>
                </div>
                {/* Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Items</h3>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transaction.details?.map((detail: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex justify-between items-start bg-gray-50 p-3 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {detail.item?.namaBarang || "Item"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {detail.quantity} x Rp{" "}
                            {Number(detail.hargaSatuan).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          Rp{" "}
                          {(
                            detail.quantity * Number(detail.hargaSatuan)
                          ).toLocaleString("id-ID")}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>{" "}
                {/* Total */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t-2 border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">
                      Total Pembayaran
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rp{" "}
                      {Number(transaction.grossAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                </motion.div>
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                >
                  Selesai
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
