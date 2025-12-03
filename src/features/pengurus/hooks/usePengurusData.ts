/**
 * usePengurusData Hook
 * Custom hook untuk fetch data berdasarkan active tab
 */

import { useState } from "react";
import {
  PengurusItem,
  PengurusTransaction,
  PengurusUser,
  TabType,
  UserRoleFilter,
} from "../types";

export function usePengurusData() {
  const [items, setItems] = useState<PengurusItem[]>([]);
  const [transactions, setTransactions] = useState<PengurusTransaction[]>([]);
  const [users, setUsers] = useState<PengurusUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (
    tab: TabType,
    userRoleFilter: UserRoleFilter = "ALL"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (tab === "transactions") {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } else if (tab === "users") {
        const roleParam =
          userRoleFilter !== "ALL" ? `?role=${userRoleFilter}` : "";
        const res = await fetch(`/api/users${roleParam}`);
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        // items or pending
        const status = tab === "pending" ? "PENDING" : "";
        const res = await fetch(
          `/api/items${status ? `?status=${status}` : ""}`
        );
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    transactions,
    users,
    isLoading,
    error,
    fetchData,
  };
}
