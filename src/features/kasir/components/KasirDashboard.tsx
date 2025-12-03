"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { KasirHeader } from "./KasirHeader";
import { MenuItemCard } from "./MenuItemCard";
import { CartSidebar } from "./CartSidebar";
import { PendingOrdersSection } from "./PendingOrdersSection";
import { QRISPaymentModal } from "./QRISPaymentModal";
import { TransactionSuccessModal } from "./TransactionSuccessModal";
import { TabNavigation } from "./TabNavigation";
import { DualScreenQRModal } from "./DualScreenQRModal";
import { SearchBar } from "./SearchBar";
import { useKasirData } from "../hooks/useKasirData";
import { usePosSession } from "../hooks/usePosSession";
import { useCart } from "../hooks/useCart";
import { approveTransaction, rejectTransaction } from "../services/api";
import { TransactionResponse } from "../types";
import { Loader2 } from "lucide-react";

export function KasirDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"menu" | "pending">("menu");
  const [showDualScreenModal, setShowDualScreenModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<TransactionResponse | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks
  const { items, pendingOrders, isLoading, refreshPendingOrders } =
    useKasirData();
  const { sessionId, isSessionActive, createSession, syncCart } =
    usePosSession();
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    paymentMethod,
    setPaymentMethod,
  } = useCart();

  // Firebase realtime listener untuk pending orders
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("firebase/database").then(({ onValue, ref, getDatabase }) => {
      import("@/lib/firebase-client").then(({ firebaseApp }) => {
        if (!firebaseApp) {
          console.warn("[KasirDashboard] Firebase not initialized");
          return;
        }
        const db = getDatabase(firebaseApp);
        const pendingRef = ref(db, "pending-orders-trigger");

        // Listen untuk perubahan di Firebase
        onValue(pendingRef, () => {
          // Setiap kali ada perubahan, refresh pending orders
          refreshPendingOrders();
        });
      });
    });
  }, [refreshPendingOrders]);

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle dual screen
  const handleDualScreen = async () => {
    if (!isSessionActive && session?.user) {
      // Default kasirId to 1 if not available
      const kasirId = 1;
      await createSession(kasirId, session.user.name || "Kasir");
    }
    setShowDualScreenModal(true);
  };

  // Handle add to cart with Firebase sync
  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem(item);

    // Sync to Firebase for dual screen
    if (isSessionActive && sessionId) {
      const updatedCart = [...cart];
      const existingIndex = updatedCart.findIndex((c) => c.item.id === item.id);

      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity += 1;
      } else {
        updatedCart.push({ item, quantity: 1 });
      }

      syncCart(updatedCart);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = (itemId: number) => {
    removeItem(itemId);

    if (isSessionActive && sessionId) {
      const updatedCart = cart.filter((c) => c.item.id !== itemId);
      syncCart(updatedCart);
    }
  };

  // Handle quantity update
  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    updateQuantity(itemId, quantity);

    if (isSessionActive && sessionId) {
      const updatedCart = cart.map((c) =>
        c.item.id === itemId ? { ...c, quantity } : c
      );
      syncCart(updatedCart);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      // 🔥 Calculate total SEBELUM clear cart
      const totalAmount = cart.reduce(
        (sum, c) => sum + Number(c.item.hargaSatuan) * c.quantity,
        0
      );

      console.log("[KasirDashboard] Checkout started:", {
        sessionId,
        cartItems: cart.length,
        totalAmount,
        paymentMethod,
      });

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            itemId: c.item.id,
            quantity: c.quantity,
          })),
          paymentMethod: paymentMethod,
          customerName: "Customer",
          posSessionId: sessionId, // 🔥 Kirim sessionId untuk link dengan Firebase
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setCurrentTransaction(data);

      // 🔥 Update Firebase saat QRIS dibuat - SEBELUM clear cart
      if (paymentMethod === "QRIS" && data.qrisUrl && sessionId) {
        try {
          console.log("[KasirDashboard] Updating Firebase payment session:", {
            sessionId,
            qrisUrl: data.qrisUrl,
            grossAmount: totalAmount, // 🔥 Gunakan total yang sudah dihitung
          });

          await fetch(`/api/pos-sessions/${sessionId}/payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qrisUrl: data.qrisUrl,
              expireAt: data.paymentExpireAt,
              grossAmount: totalAmount, // 🔥 Kirim total SEBELUM cart di-clear
            }),
          });
        } catch (firebaseError) {
          console.error("Failed to update Firebase:", firebaseError);
          // Don't fail checkout jika Firebase gagal
        }
      }

      if (paymentMethod === "QRIS") {
        setShowQrisModal(true);
      } else {
        setShowSuccessModal(true);
      }

      // Clear cart after successful checkout
      clearCart();
      if (isSessionActive && sessionId) {
        syncCart([]);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat checkout"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle approve transaction
  const handleApprove = async (transactionId: number) => {
    try {
      await approveTransaction(transactionId);
      await refreshPendingOrders();
    } catch (error) {
      console.error("Approve error:", error);
      alert("Gagal approve transaksi");
    }
  };

  // Handle reject transaction
  const handleReject = async (transactionId: number) => {
    try {
      await rejectTransaction(transactionId);
      await refreshPendingOrders();
    } catch (error) {
      console.error("Reject error:", error);
      alert("Gagal reject transaksi");
    }
  };

  // Handle QRIS success
  const handleQrisSuccess = async () => {
    setShowQrisModal(false);
    setShowSuccessModal(true);

    // 🔥 Refresh items untuk update stock UI
    window.location.reload();
  };

  // Handle close success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCurrentTransaction(null);
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
      <KasirHeader
        kasirName={session?.user?.name || undefined}
        onStartDualScreen={handleDualScreen}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dual Screen Button - moved to header */}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={pendingOrders.length}
          />
        </div>

        {/* Content Area */}
        <div className="flex gap-6">
          {/* Left Side - Menu or Pending Orders */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "menu" ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-center mb-4">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Cari menu..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PendingOrdersSection
                    pendingOrders={pendingOrders}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Cart (only show on menu tab) */}
          {activeTab === "menu" && (
            <CartSidebar
              cart={cart}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleCheckout}
              processing={isCheckingOut}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <DualScreenQRModal
        isOpen={showDualScreenModal}
        onClose={() => setShowDualScreenModal(false)}
        sessionId={sessionId || ""}
      />

      <QRISPaymentModal
        isOpen={showQrisModal}
        onClose={() => setShowQrisModal(false)}
        qrisUrl={currentTransaction?.qrisUrl || ""}
        transactionId={currentTransaction?.id?.toString() || ""}
        totalAmount={Number(currentTransaction?.grossAmount || 0)}
        firebaseSessionId={sessionId || undefined}
        onSuccess={handleQrisSuccess}
      />

      <TransactionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        transaction={currentTransaction}
      />
    </div>
  );
}
