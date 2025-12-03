/**
 * MitraDashboardPage Component
 * Main dashboard mitra dengan animasi lengkap
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Package } from "lucide-react";
import { useMitraItems } from "../hooks/useMitraItems";
import { deleteItem } from "../services/api";
import { MitraHeader } from "./MitraHeader";
import { StatsSection } from "./StatsSection";
import { ItemCard } from "./ItemCard";
import { ItemFormModal } from "./ItemFormModal";
import { MitraItem } from "../types";

export function MitraDashboardPage() {
  const { data: session } = useSession();
  const { items, isLoading, refetch } = useMitraItems();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MitraItem | null>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: MitraItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem(itemId);
      await refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Gagal menghapus barang");
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingItem(null);
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <MitraHeader
        mitraName={session?.user?.name ?? undefined}
        onAddItem={handleAddItem}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats */}
        <StatsSection items={items} />

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Daftar Barang
            </h2>
            <span className="text-xs sm:text-sm text-gray-500">
              {items.length} barang
            </span>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg p-12 text-center"
            >
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Belum ada barang
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai dengan menambahkan barang pertama Anda
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddItem}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Tambah Barang Sekarang
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Form Modal */}
      <ItemFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
