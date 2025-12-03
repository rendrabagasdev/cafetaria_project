/**
 * Order Success Modal
 * Shows success message after order creation
 */

"use client";

import Modal from "@/components/Modal";
import { CheckCircle } from "lucide-react";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ isOpen, onClose }: OrderSuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pesanan Berhasil!"
      maxWidth="md"
    >
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Pesanan Berhasil Dibuat!
        </h3>
        <p className="text-gray-600 mb-6">
          Pesanan Anda telah disimpan dan dikirim ke kasir via WhatsApp. Silakan
          tunggu konfirmasi dari kasir.
        </p>
        <button
          onClick={onClose}
          className="bg-emerald-600 text-white py-2 px-6 rounded-lg hover:bg-emerald-700 font-medium"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}
