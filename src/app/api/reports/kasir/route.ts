import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "KASIR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Get transactions with details
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
        status: "COMPLETED",
      },
      include: {
        details: {
          include: {
            item: {
              select: {
                id: true,
                namaBarang: true,
                fotoUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats with revenue breakdown
    const stats = {
      totalTransactions: transactions.length,
      totalRevenue: 0,
      totalItems: 0,
      averageTransaction: 0,
      // Pembagian Hasil
      totalPaymentFee: 0,
      totalNetRevenue: 0,
      totalPlatformFee: 0,
      totalMitraRevenue: 0,
    };

    transactions.forEach((t: any) => {
      const gross = Number(t.grossAmount);
      const paymentFee = Number(t.paymentFee || 0);
      const platformFee = Number(t.platformFee || 0);
      const mitraRevenue = Number(t.mitraRevenue || 0);

      stats.totalRevenue += gross;
      stats.totalPaymentFee += paymentFee;
      stats.totalNetRevenue += gross - paymentFee;
      stats.totalPlatformFee += platformFee;
      stats.totalMitraRevenue += mitraRevenue;

      stats.totalItems += t.details.reduce(
        (sum: number, detail: any) => sum + detail.jumlah,
        0
      );
    });

    stats.averageTransaction =
      stats.totalTransactions > 0
        ? stats.totalRevenue / stats.totalTransactions
        : 0;

    // Get daily sales data for chart
    const dailySales: { [key: string]: { revenue: number; quantity: number } } =
      {};

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.createdAt).toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, quantity: 0 };
      }
      dailySales[date].revenue += Number(transaction.grossAmount);
      transaction.details.forEach((detail: any) => {
        dailySales[date].quantity += detail.jumlah;
      });
    });

    // Convert to chart data
    const chartData = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        quantity: data.quantity,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top products
    const productSales: {
      [key: number]: {
        id: number;
        namaBarang: string;
        fotoUrl: string;
        quantity: number;
        revenue: number;
      };
    } = {};

    transactions.forEach((transaction: any) => {
      transaction.details.forEach((detail: any) => {
        if (!productSales[detail.itemId]) {
          productSales[detail.itemId] = {
            id: detail.itemId,
            namaBarang: detail.item.namaBarang,
            fotoUrl: detail.item.fotoUrl,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[detail.itemId].quantity += detail.jumlah;
        productSales[detail.itemId].revenue += Number(detail.subtotal);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        namaBarang: p.namaBarang,
        fotoUrl: p.fotoUrl,
        soldInPeriod: p.quantity,
        revenueInPeriod: p.revenue,
      }));

    // Recent transactions for table
    const recentTransactions = transactions.slice(0, 10).map((t: any) => ({
      id: t.id,
      createdAt: t.createdAt,
      customerName: t.customerName || "Guest",
      total: Number(t.grossAmount),
      itemCount: t.details.length,
      status: t.status,
      user: t.user,
    }));

    return NextResponse.json({
      stats,
      chartData,
      topProducts,
      recentTransactions,
      period,
    });
  } catch (error) {
    console.error("Kasir report error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}
