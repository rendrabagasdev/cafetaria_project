/**
 * SettingsPage Component
 * Halaman utama untuk pengaturan sistem
 */

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { GeneralSettingsForm } from "./GeneralSettingsForm";

export function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { settings, loading, refetch } = useSettings();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Gagal memuat pengaturan</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-gray-600">
            Kelola konfigurasi global cafetaria
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Landing Page Settings Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">
                🎨 Pengaturan Landing Page
              </h2>
              <p className="text-green-100 text-sm mb-4">
                Kelola tampilan halaman utama, logo, teks hero, dan footer untuk
                pengunjung.
              </p>
              <button
                onClick={() =>
                  router.push("/dashboard/pengurus/settings/landing-page")
                }
                className="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                Kelola Landing Page →
              </button>
            </div>
            <svg
              className="w-16 h-16 text-green-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Settings Form */}
        <GeneralSettingsForm settings={settings} onSuccess={refetch} />

        {/* Additional Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Bantuan</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              • Nomor WhatsApp harus valid dan aktif untuk menerima pesan dari
              user
            </li>
            <li>
              • Format nomor: dimulai dari 8 (Indonesia), tidak perlu +62 atau 0
            </li>
            <li>
              • User akan diredirect ke WhatsApp dengan pesan pesanan otomatis
            </li>
            <li>
              • Pastikan WhatsApp Business atau reguler sudah setup di perangkat
              kasir
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
