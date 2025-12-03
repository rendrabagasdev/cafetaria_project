/**
 * Summary Cards Component
 * Reusable summary cards for report metrics
 */

import { formatCurrency } from "@/lib/report-utils";
import { ReportTheme } from "@/types/report";

interface SummaryCardsProps {
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  theme: ReportTheme;
}

export default function SummaryCards({
  totalSales,
  transactionCount,
  averageTransaction,
  theme,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${theme.primary}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Penjualan
            </p>
            <p className={`text-2xl font-bold ${theme.primary}`}>
              {formatCurrency(totalSales)}
            </p>
          </div>
          <div
            className={`w-12 h-12 bg-${theme.primary}/10 rounded-full flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${theme.primary}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${theme.secondary}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Jumlah Transaksi
            </p>
            <p className={`text-2xl font-bold ${theme.secondary}`}>
              {transactionCount}
            </p>
          </div>
          <div
            className={`w-12 h-12 bg-${theme.secondary}/10 rounded-full flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${theme.secondary}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${theme.accent}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Rata-rata</p>
            <p className={`text-2xl font-bold ${theme.accent}`}>
              {formatCurrency(Math.round(averageTransaction))}
            </p>
          </div>
          <div
            className={`w-12 h-12 bg-${theme.accent}/10 rounded-full flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${theme.accent}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
