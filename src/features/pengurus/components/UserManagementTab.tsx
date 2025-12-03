/**
 * UserManagementTab Component
 * Tab untuk CRUD pengguna
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Edit,
  Trash2,
  UserCircle,
  Shield,
  Store,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { PengurusUser, UserRoleFilter } from "../types";
import { Role } from "@prisma/client";
import { deleteUser } from "../services/api";

interface UserManagementTabProps {
  users: PengurusUser[];
  onUserUpdated: () => void;
  onAddUser: () => void;
  onEditUser: (user: PengurusUser) => void;
}

export function UserManagementTab({
  users,
  onUserUpdated,
  onAddUser,
  onEditUser,
}: UserManagementTabProps) {
  const [filterRole, setFilterRole] = useState<UserRoleFilter>("ALL");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filteredUsers =
    filterRole === "ALL"
      ? users
      : users.filter((user) => user.role === filterRole);

  const handleDelete = async (userId: number) => {
    if (!confirm("Yakin ingin hapus pengguna ini?")) return;

    try {
      setLoadingId(userId);
      await deleteUser(userId);
      onUserUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal hapus pengguna");
    } finally {
      setLoadingId(null);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "PENGURUS":
        return Shield;
      case "MITRA":
        return Store;
      case "KASIR":
        return CreditCard;
      default:
        return UserCircle;
    }
  };

  const getRoleBadge = (role: Role) => {
    const colors: Record<Role, string> = {
      PENGURUS: "bg-purple-100 text-purple-700",
      MITRA: "bg-blue-100 text-blue-700",
      KASIR: "bg-green-100 text-green-700",
      USER: "bg-gray-100 text-gray-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      {/* Header dengan Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENGURUS", "MITRA", "KASIR"] as UserRoleFilter[]).map(
            (role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterRole(role)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  filterRole === role
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                {role === "ALL" ? "Semua" : role}
              </motion.button>
            )
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddUser}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Tambah Pengguna</span>
        </motion.button>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-16 lg:py-20"
        >
          <Users className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 text-base sm:text-lg lg:text-xl font-medium px-4">
            Tidak ada pengguna
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user, index) => {
              const RoleIcon = getRoleIcon(user.role);

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 sm:p-5 lg:p-6 border border-gray-100"
                >
                  {/* Avatar & Info */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0">
                      <RoleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg truncate">
                        {user.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                        {user.email}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEditUser(user)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(user.id)}
                      disabled={loadingId === user.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{loadingId === user.id ? "..." : "Hapus"}</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
