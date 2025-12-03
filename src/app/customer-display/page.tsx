"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { subscribeToSession, FirebasePosSession } from "@/lib/firebase-client";

function CustomerDisplayContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [sessionData, setSessionData] = useState<FirebasePosSession | null>(
    null
  );
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback: fetch from API if Firebase returns null
  const fetchSessionFromAPI = useCallback(async () => {
    try {
      console.log("[CUSTOMER] Fetching session from API as fallback...");
      const response = await fetch(`/api/pos/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("[CUSTOMER] Session fetched from API:", data.session);
        setSessionData(data.session);
        setError(null);
      } else {
        setError("Session tidak ditemukan");
      }
    } catch (err) {
      console.error("[CUSTOMER] Failed to fetch from API:", err);
      setError("Gagal mengambil data session");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID tidak ditemukan. Scan QR code dari kasir.");
      return;
    }

    console.log(
      "[CUSTOMER] Subscribing to real-time updates for session:",
      sessionId
    );
    setConnected(true);

    // ✅ REAL-TIME PUSH-BASED UPDATES (tidak polling!)
    // Firebase akan otomatis push update ke client setiap ada perubahan
    const unsubscribe = subscribeToSession(sessionId, (session) => {
      if (session) {
        console.log("[CUSTOMER] 🔥 Real-time update received:", {
          status: session.status,
          cartItems: session.cart?.length || 0,
          total: session.grossAmount,
        });
        setSessionData(session);
        setError(null);
      } else {
        console.warn("[CUSTOMER] Session data is null from Firebase");
        // Fallback: try to fetch from API once
        fetchSessionFromAPI();
      }
    });

    // Cleanup: unsubscribe saat component unmount
    return () => {
      console.log("[CUSTOMER] Unsubscribing from real-time updates");
      unsubscribe();
    };
  }, [sessionId, fetchSessionFromAPI]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!connected || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Menghubungkan...
          </h1>
          <p className="text-gray-600">Waiting for session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-3xl shadow-2xl p-8 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cafetaria</h1>
              <p className="text-gray-600">Kasir: {sessionData.kasirName}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white shadow-2xl p-8 mb-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Pesanan Anda
          </h2>

          {!sessionData.cart || sessionData.cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl text-gray-500">
                Menunggu kasir menambahkan item...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionData.cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {item.fotoUrl && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.fotoUrl}
                        alt={item.namaBarang}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {item.namaBarang}
                    </h3>
                    <p className="text-gray-600">
                      Rp {item.hargaSatuan.toLocaleString("id-ID")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white shadow-2xl p-8 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-800">Total:</span>
            <span className="text-4xl font-bold text-blue-600">
              Rp {sessionData.grossAmount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* QR Code Payment */}
        {sessionData.status === "PAYMENT" && sessionData.qrisUrl && (
          <div className="bg-white rounded-b-3xl shadow-2xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Scan QR Code untuk Bayar
            </h2>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg inline-block mx-auto">
                <Image
                  src={sessionData.qrisUrl}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                Total Pembayaran: Rp{" "}
                {sessionData.grossAmount.toLocaleString("id-ID")}
              </p>
              {sessionData.expireAt && (
                <p className="text-sm text-red-600">
                  Berlaku hingga:{" "}
                  {new Date(sessionData.expireAt).toLocaleTimeString("id-ID")}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Menunggu pembayaran...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {sessionData.status === "CLOSED" && (
          <div className="bg-white rounded-b-3xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Pembayaran Berhasil!
              </h2>
              <p className="text-gray-600">Terima kasih atas pembelian Anda</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white">
          <p className="text-sm opacity-75">Session ID: {sessionId}</p>
          <p className="text-xs opacity-50 mt-2">
            Last updated:{" "}
            {new Date(sessionData.updatedAt).toLocaleTimeString("id-ID")}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function CustomerDisplay() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <CustomerDisplayContent />
    </Suspense>
  );
}
