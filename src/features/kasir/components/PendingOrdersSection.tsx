"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { PendingTransaction } from "../types";
import { useState } from "react";

interface PendingOrdersSectionProps {
  pendingOrders: PendingTransaction[];
  onApprove: (transactionId: number) => Promise<void>;
  onReject: (transactionId: number) => Promise<void>;
}

export function PendingOrdersSection({
  pendingOrders,
  onApprove,
  onReject,
}: PendingOrdersSectionProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Clock className="w-16 h-16 text-emerald-200 mb-4" />
        <p className="text-gray-500 text-lg">Tidak ada transaksi pending</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pendingOrders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
            <div className="flex justify-between items-start text-white">
              <div>
                <p className="text-sm opacity-90">Transaction ID</p>
                <p className="font-mono font-semibold">#{order.id}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <p className="text-xs font-medium">PENDING</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Customer Info */}
            {order.customerName && (
              <div>
                <p className="text-xs text-gray-500">Nama Pelanggan</p>
                <p className="font-medium text-gray-900">
                  {order.customerName}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <p className="text-xs text-gray-500">Metode Pembayaran</p>
              <p className="font-semibold text-gray-900 uppercase">
                {order.paymentMethod}
              </p>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Items</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.details?.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="text-gray-700">
                      {detail.quantity}x {detail.item?.namaBarang || "Item"}
                    </span>
                    <span className="font-medium text-gray-900">
                      Rp{" "}
                      {(
                        Number(detail.hargaSatuan || 0) * (detail.quantity || 0)
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  Rp {Number(order.grossAmount || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApprove(order.id)}
                disabled={processingId === order.id}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {processingId === order.id ? "Processing..." : "Approve"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReject(order.id)}
                disabled={processingId === order.id}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {processingId === order.id ? "Processing..." : "Reject"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
