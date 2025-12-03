/**
 * MitraPerformanceChart Component
 * Grafik performa mitra menggunakan Nivo Bar Chart
 */

"use client";

import { ResponsiveBar } from "@nivo/bar";
import { formatCurrency } from "@/lib/cart-utils";

interface MitraPerformance {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
}

interface MitraPerformanceChartProps {
  mitras: MitraPerformance[];
}

export function MitraPerformanceChart({ mitras }: MitraPerformanceChartProps) {
  if (!mitras || mitras.length === 0) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">
        <p>Tidak ada data mitra</p>
      </div>
    );
  }

  const chartData = mitras.map((m) => ({
    mitra: m.name.length > 15 ? m.name.substring(0, 15) + "..." : m.name,
    Pendapatan: m.revenue / 1000, // Convert to thousands for better display
    fullName: m.name,
    actualRevenue: m.revenue,
  }));

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveBar
        data={chartData}
        keys={["Pendapatan"]}
        indexBy="mitra"
        margin={{ top: 20, right: 20, bottom: 80, left: 70 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Mitra",
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Pendapatan (Ribuan Rp)",
          legendPosition: "middle",
          legendOffset: -60,
          format: (value) => `${value.toFixed(0)}k`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[]}
        role="application"
        ariaLabel="Mitra performance chart"
        theme={{
          text: {
            fontSize: 11,
            fill: "#6b7280",
          },
          tooltip: {
            container: {
              background: "white",
              color: "#1f2937",
              fontSize: "12px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "8px 12px",
            },
          },
        }}
        tooltip={({ data }) => (
          <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <strong className="text-gray-900">{data.fullName}</strong>
            <div className="text-emerald-600 font-semibold mt-1">
              Pendapatan: {formatCurrency(data.actualRevenue)}
            </div>
          </div>
        )}
      />
    </div>
  );
}
