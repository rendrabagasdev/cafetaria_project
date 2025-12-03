/**
 * PengurusDashboardPage Component
 * Main dashboard page untuk pengurus dengan multi-tab management
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PengurusHeader } from "./PengurusHeader";
import { TabNavigation } from "./TabNavigation";
import { ItemManagementTab } from "./ItemManagementTab";
import { TransactionTab } from "./TransactionTab";
import { UserManagementTab } from "./UserManagementTab";
import { UserFormModal } from "./UserFormModal";
import { usePengurusData } from "../hooks/usePengurusData";
import { TabType, PengurusUser } from "../types";

interface PengurusDashboardPageProps {
  pengurusName?: string;
}

export function PengurusDashboardPage({
  pengurusName,
}: PengurusDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PengurusUser | null>(null);

  const { items, transactions, users, isLoading, error, fetchData } =
    usePengurusData();

  // Fetch data when tab changes
  useEffect(() => {
    fetchData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: PengurusUser) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleUserSuccess = () => {
    fetchData(activeTab);
  };

  const handleItemUpdated = () => {
    fetchData(activeTab);
  };

  const pendingCount = items.filter((item) => item.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white pb-8">
      <PengurusHeader pengurusName={pengurusName} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            pendingCount={pendingCount}
          />
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center"
          >
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => fetchData(activeTab)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}

        {/* Tab Content */}
        {!isLoading && !error && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === "pending" && (
              <ItemManagementTab
                items={items}
                showPendingOnly={true}
                onItemUpdated={handleItemUpdated}
              />
            )}
            {activeTab === "items" && (
              <ItemManagementTab
                items={items}
                showPendingOnly={false}
                onItemUpdated={handleItemUpdated}
              />
            )}
            {activeTab === "transactions" && (
              <TransactionTab transactions={transactions} />
            )}
            {activeTab === "users" && (
              <UserManagementTab
                users={users}
                onUserUpdated={handleUserSuccess}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={handleModalClose}
        onSuccess={handleUserSuccess}
        editUser={editingUser}
      />
    </div>
  );
}
