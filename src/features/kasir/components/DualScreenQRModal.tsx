"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface DualScreenQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function DualScreenQRModal({
  isOpen,
  onClose,
  sessionId,
}: DualScreenQRModalProps) {
  const customerDisplayUrl = `${window.location.origin}/customer-display/${sessionId}`;

  const handleOpenDisplay = () => {
    window.open(customerDisplayUrl, "_blank", "width=1200,height=800");
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
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

                <div className="flex items-center gap-3 text-white">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Customer Display</h2>
                    <p className="text-white/90 text-sm">
                      Scan untuk tampilan pelanggan
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* QR Code */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gray-100">
                    <QRCodeSVG
                      value={customerDisplayUrl}
                      size={280}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </motion.div>

                {/* Session Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-2xl p-4"
                >
                  <p className="text-xs text-gray-600 mb-1">Session ID</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm break-all">
                    {sessionId}
                  </p>
                </motion.div>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-50 rounded-2xl p-4 space-y-3"
                >
                  <p className="font-semibold text-blue-900 text-sm">
                    Cara Menggunakan:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
                    <li>
                      Klik tombol &quot;Buka Customer Display&quot; di bawah
                    </li>
                    <li>Atau scan QR code untuk buka di perangkat lain</li>
                    <li>Layar customer akan otomatis sync realtime</li>
                  </ol>
                </motion.div>

                {/* Open Display Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenDisplay}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Monitor className="w-5 h-5" />
                  Buka Customer Display
                </motion.button>

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
