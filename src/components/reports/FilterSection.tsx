/**
 * Filter Section Component
 * Reusable filter controls for reports
 */

import { FilterMode, ReportTheme } from "@/types/report";

interface FilterSectionProps {
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  theme: ReportTheme;
}

export default function FilterSection({
  mode,
  onModeChange,
  selectedDate,
  onDateChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  theme,
}: FilterSectionProps) {
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filter Laporan</h2>

      {/* Filter Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onModeChange("single")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            mode === "single"
              ? `${theme.gradient} text-white`
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📅 Satu Hari
        </button>
        <button
          onClick={() => onModeChange("range")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            mode === "range"
              ? `${theme.gradient} text-white`
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Rentang Tanggal
        </button>
      </div>

      {/* Date Inputs */}
      {mode === "single" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange?.(e.target.value)}
            max={maxDate}
            className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              max={endDate}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              min={startDate}
              max={maxDate}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
