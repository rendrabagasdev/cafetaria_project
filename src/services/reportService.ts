/**
 * Report Service
 * Handles all report data fetching operations
 */

import { DailyReport, RangeReport, Period } from "@/types/report";

export class ReportService {
  /**
   * Fetch daily report for a specific date
   */
  static async fetchDailyReport(date: string): Promise<DailyReport> {
    const res = await fetch(`/api/reports/daily?date=${date}`);
    if (!res.ok) throw new Error("Failed to fetch daily report");
    return res.json();
  }

  /**
   * Fetch range report between two dates
   */
  static async fetchRangeReport(
    startDate: string,
    endDate: string
  ): Promise<RangeReport> {
    const res = await fetch(
      `/api/reports?period=daily&startDate=${startDate}&endDate=${endDate}`
    );
    if (!res.ok) throw new Error("Failed to fetch range report");
    return res.json();
  }

  /**
   * Fetch period-based report (daily/monthly/yearly)
   */
  static async fetchPeriodReport(period: Period): Promise<RangeReport> {
    const res = await fetch(`/api/reports?period=${period}`);
    if (!res.ok) throw new Error("Failed to fetch period report");
    return res.json();
  }
}
