# API Routes Implementation Reference

## Quick Guide for Next.js API Routes

---

## 📁 Required API Route Structure

```
src/app/api/
├── pos/
│   ├── create-session/route.ts    # Initialize dual-screen session
│   ├── add-item/route.ts           # Add item to cart
│   └── close-session/route.ts      # Finalize session
├── payments/
│   ├── create-qris/route.ts        # Generate QRIS payment
│   ├── create-cash/route.ts        # Record cash payment
│   └── check-status/route.ts       # Poll payment status
├── webhooks/
│   └── midtrans/route.ts           # Handle Midtrans notifications
├── reports/
│   ├── daily/route.ts              # Daily revenue report
│   ├── mitra-revenue/route.ts      # Partner revenue breakdown
│   └── transaction-history/route.ts # Transaction list
└── settings/
    ├── route.ts                    # GET/PATCH settings
    └── fees/route.ts               # Update fee configuration
```

---

## 🔥 Critical Implementation Notes

### 1. Settings Access Pattern (USE EVERYWHERE)

```typescript
// lib/settings.ts
import { PrismaClient, Settings } from "@prisma/client";
import { cache } from "react";

const prisma = new PrismaClient();

// Cache settings for 5 minutes
let settingsCache: Settings | null = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSettings(): Promise<Settings> {
  const now = Date.now();

  if (!settingsCache || now - lastFetch > CACHE_DURATION) {
    settingsCache = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settingsCache) {
      throw new Error("Settings not initialized. Run: npx prisma db seed");
    }

    lastFetch = now;
  }

  return settingsCache;
}

// Force refresh (call after PATCH /api/settings)
export function invalidateSettingsCache() {
  settingsCache = null;
  lastFetch = 0;
}
```

---

### 2. Fee Calculation Utilities

```typescript
// lib/fee-calculator.ts
import { Decimal } from "@prisma/client/runtime/library";
import { getSettings } from "./settings";

export interface FeeCalculation {
  grossAmount: Decimal;
  paymentFee: Decimal;
  netAmount: Decimal;
  platformFee: Decimal;
  mitraRevenue: Decimal;
}

export async function calculateFees(
  grossAmount: number | Decimal,
  paymentMethod: "QRIS" | "CASH"
): Promise<FeeCalculation> {
  const settings = await getSettings();
  const gross = new Decimal(grossAmount);

  // Step 1: Payment gateway fee (QRIS only)
  const paymentFee =
    paymentMethod === "QRIS"
      ? gross
          .mul(settings.qrisFeePercent)
          .div(100)
          .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      : new Decimal(0);

  // Step 2: Net amount after payment fee
  const netAmount = gross.sub(paymentFee);

  // Step 3: Platform commission (from net amount)
  const platformFee = netAmount
    .mul(settings.platformCommissionPercent)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  // Step 4: Mitra revenue (final payout)
  const mitraRevenue = netAmount.sub(platformFee);

  return {
    grossAmount: gross,
    paymentFee,
    netAmount,
    platformFee,
    mitraRevenue,
  };
}
```

---

### 3. Midtrans Integration

```typescript
// lib/midtrans.ts
import crypto from "crypto";
import { getSettings } from "./settings";

export async function createQrisPayment(params: {
  orderId: string;
  grossAmount: number;
  customerName?: string;
}) {
  const settings = await getSettings();

  const authString = Buffer.from(`${settings.midtransServerKey}:`).toString(
    "base64"
  );
  const baseUrl =
    settings.midtransEnvironment === "production"
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

  const response = await fetch(`${baseUrl}/v2/charge`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      qris: {
        acquirer: "gopay",
      },
      custom_expiry: {
        expiry_duration: settings.paymentTimeoutMinutes,
        unit: "minute",
      },
      customer_details: params.customerName
        ? {
            first_name: params.customerName,
          }
        : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Midtrans API error: ${error.error_messages?.join(", ")}`);
  }

  const data = await response.json();

  return {
    transactionId: data.transaction_id,
    orderId: data.order_id,
    qrisUrl: data.actions?.find((a: any) => a.name === "generate-qr-code")?.url,
    expireTime: data.expiry_time,
  };
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  return hash === signatureKey;
}
```

---

### 4. Stock Management Utilities

```typescript
// lib/stock.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deductStock(
  itemId: number,
  quantity: number,
  tx: any = prisma
) {
  const item = await tx.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error(`Item ${itemId} not found`);
  }

  if (item.jumlahStok < quantity) {
    throw new Error(
      `Insufficient stock for ${item.namaBarang}. Available: ${item.jumlahStok}, Requested: ${quantity}`
    );
  }

  await tx.item.update({
    where: { id: itemId },
    data: {
      jumlahStok: { decrement: quantity },
    },
  });

  return {
    stokSebelum: item.jumlahStok,
    stokSesudah: item.jumlahStok - quantity,
  };
}
```

---

## 🎯 Example API Route Implementations

### POST /api/pos/create-session

```typescript
// src/app/api/pos/create-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "KASIR") {
      return NextResponse.json(
        { error: "Unauthorized. KASIR role required." },
        { status: 403 }
      );
    }

    // 2. Create POS session
    const sessionId = uuidv4();
    const posSession = await prisma.posSession.create({
      data: {
        sessionId,
        kasirId: session.user.id,
        status: "OPEN",
        firebaseSessionPath: `/pos-sessions/${sessionId}`,
      },
    });

    // 3. Initialize Firebase node (optional)
    // await initializeFirebaseSession(sessionId);

    return NextResponse.json({
      sessionId: posSession.sessionId,
      firebaseSessionPath: posSession.firebaseSessionPath,
      status: posSession.status,
      createdAt: posSession.createdAt,
    });
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create POS session", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### POST /api/payments/create-qris

```typescript
// src/app/api/payments/create-qris/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateFees } from "@/lib/fee-calculator";
import { createQrisPayment } from "@/lib/midtrans";
import { getSettings } from "@/lib/settings";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, customerName, customerLocation, cartItems } = body;

    // 1. Validate session
    const posSession = await prisma.posSession.findUnique({
      where: { sessionId },
      include: { kasir: true },
    });

    if (!posSession || posSession.status !== "OPEN") {
      return NextResponse.json(
        { error: "Invalid or closed session" },
        { status: 400 }
      );
    }

    // 2. Calculate gross amount
    const grossAmount = cartItems.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.hargaSatuan) * item.quantity;
    }, 0);

    // 3. Calculate fees using Settings
    const fees = await calculateFees(grossAmount, "QRIS");

    // 4. Generate unique order ID
    const orderId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    // 5. Create Midtrans QRIS payment
    const midtransResponse = await createQrisPayment({
      orderId,
      grossAmount: fees.grossAmount.toNumber(),
      customerName,
    });

    // 6. Get settings for expiry calculation
    const settings = await getSettings();
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + settings.paymentTimeoutMinutes);

    // 7. Create Transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        userId: posSession.kasirId,
        posSessionId: posSession.id,
        grossAmount: fees.grossAmount.toString(),
        paymentFee: fees.paymentFee.toString(),
        netAmount: fees.netAmount.toString(),
        platformFee: fees.platformFee.toString(),
        mitraRevenue: fees.mitraRevenue.toString(),
        paymentMethod: "QRIS",
        status: "PENDING",
        midtransOrderId: orderId,
        qrisUrl: midtransResponse.qrisUrl,
        paymentExpireAt: expireAt,
        customerName,
        customerLocation,
        createdBy: posSession.kasirId,
      },
    });

    // 8. Update session status
    await prisma.posSession.update({
      where: { id: posSession.id },
      data: { status: "PAYMENT" },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      midtransOrderId: orderId,
      qrisUrl: midtransResponse.qrisUrl,
      grossAmount: fees.grossAmount.toNumber(),
      paymentFee: fees.paymentFee.toNumber(),
      netAmount: fees.netAmount.toNumber(),
      platformFee: fees.platformFee.toNumber(),
      mitraRevenue: fees.mitraRevenue.toNumber(),
      expireAt: expireAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Create QRIS payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### POST /api/webhooks/midtrans

```typescript
// src/app/api/webhooks/midtrans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { getSettings } from "@/lib/settings";
import { deductStock } from "@/lib/stock";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = notification;

    // 1. Verify signature
    const settings = await getSettings();
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      settings.midtransServerKey!,
      signature_key
    );

    if (!isValid) {
      console.error("Invalid Midtrans signature:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: order_id },
      include: { posSession: true },
    });

    if (!transaction) {
      console.error("Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // 3. Idempotency check
    if (transaction.status === "SETTLEMENT") {
      console.log("Transaction already settled:", order_id);
      return NextResponse.json({ status: "OK" });
    }

    // 4. Map Midtrans status to our status
    let newStatus: string;

    if (transaction_status === "settlement" && fraud_status === "accept") {
      newStatus = "SETTLEMENT";
    } else if (transaction_status === "expire") {
      newStatus = "EXPIRE";
    } else if (transaction_status === "cancel") {
      newStatus = "CANCEL";
    } else {
      // Pending or other status, don't update
      return NextResponse.json({ status: "OK" });
    }

    // 5. If settlement, deduct stock and create transaction details
    if (newStatus === "SETTLEMENT") {
      await prisma.$transaction(async (tx) => {
        // Get cart from Firebase or stored session data
        // For this example, assume cartItems are stored in posSession
        const cartItems = []; // TODO: Retrieve from Firebase

        // Create transaction details and deduct stock
        for (const item of cartItems) {
          const stockInfo = await deductStock(item.itemId, item.quantity, tx);

          await tx.transactionDetail.create({
            data: {
              transactionId: transaction.id,
              itemId: item.itemId,
              jumlah: item.quantity,
              hargaSatuan: item.hargaSatuan,
              subtotal: (item.hargaSatuan * item.quantity).toString(),
              stokSebelum: stockInfo.stokSebelum,
              stokSesudah: stockInfo.stokSesudah,
            },
          });
        }

        // Update transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: newStatus as any,
            settledAt: new Date(),
          },
        });

        // Close POS session
        if (transaction.posSession) {
          await tx.posSession.update({
            where: { id: transaction.posSession.id },
            data: {
              status: "CLOSED",
              closedAt: new Date(),
            },
          });
        }
      });
    } else {
      // Expire or cancel, just update status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: newStatus as any },
      });
    }

    console.log(`Transaction ${order_id} updated to ${newStatus}`);
    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### GET /api/reports/daily

```typescript
// src/app/api/reports/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication (KASIR or PENGURUS)
    const session = await getServerSession(authOptions);
    if (!session || !["KASIR", "PENGURUS"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Parse date query parameter
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Query transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ["SETTLEMENT", "CASH", "COMPLETED"] },
      },
      include: {
        details: {
          include: { item: true },
        },
      },
    });

    // 4. Aggregate totals
    const totals = transactions.reduce(
      (acc, t) => ({
        grossAmount: acc.grossAmount.add(new Decimal(t.grossAmount)),
        paymentFee: acc.paymentFee.add(new Decimal(t.paymentFee)),
        platformFee: acc.platformFee.add(new Decimal(t.platformFee)),
        mitraRevenue: acc.mitraRevenue.add(new Decimal(t.mitraRevenue)),
        qrisCount: acc.qrisCount + (t.paymentMethod === "QRIS" ? 1 : 0),
        cashCount: acc.cashCount + (t.paymentMethod === "CASH" ? 1 : 0),
      }),
      {
        grossAmount: new Decimal(0),
        paymentFee: new Decimal(0),
        platformFee: new Decimal(0),
        mitraRevenue: new Decimal(0),
        qrisCount: 0,
        cashCount: 0,
      }
    );

    // 5. Calculate item sales
    const itemSales = new Map<number, any>();

    transactions.forEach((t) => {
      t.details.forEach((d) => {
        const existing = itemSales.get(d.itemId) || {
          itemId: d.itemId,
          namaBarang: d.item.namaBarang,
          totalQuantity: 0,
          totalRevenue: new Decimal(0),
        };

        existing.totalQuantity += d.jumlah;
        existing.totalRevenue = existing.totalRevenue.add(
          new Decimal(d.subtotal)
        );

        itemSales.set(d.itemId, existing);
      });
    });

    return NextResponse.json({
      date: targetDate.toISOString().split("T")[0],
      summary: {
        totalGross: totals.grossAmount.toNumber(),
        totalPaymentFees: totals.paymentFee.toNumber(),
        totalPlatformFees: totals.platformFee.toNumber(),
        totalMitraRevenue: totals.mitraRevenue.toNumber(),
        transactionCount: transactions.length,
        qrisCount: totals.qrisCount,
        cashCount: totals.cashCount,
      },
      topItems: Array.from(itemSales.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10)
        .map((item) => ({
          ...item,
          totalRevenue: item.totalRevenue.toNumber(),
        })),
      transactions: transactions.map((t) => ({
        id: t.id,
        time: t.createdAt,
        customerName: t.customerName,
        grossAmount: parseFloat(t.grossAmount.toString()),
        paymentMethod: t.paymentMethod,
        status: t.status,
      })),
    });
  } catch (error: any) {
    console.error("Daily report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### PATCH /api/settings

```typescript
// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { invalidateSettingsCache } from "@/lib/settings";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not initialized" },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify PENGURUS role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PENGURUS") {
      return NextResponse.json(
        { error: "Unauthorized. PENGURUS role required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // 2. Validate fee percentages
    if (body.qrisFeePercent !== undefined) {
      const fee = parseFloat(body.qrisFeePercent);
      if (fee < 0 || fee > 100) {
        return NextResponse.json(
          { error: "qrisFeePercent must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    if (body.platformCommissionPercent !== undefined) {
      const commission = parseFloat(body.platformCommissionPercent);
      if (commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: "platformCommissionPercent must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    // 3. Update settings
    const updated = await prisma.settings.update({
      where: { id: 1 },
      data: body,
    });

    // 4. Invalidate cache
    invalidateSettingsCache();

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Deployment Checklist

- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Seed Settings: `npx prisma db seed`
- [ ] Configure Midtrans credentials in Settings
- [ ] Set up Firebase for dual-screen sync
- [ ] Test QRIS payment flow end-to-end
- [ ] Test webhook signature verification
- [ ] Implement rate limiting on webhook endpoint
- [ ] Set up daily settlement reconciliation cron job
- [ ] Monitor transaction status transitions
- [ ] Test fee calculation with different amounts
- [ ] Verify stock deduction accuracy
- [ ] Test Settings cache invalidation
- [ ] Load test concurrent POS sessions

---

## 📊 Testing Scenarios

### 1. QRIS Payment Success

1. Create session → Add items → Create QRIS
2. Scan QR with test account
3. Verify webhook received with `settlement`
4. Check stock deducted correctly
5. Verify fees calculated per Settings

### 2. QRIS Payment Expiry

1. Create QRIS payment
2. Wait for timeout (5 min)
3. Verify webhook with `expire` status
4. Check transaction status = EXPIRE
5. Verify stock NOT deducted

### 3. Cash Payment

1. Create session → Add items → Create cash payment
2. Verify immediate stock deduction
3. Check paymentFee = 0
4. Verify platformFee still calculated

### 4. Settings Update

1. PENGURUS updates qrisFeePercent
2. Create new payment
3. Verify new fee percentage applied
4. Check old transactions unchanged

### 5. Daily Report

1. Create 10 QRIS + 5 cash transactions
2. Generate daily report
3. Verify totals match
4. Check top items ranking

---

## 🔒 Security Notes

1. **Always verify Midtrans signatures**
2. **Rate limit webhook endpoint** (prevent abuse)
3. **Sanitize customer input** (customerName, notes)
4. **Use HTTPS in production** (required for webhooks)
5. **Store Midtrans keys encrypted** (use env variables)
6. **Implement CSRF protection** on settings update
7. **Log all financial operations** (audit trail)
8. **Use database transactions** for stock deduction

---

**For Full Documentation**: See `DATABASE_ARCHITECTURE.md`
