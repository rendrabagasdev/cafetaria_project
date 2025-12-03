/**
 * Range Report Charts Component
 * Reusable charts for range-based reports
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatChartValue } from "@/lib/report-utils";

interface RangeData {
  period: string;
  totalSales: number;
  transactionCount: number;
}

interface RangeReportChartsProps {
  data: RangeData[];
  formatLabel: (period: string) => string;
  salesColor?: string;
  countColor?: string;
}

export default function RangeReportCharts({
  data,
  formatLabel,
  salesColor = "#0f766e",
  countColor = "#2563eb",
}: RangeReportChartsProps) {
  const chartData = data.map((item) => ({
    tanggal: formatLabel(item.period),
    "Total Penjualan": item.totalSales,
    "Jumlah Transaksi": item.transactionCount,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📈 Tren Penjualan
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="tanggal"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total Penjualan"
              stroke={salesColor}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📊 Jumlah Transaksi
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="tanggal"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="Jumlah Transaksi"
              fill={countColor}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
