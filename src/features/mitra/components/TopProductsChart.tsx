/**
 * TopProductsChart Component
 * Grafik produk terlaris menggunakan Nivo Bar Chart
 */

"use client";

import { ResponsiveBar } from "@nivo/bar";

interface TopProduct {
  id: number;
  namaBarang: string;
  soldInPeriod: number;
  revenueInPeriod: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
}

export function TopProductsChart({ products }: TopProductsChartProps) {
  if (!products || products.length === 0) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">
        <p>Tidak ada data produk</p>
      </div>
    );
  }

  const chartData = products.map((p) => ({
    product:
      p.namaBarang.length > 15
        ? p.namaBarang.substring(0, 15) + "..."
        : p.namaBarang,
    Terjual: p.soldInPeriod,
    fullName: p.namaBarang,
  }));

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveBar
        data={chartData}
        keys={["Terjual"]}
        indexBy="product"
        margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "set2" }}
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
          legend: "Produk",
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Jumlah Terjual",
          legendPosition: "middle",
          legendOffset: -50,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[]}
        role="application"
        ariaLabel="Top products chart"
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
        tooltip={({ value, data }) => (
          <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <strong className="text-gray-900">{data.fullName}</strong>
            <div className="text-emerald-600 font-semibold mt-1">
              Terjual: {value} pcs
            </div>
          </div>
        )}
      />
    </div>
  );
}
