/**
 * Report Utility Functions
 * Reusable formatting and calculation functions for reports
 */

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatPeriodLabel = (
  dateStr: string,
  period: "daily" | "monthly" | "yearly"
): string => {
  if (period === "daily") {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  } else if (period === "monthly") {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  } else {
    return dateStr;
  }
};

export const formatChartValue = (value: number): string => {
  return `${(value / 1000).toFixed(0)}k`;
};
