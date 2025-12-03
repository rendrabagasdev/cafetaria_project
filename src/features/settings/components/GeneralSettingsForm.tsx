/**
 * GeneralSettingsForm Component
 * Form untuk pengaturan umum (WhatsApp, Nama Pengurus)
 */

"use client";

import { useState } from "react";
import { Settings, UpdateSettingsPayload } from "../types";
import { settingsApi } from "../services/api";

interface GeneralSettingsFormProps {
  settings: Settings;
  onSuccess: () => void;
}

export function GeneralSettingsForm({
  settings,
  onSuccess,
}: GeneralSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [formData, setFormData] = useState({
    kasirWhatsapp: settings.kasirWhatsapp || "",
    namaPengurus: settings.namaPengurus || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload: UpdateSettingsPayload = {
        kasirWhatsapp: formData.kasirWhatsapp,
        namaPengurus: formData.namaPengurus,
      };

      await settingsApi.updateSettings(payload);

      setMessage("Settings berhasil disimpan!");
      setMessageType("success");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      setMessage(errorMessage);
      setMessageType("error");
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      kasirWhatsapp: settings.kasirWhatsapp || "",
      namaPengurus: settings.namaPengurus || "",
    });
    setMessage("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Pengurus */}
        <div>
          <label
            htmlFor="namaPengurus"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nama Pengurus / Sekolah
          </label>
          <input
            type="text"
            id="namaPengurus"
            name="namaPengurus"
            value={formData.namaPengurus}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Cafetaria Sekolah ABC"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nama yang ditampilkan di aplikasi
          </p>
        </div>

        {/* Nomor WhatsApp Kasir */}
        <div>
          <label
            htmlFor="kasirWhatsapp"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nomor WhatsApp Kasir
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              +62
            </span>
            <input
              type="tel"
              id="kasirWhatsapp"
              name="kasirWhatsapp"
              value={formData.kasirWhatsapp}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8XXXXXXXXX (tanpa 62)"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: 8XXXXXXXXX (contoh: 812345678901)
          </p>
          {formData.kasirWhatsapp && (
            <p className="text-xs text-gray-600 mt-2">
              Link WA: https://wa.me/62{formData.kasirWhatsapp}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Info:</strong> Nomor WhatsApp ini akan digunakan untuk
            redirect user saat memesan barang dari halaman menu.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
