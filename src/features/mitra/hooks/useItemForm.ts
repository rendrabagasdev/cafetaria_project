/**
 * useItemForm Hook
 * Manages item creation/editing form state
 */

import { useState, useCallback, useEffect } from "react";
import { MitraItem, MitraItemFormData } from "../types";

interface UseItemFormProps {
  editingItem: MitraItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function useItemForm({
  editingItem,
  onSuccess,
  onCancel,
}: UseItemFormProps) {
  const [formData, setFormData] = useState<MitraItemFormData>({
    namaBarang: "",
    jumlahStok: 0,
    hargaSatuan: 0,
    fotoUrl: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data saat editingItem berubah
  useEffect(() => {
    if (editingItem) {
      setFormData({
        namaBarang: editingItem.namaBarang,
        jumlahStok: editingItem.jumlahStok,
        hargaSatuan: Number(editingItem.hargaSatuan),
        fotoUrl: editingItem.fotoUrl,
      });
      setPreviewUrl(editingItem.fotoUrl);
      setFile(null);
    } else {
      setFormData({
        namaBarang: "",
        jumlahStok: 0,
        hargaSatuan: 0,
        fotoUrl: "",
      });
      setPreviewUrl("");
      setFile(null);
    }
    setError(null);
  }, [editingItem]);

  const updateField = useCallback(
    (field: keyof MitraItemFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleFileChange = useCallback(async (selectedFile: File) => {
    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Tipe file tidak valid. Hanya JPEG, PNG, dan WebP yang diperbolehkan."
      );
      return;
    }

    // Cek ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File terlalu besar. Maksimal 5MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
  }, []);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!file) return formData.fotoUrl || null;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  }, [file, formData.fotoUrl]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload image jika ada
      const fotoUrl = await uploadImage();

      if (!fotoUrl) {
        throw new Error("Foto barang wajib diisi");
      }

      const payload = {
        ...formData,
        fotoUrl,
        jumlahStok: Number(formData.jumlahStok),
        hargaSatuan: Number(formData.hargaSatuan),
      };

      const response = await fetch(
        editingItem ? `/api/items/${editingItem.id}` : "/api/items",
        {
          method: editingItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save item");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingItem, uploadImage, onSuccess]);

  const resetForm = useCallback(() => {
    setFormData({
      namaBarang: "",
      jumlahStok: 0,
      hargaSatuan: 0,
      fotoUrl: "",
    });
    setFile(null);
    setPreviewUrl("");
    setError(null);
    onCancel();
  }, [onCancel]);

  return {
    formData,
    file,
    previewUrl,
    isSubmitting,
    error,
    updateField,
    handleFileChange,
    handleSubmit,
    resetForm,
  };
}
