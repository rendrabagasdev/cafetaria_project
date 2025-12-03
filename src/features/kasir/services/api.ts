import { Item, PendingTransaction } from "../types";

export async function fetchItems(): Promise<Item[]> {
  try {
    const res = await fetch("/api/items?status=TERSEDIA");
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

export async function fetchPendingOrders(): Promise<PendingTransaction[]> {
  try {
    const res = await fetch("/api/transactions?status=PENDING", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch pending orders");
    const data = await res.json();
    return data.transactions || [];
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    throw error;
  }
}

export async function createTransaction(payload: {
  items: { itemId: number; quantity: number }[];
  paymentMethod: string;
  customerName?: string;
  posSessionId?: string | null;
}) {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal memproses transaksi");
  }

  return data;
}

export async function approveTransaction(transactionId: number) {
  const res = await fetch(`/api/transactions/${transactionId}/approve`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Gagal menyetujui pesanan");
  }

  return res.json();
}

export async function rejectTransaction(transactionId: number) {
  const res = await fetch(`/api/transactions/${transactionId}/reject`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Gagal menolak pesanan");
  }

  return res.json();
}

export async function initializePosSession() {
  const res = await fetch("/api/pos/session", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create POS session");
  }

  return res.json();
}

export async function updatePosSessionStatus(
  sessionId: string,
  status: string
) {
  const res = await fetch(`/api/pos/session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update session status");
  }

  return res.json();
}

export async function syncCartToFirebase(
  sessionId: string,
  cart: {
    itemId: number;
    namaBarang: string;
    quantity: number;
    hargaSatuan: number;
  }[]
) {
  const res = await fetch(`/api/pos/session/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });

  if (!res.ok) {
    throw new Error("Failed to sync cart");
  }

  return res.json();
}
