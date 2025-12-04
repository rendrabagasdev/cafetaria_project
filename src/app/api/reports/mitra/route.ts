import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "MITRA") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today";

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
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    const mitraId = parseInt(token.id as string);

    // Get all items for this mitra with transaction details
    const items = await prisma.item.findMany({
      where: {
        mitraId,
      },
      include: {
        transactionDetails: {
          where: {
            transaction: {
              createdAt: {
                gte: startDate,
                lte: now,
              },
              status: {
                in: ["COMPLETED"],
              },
            },
          },
          include: {
            transaction: {
              select: {
                createdAt: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            transactionDetails: true,
          },
        },
      },
    });

    // Calculate stats with fee breakdown
    const stats = {
      totalProducts: items.length,
      totalStock: items.reduce((sum, item) => sum + item.jumlahStok, 0),
      totalSold: 0,
      totalRevenue: 0,
      // Pembagian Hasil Mitra
      totalPaymentFee: 0,
      totalPlatformFee: 0,
      netRevenue: 0, // Pendapatan bersih yang diterima mitra
    };

    // Get transactions to calculate fees
    const mitraTransactions: any[] = [];
    items.forEach((item) => {
      item.transactionDetails.forEach((detail) => {
        const transaction = detail.transaction as any;
        if (!mitraTransactions.find((t) => t.id === (transaction as any).id)) {
          // Find full transaction data
          const fullTx = items
            .flatMap((i) => i.transactionDetails)
            .find((d) => d.transactionId === detail.transactionId);
          if (fullTx) {
            mitraTransactions.push(fullTx);
          }
        }
      });
    });

    // Process items to get sales data
    const productsWithSales = items.map((item) => {
      const soldInPeriod = item.transactionDetails.reduce(
        (sum: number, detail) => sum + detail.jumlah,
        0
      );
      const revenueInPeriod = item.transactionDetails.reduce(
        (sum: number, detail) =>
          sum + detail.jumlah * Number(detail.hargaSatuan),
        0
      );

      stats.totalSold += soldInPeriod;
      stats.totalRevenue += revenueInPeriod;

      return {
        id: item.id,
        namaBarang: item.namaBarang,
        fotoUrl: item.fotoUrl,
        jumlahStok: item.jumlahStok,
        hargaSatuan: item.hargaSatuan,
        status: item.status,
        soldInPeriod,
        revenueInPeriod,
        totalSales: item._count.transactionDetails,
      };
    });

    // Get daily sales data for chart
    const dailySales: { [key: string]: { revenue: number; quantity: number } } =
      {};

    items.forEach((item) => {
      item.transactionDetails.forEach((detail) => {
        const date = new Date(detail.transaction.createdAt)
          .toISOString()
          .split("T")[0];
        if (!dailySales[date]) {
          dailySales[date] = { revenue: 0, quantity: 0 };
        }
        dailySales[date].revenue += detail.jumlah * Number(detail.hargaSatuan);
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get top products
    const topProducts = productsWithSales
      .sort((a, b) => b.soldInPeriod - a.soldInPeriod)
      .slice(0, 5);

    // Get mitra transactions to calculate fees
    const mitraTransactionIds = items.flatMap((item) =>
      item.transactionDetails.map((detail) => detail.transactionId)
    );
    const uniqueTransactionIds = [...new Set(mitraTransactionIds)];

    const fullTransactions = await prisma.transaction.findMany({
      where: {
        id: { in: uniqueTransactionIds },
        status: "COMPLETED",
      },
      select: {
        paymentFee: true,
        platformFee: true,
        mitraRevenue: true,
        grossAmount: true,
      },
    });

    // Calculate total fees and net revenue for this mitra
    fullTransactions.forEach((tx) => {
      stats.totalPaymentFee += Number(tx.paymentFee || 0);
      stats.totalPlatformFee += Number(tx.platformFee || 0);
      stats.netRevenue += Number(tx.mitraRevenue || 0);
    });

    return NextResponse.json({
      stats,
      products: productsWithSales,
      chartData,
      topProducts,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/reports/mitra error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
