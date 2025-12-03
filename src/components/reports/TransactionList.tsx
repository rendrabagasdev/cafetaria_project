/**
 * Transaction List Component
 * Reusable component for displaying transaction details
 */

import { Transaction } from "@/types/report";
import { formatCurrency, formatTime } from "@/lib/report-utils";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          📋 Daftar Transaksi Detail
        </h3>
        <span className="text-sm text-gray-600">
          {transactions.length} transaksi
        </span>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada transaksi pada tanggal ini
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      Transaksi #{transaction.id}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>🕒 {formatTime(transaction.createdAt)}</p>
                    {transaction.customerName && (
                      <p>👤 {transaction.customerName}</p>
                    )}
                    {transaction.customerLocation && (
                      <p>📍 {transaction.customerLocation}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(transaction.totalHarga)}
                  </p>
                </div>
              </div>

              {/* Transaction Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Item yang dibeli:
                </h5>
                <div className="space-y-2">
                  {transaction.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700">
                        <span className="font-medium">{detail.jumlah}x</span>{" "}
                        {detail.item.namaBarang}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(detail.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
