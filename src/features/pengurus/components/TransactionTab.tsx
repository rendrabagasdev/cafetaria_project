/**
 * TransactionTab Component
 * Tab untuk melihat riwayat transaksi
 */

"use client";

import { motion } from "framer-motion";
import { Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { PengurusTransaction } from "../types";
import { formatCurrency } from "@/lib/cart-utils";
import { formatDate, formatTime } from "@/lib/date-utils";

interface TransactionTabProps {
  transactions: PengurusTransaction[];
}

export function TransactionTab({ transactions }: TransactionTabProps) {
  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Tidak ada transaksi</p>
      </motion.div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 sm:space-y-4 lg:space-y-5"
    >
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 sm:p-5 lg:p-6 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">
                  Transaksi #{String(transaction.id).slice(0, 8)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {formatDate(transaction.createdAt)} •{" "}
                  {formatTime(transaction.createdAt)}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    <span className="font-medium">Kasir:</span>{" "}
                    {transaction.user?.name || "Unknown"}
                  </p>
                  {transaction.customerName && (
                    <p className="text-sm text-gray-600">
                      Pembeli: {transaction.customerName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="self-start flex-shrink-0">
              {getStatusBadge(transaction.status)}
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {transaction.details.map((detail) => (
              <div
                key={detail.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium">
                    {detail.item?.namaBarang || "Unknown Item"}
                  </span>
                  <span className="text-gray-500 ml-2">x{detail.jumlah}</span>
                </div>
                <span className="font-semibold text-gray-700">
                  {formatCurrency(detail.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-green-600">
              {formatCurrency(transaction.grossAmount)}
            </span>
          </div>

          {/* Payment Method */}
          {transaction.paymentMethod && (
            <div className="mt-3 text-sm text-gray-600">
              Metode:{" "}
              <span className="font-medium">{transaction.paymentMethod}</span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
