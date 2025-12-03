/**
 * ItemFormModal Component
 * Modal form untuk tambah/edit item dengan animasi
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Package, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useItemForm } from "../hooks/useItemForm";
import { MitraItem } from "../types";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MitraItem | null;
  onSuccess: () => void;
}

export function ItemFormModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: ItemFormModalProps) {
  const {
    formData,
    previewUrl,
    isSubmitting,
    error,
    updateField,
    handleFileChange,
    handleSubmit,
    resetForm,
  } = useItemForm({
    editingItem,
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onCancel: onClose,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
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
            onClick={() => !isSubmitting && resetForm()}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 sm:p-5 lg:p-6 rounded-t-2xl sm:rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isSubmitting && resetForm()}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6"
              >
                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Foto Barang *
                  </label>
                  <div className="relative">
                    {previewUrl ? (
                      <div className="relative h-40 sm:h-48 lg:h-64 rounded-xl sm:rounded-2xl overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            updateField("fotoUrl", "");
                            document.getElementById("file-input")?.click();
                          }}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg"
                        >
                          <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        </motion.button>
                      </div>
                    ) : (
                      <label
                        htmlFor="file-input"
                        className="flex flex-col items-center justify-center h-40 sm:h-48 lg:h-64 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl cursor-pointer hover:border-emerald-500 transition-colors bg-gradient-to-br from-emerald-50 to-green-50"
                      >
                        <ImageIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400 mb-2 sm:mb-3" />
                        <span className="text-gray-600 font-medium text-sm sm:text-base">
                          Klik untuk upload foto
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm mt-1">
                          JPG, PNG, atau WebP (Max 5MB)
                        </span>
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Nama Barang */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Nama Barang *
                  </label>
                  <input
                    type="text"
                    value={formData.namaBarang}
                    onChange={(e) => updateField("namaBarang", e.target.value)}
                    placeholder="Contoh: Nasi Goreng Spesial"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Grid: Stok & Harga */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Jumlah Stok *
                    </label>
                    <div className="relative">
                      <Package className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.jumlahStok}
                        onChange={(e) =>
                          updateField(
                            "jumlahStok",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
                        required
                        className="w-full pl-8 sm:pl-10 lg:pl-11 pr-2 sm:pr-3 lg:pr-4 py-2 sm:py-2.5 lg:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Harga Satuan *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm sm:text-base">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={formData.hargaSatuan}
                        onChange={(e) =>
                          updateField(
                            "hargaSatuan",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
                        step="100"
                        required
                        className="w-full pl-8 sm:pl-10 lg:pl-11 pr-2 sm:pr-3 lg:pr-4 py-2 sm:py-2.5 lg:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => !isSubmitting && resetForm()}
                    disabled={isSubmitting}
                    className="flex-1 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : editingItem
                      ? "Update"
                      : "Simpan"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
