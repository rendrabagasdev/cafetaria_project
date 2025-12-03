/**
 * Menu Feature - Main Page Component
 * Orchestrates all menu components and state management
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMenu } from "../hooks/useMenu";
import { useMenuCart } from "../hooks/useCart";
import { useSettings } from "@/hooks/useSettings";
import { menuApi } from "../services/api";
import { MenuHeader } from "./MenuHeader";
import { HeroSection } from "./HeroSection";
import { BestSellersSection } from "./BestSellersSection";
import { FullMenuSection } from "./FullMenuSection";
import { CheckoutModal } from "./CheckoutModal";
import { MenuDetailModal } from "./MenuDetailModal";
import { OrderSuccessModal } from "./OrderSuccessModal";
import { MenuItem, CheckoutFormData } from "../types";
import { Loader2 } from "lucide-react";

export function MenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, bestSellers, isLoading } = useMenu();
  const { settings } = useSettings();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  } = useMenuCart();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if unauthenticated
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleAddToCart = (item: MenuItem) => {
    try {
      addToCart(item);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal menambah ke keranjang"
      );
    }
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    try {
      updateQuantity(itemId, quantity);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengupdate jumlah");
    }
  };

  const handleViewDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBestSellers = bestSellers.filter((item) =>
    item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckout = async (formData: CheckoutFormData) => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (!settings?.kasirWhatsapp) {
      alert("Nomor WhatsApp kasir belum diatur");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cart.map((c) => ({
          itemId: c.item.id,
          quantity: c.quantity,
        })),
        customerName: formData.customerName,
        customerLocation: formData.customerLocation,
        notes: formData.notes || "",
        paymentMethod: formData.paymentMethod,
      };

      const response = await menuApi.createOrder(orderData);

      // Build WhatsApp message
      const itemsList = cart
        .map(
          (c) =>
            `${c.quantity}x ${c.item.namaBarang} - ${formatCurrency(
              Number(c.item.hargaSatuan) * c.quantity
            )}`
        )
        .join("\n");

      const paymentText =
        formData.paymentMethod === "QRIS" ? "💳 QRIS" : "💵 Cash";

      const message = `🛒 *Pesanan Baru* (ID: #${response.id})

*Dari:* ${formData.customerName}
*Lokasi:* ${formData.customerLocation}

*Pesanan:*
${itemsList}

*Total:* ${formatCurrency(getTotal())}
*Pembayaran:* ${paymentText}

${
  formData.notes ? `*Catatan:* ${formData.notes}\n` : ""
}_Pesanan akan diproses setelah dikonfirmasi._`;

      const waLink = `https://wa.me/62${
        settings.kasirWhatsapp
      }?text=${encodeURIComponent(message)}`;

      window.open(waLink, "_blank");

      // Clear cart and show success
      clearCart();
      setShowCheckoutModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat checkout"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <MenuHeader
        userName={session?.user?.name || undefined}
        cartCount={cart.length}
        onCartClick={() => setShowCheckoutModal(true)}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Best Sellers */}
        <BestSellersSection
          items={filteredBestSellers}
          onAddToCart={handleAddToCart}
        />

        {/* Full Menu */}
        <FullMenuSection
          items={filteredItems}
          onAddToCart={handleAddToCart}
          onViewDetail={handleViewDetail}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>

      {/* Modals */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
      />

      <MenuDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem}
        onAddToCart={handleAddToCart}
      />

      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>&copy; 2025 Cafetaria Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
