"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Phone,
  MessageCircle,
  QrCode,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getFirebaseDatabase } from "@/lib/firebase-client";
import { ref, onValue } from "firebase/database";
import { formatCurrency } from "@/lib/cart-utils";
import Image from "next/image";

interface CartItem {
  itemId: number;
  namaBarang: string;
  quantity: number;
  hargaSatuan: number;
  subtotal: number;
  fotoUrl?: string;
}

interface SessionData {
  status: "OPEN" | "PAYMENT" | "CLOSED";
  qrisUrl?: string;
  expireAt?: string;
  paymentStatus?: string;
  paidAt?: string;
  grossAmount?: number; // 🔥 Total amount dari checkout
}

export default function CustomerDisplayPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sessionData, setSessionData] = useState<SessionData>({
    status: "OPEN",
  });
  const [kasirName, setKasirName] = useState("Kasir");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch settings for WhatsApp
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setWhatsappNumber(data.kasirWhatsapp || "");
        setKasirName(data.namaPengurus || "Kasir");
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Subscribe to Firebase cart updates
  useEffect(() => {
    if (!sessionId) return;

    const database = getFirebaseDatabase();
    if (!database) {
      console.error("Firebase not initialized");
      setLoading(false);
      return;
    }

    const cartRef = ref(database, `pos-sessions/${sessionId}/cart`);
    const kasirRef = ref(database, `pos-sessions/${sessionId}/kasirName`);
    const sessionRef = ref(database, `pos-sessions/${sessionId}`);

    const unsubCart = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCart(data);
      } else {
        setCart([]);
      }
      setLoading(false);
    });

    const unsubKasir = onValue(kasirRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setKasirName(data);
    });

    // 🔥 Subscribe to session status untuk QR code dan payment status
    const unsubSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      console.log("[Customer Display] 🔔 Firebase session update:", {
        sessionId,
        status: data?.status,
        qrisUrl: data?.qrisUrl,
        grossAmount: data?.grossAmount,
        fullData: data,
      });
      if (data) {
        setSessionData({
          status: data.status || "OPEN",
          qrisUrl: data.qrisUrl,
          expireAt: data.expireAt,
          paymentStatus: data.paymentStatus,
          paidAt: data.paidAt,
          grossAmount: data.grossAmount, // 🔥 Get total dari Firebase
        });
      }
    });

    return () => {
      unsubCart();
      unsubKasir();
      unsubSession();
    };
  }, [sessionId]);

  // 🔥 Gunakan grossAmount dari Firebase jika ada (saat PAYMENT/CLOSED), atau hitung dari cart
  const total =
    sessionData.grossAmount ||
    cart.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-2xl font-semibold">Menghubungkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-2">Cafetaria</h1>
          <p className="text-2xl text-white/90">Pesanan Anda</p>
          <p className="text-lg text-white/80 mt-2">
            Dilayani oleh: <span className="font-semibold">{kasirName}</span>
          </p>
        </motion.div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE - Cart Items */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Keranjang Belanja</h2>
              </div>

              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16 text-white/60"
                  >
                    <ShoppingCart className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-xl font-medium">
                      Keranjang masih kosong
                    </p>
                    <p className="text-sm mt-2">
                      Kasir sedang menambahkan item...
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.itemId}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                        className="bg-white/20 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                          <Image
                            src={item.fotoUrl || "/placeholder.png"}
                            alt={item.namaBarang}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate">
                            {item.namaBarang}
                          </h3>
                          <p className="text-sm text-white/80">
                            {item.quantity} x {formatCurrency(item.hargaSatuan)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Total */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 text-gray-900"
              >
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-semibold">Total:</span>
                  <span className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT SIDE - QRIS Payment */}
          <div>
            {sessionData.status === "PAYMENT" && sessionData.qrisUrl ? (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-2xl sticky top-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full mb-4">
                    <QrCode className="w-6 h-6" />
                    <span className="text-xl font-bold">Scan untuk Bayar</span>
                  </div>
                </div>

                {/* QR Code Image */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-lg">
                    <Image
                      src={sessionData.qrisUrl}
                      alt="QRIS Payment"
                      width={280}
                      height={280}
                      className="rounded-xl"
                      priority
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="text-center space-y-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Bayar</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  {sessionData.expireAt && (
                    <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 rounded-lg p-3">
                      <Clock className="w-5 h-5" />
                      <p className="text-sm font-medium">
                        Berlaku s/d{" "}
                        {new Date(sessionData.expireAt).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 text-left">
                    <p className="text-gray-600 text-sm space-y-2">
                      <span className="block">
                        1️⃣ Buka e-wallet (GoPay, OVO, Dana, dll)
                      </span>
                      <span className="block">2️⃣ Scan QR Code</span>
                      <span className="block">3️⃣ Konfirmasi pembayaran</span>
                      <span className="block">4️⃣ Tunggu notifikasi</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center sticky top-6"
              >
                <QrCode className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium text-white/60">
                  QR Code akan muncul di sini
                </p>
                <p className="text-sm text-white/50 mt-2">
                  Tunggu kasir memproses checkout
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Payment Success - Full Width Below */}
        {sessionData.paymentStatus === "SETTLEMENT" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl text-white"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              </motion.div>

              <h2 className="text-4xl font-bold mb-3">Pembayaran Berhasil!</h2>
              <p className="text-2xl mb-6">Terima kasih atas pembayaran Anda</p>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
                <p className="text-lg mb-2">Total Dibayar</p>
                <p className="text-5xl font-bold">{formatCurrency(total)}</p>
                {sessionData.paidAt && (
                  <p className="text-sm mt-3 text-white/80">
                    {new Date(sessionData.paidAt).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>

              <p className="text-xl">✨ Pesanan Anda sedang diproses ✨</p>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        {whatsappNumber && sessionData.status !== "CLOSED" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center"
          >
            <Phone className="w-10 h-10 mx-auto mb-3" />
            <p className="text-lg font-semibold mb-3">Butuh Bantuan?</p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi Kasir
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-white/60"
        >
          <p className="text-sm">
            Terima kasih telah berbelanja di Cafetaria kami! 🙏
          </p>
        </motion.div>
      </div>
    </div>
  );
}
