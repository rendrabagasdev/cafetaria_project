/**
 * Daily Report Charts Component
 * Reusable charts for daily reports
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatChartValue } from "@/lib/report-utils";

interface HourlyDistribution {
  hour: string;
  count: number;
  sales: number;
}

interface DailyReportChartsProps {
  hourlyDistribution: HourlyDistribution[];
  salesColor?: string;
  countColor?: string;
}

export default function DailyReportCharts({
  hourlyDistribution,
  salesColor = "#0f766e",
  countColor = "#2563eb",
}: DailyReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Hourly Sales Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          💰 Penjualan Per Jam
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar
              dataKey="sales"
              name="Penjualan"
              fill={salesColor}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Transaction Count */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          🛒 Transaksi Per Jam
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="Jumlah Transaksi"
              stroke={countColor}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
