"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { getFirebaseDatabase } from "@/lib/firebase-client";
import { ref, onValue } from "firebase/database";

interface QRISPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrisUrl: string;
  transactionId: string;
  totalAmount: number;
  firebaseSessionId?: string;
  onSuccess?: () => void;
}

export function QRISPaymentModal({
  isOpen,
  onClose,
  qrisUrl,
  transactionId,
  totalAmount,
  firebaseSessionId,
  onSuccess,
}: QRISPaymentModalProps) {
  const [status, setStatus] = useState<"pending" | "checking" | "success">(
    "pending"
  );

  useEffect(() => {
    if (!isOpen || !firebaseSessionId) {
      setStatus("pending");
      return;
    }

    // 🔥 REAL-TIME Firebase listener - langsung update saat webhook diterima!
    const database = getFirebaseDatabase();
    if (!database) {
      console.error("Firebase not initialized");
      // Fallback ke polling jika Firebase tidak tersedia
      pollTransactionStatus();
      return;
    }

    const sessionRef = ref(database, `pos-sessions/${firebaseSessionId}`);

    console.log(
      "[QRISPaymentModal] 🎧 Listening to Firebase session:",
      firebaseSessionId
    );

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();

      console.log("[QRISPaymentModal] 🔔 Firebase update received:", {
        paymentStatus: data?.paymentStatus,
        status: data?.status,
        fullData: data,
      });

      if (data?.paymentStatus === "SETTLEMENT") {
        console.log("[QRISPaymentModal] ✅ Payment SUCCESS! Closing modal...");
        setStatus("success");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else if (data?.paymentStatus === "PENDING") {
        setStatus("pending");
      }
    });

    return () => unsubscribe();
  }, [isOpen, firebaseSessionId, onSuccess, onClose]);

  // Fallback polling jika Firebase tidak tersedia
  const pollTransactionStatus = () => {
    const interval = setInterval(async () => {
      try {
        setStatus("checking");
        const response = await fetch(`/api/transactions/${transactionId}`);
        const data = await response.json();

        if (data.status === "SETTLEMENT") {
          setStatus("success");
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
          clearInterval(interval);
        } else {
          setStatus("pending");
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        setStatus("pending");
      }
    }, 3000);

    return () => clearInterval(interval);
  };

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
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-2">Pembayaran QRIS</h2>
                  <p className="text-white/90 text-sm">
                    Scan QR Code untuk membayar
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Transaction Info */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono font-medium text-gray-900">
                      #{transactionId.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gray-100">
                    <QRCodeSVG
                      value={qrisUrl}
                      size={240}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </motion.div>

                {/* Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  {status === "success" ? (
                    <div className="space-y-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="flex justify-center"
                      >
                        <div className="bg-green-100 rounded-full p-3">
                          <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                      </motion.div>
                      <p className="text-lg font-semibold text-green-600">
                        Pembayaran Berhasil!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-medium">
                          {status === "checking"
                            ? "Mengecek pembayaran..."
                            : "Menunggu Pembayaran"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Buka aplikasi e-wallet dan scan QR code di atas
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Instructions */}
                {status === "pending" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 rounded-xl p-4"
                  >
                    <p className="text-xs text-blue-900 font-medium mb-2">
                      Cara Pembayaran:
                    </p>
                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Buka aplikasi e-wallet (GoPay, OVO, Dana, dll)</li>
                      <li>Pilih menu Scan QR</li>
                      <li>Arahkan kamera ke QR code di atas</li>
                      <li>Konfirmasi pembayaran</li>
                    </ol>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
