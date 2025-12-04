/**
 * MitraRevenueTable Component
 * Tabel pembagian hasil per mitra dengan detail fee
 */

"use client";

import { formatCurrency } from "@/lib/cart-utils";

interface MitraRevenue {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
  grossRevenue: number;
  paymentFee: number;
  platformFee: number;
  netRevenue: number;
}

interface MitraRevenueTableProps {
  mitras: MitraRevenue[];
}

export function MitraRevenueTable({ mitras }: MitraRevenueTableProps) {
  if (mitras.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Tidak ada data mitra</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Mitra
            </th>
            <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Total Penjualan
            </th>
            <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Biaya Payment
            </th>
            <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Fee Cafetaria
            </th>
            <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">
              Terima Bersih
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mitras.map((mitra, index) => (
            <tr
              key={mitra.id}
              className={`hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-3 sm:px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900">{mitra.name}</p>
                  <p className="text-xs text-gray-500">
                    {mitra.quantity} item terjual
                  </p>
                </div>
              </td>
              <td className="px-3 sm:px-4 py-3 text-right">
                <span className="text-gray-900 font-medium">
                  {formatCurrency(mitra.grossRevenue)}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-3 text-right">
                <span className="text-orange-600 font-medium">
                  {formatCurrency(mitra.paymentFee)}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-3 text-right">
                <span className="text-red-600 font-medium">
                  {formatCurrency(mitra.platformFee)}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-3 text-right">
                <span className="text-green-600 font-bold text-base">
                  {formatCurrency(mitra.netRevenue)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 border-t-2 border-gray-300">
          <tr>
            <td className="px-3 sm:px-4 py-3 font-bold text-gray-900">TOTAL</td>
            <td className="px-3 sm:px-4 py-3 text-right font-bold text-gray-900">
              {formatCurrency(
                mitras.reduce((sum, m) => sum + m.grossRevenue, 0)
              )}
            </td>
            <td className="px-3 sm:px-4 py-3 text-right font-bold text-orange-600">
              {formatCurrency(mitras.reduce((sum, m) => sum + m.paymentFee, 0))}
            </td>
            <td className="px-3 sm:px-4 py-3 text-right font-bold text-red-600">
              {formatCurrency(
                mitras.reduce((sum, m) => sum + m.platformFee, 0)
              )}
            </td>
            <td className="px-3 sm:px-4 py-3 text-right font-bold text-green-600 text-base">
              {formatCurrency(mitras.reduce((sum, m) => sum + m.netRevenue, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
