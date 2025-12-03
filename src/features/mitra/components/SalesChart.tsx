/**
 * SalesChart Component
 * Grafik penjualan menggunakan Nivo
 */

"use client";

import { ResponsiveLine } from "@nivo/line";
import { formatCurrency } from "@/lib/cart-utils";

interface ChartDataPoint {
  date: string;
  revenue: number;
  quantity: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  period: string;
}

export function SalesChart({ data, period }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center text-gray-400">
        <p>Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  // Format data untuk Nivo Line Chart
  const chartData = [
    {
      id: "Pendapatan",
      color: "hsl(142, 70%, 50%)",
      data: data.map((d) => ({
        x: formatDateLabel(d.date, period),
        y: d.revenue,
      })),
    },
  ];

  return (
    <div className="h-64 sm:h-80 lg:h-96">
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat={(value) => formatCurrency(Number(value))}
        curve="catmullRom"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Tanggal",
          legendOffset: 50,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Pendapatan (Rp)",
          legendOffset: -70,
          legendPosition: "middle",
          format: (value) => `${(value / 1000).toFixed(0)}k`,
        }}
        enableGridX={false}
        colors={{ scheme: "set2" }}
        lineWidth={3}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        enableArea={true}
        areaOpacity={0.1}
        useMesh={true}
        legends={[
          {
            anchor: "top-right",
            direction: "column",
            justify: false,
            translateX: 0,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
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
      />
    </div>
  );
}

function formatDateLabel(dateStr: string, period: string): string {
  const date = new Date(dateStr);

  switch (period) {
    case "today":
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "week":
      return date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
      });
    case "month":
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    case "year":
      return date.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      });
    default:
      return date.toLocaleDateString("id-ID");
  }
}
