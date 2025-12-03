# Database Architecture & Implementation Guide

## School Cafeteria POS System - Production Schema

---

## 📋 Table of Contents

1. [Schema Overview](#schema-overview)
2. [Model Documentation](#model-documentation)
3. [Fee Calculation Logic](#fee-calculation-logic)
4. [Required API Routes](#required-api-routes)
5. [Migration Instructions](#migration-instructions)
6. [Best Practices](#best-practices)

---

## Schema Overview

### Technology Stack

- **Database**: MySQL with Prisma ORM
- **Data Types**: `Decimal` for all monetary values (NO Float/Double)
- **Realtime Sync**: Firebase (Firestore/Realtime Database) for dual-screen UI
- **Payment Gateway**: Midtrans QRIS (dynamic QR codes)
- **Financial Storage**: MySQL (authoritative source of truth)

### Key Design Principles

1. **Decimal Precision**: All monetary fields use `Decimal(10, 2)` to prevent floating-point errors
2. **Settings-Driven Fees**: NEVER hardcode fee percentages; always read from `Settings` table
3. **Audit Trail**: Snapshot inventory (`stokSebelum`, `stokSesudah`) and prices at transaction time
4. **Idempotency**: `midtransOrderId` is UNIQUE to prevent duplicate payments
5. **Performance**: Strategic indexes on `Transaction(createdAt, status)` for daily reports

---

## Model Documentation

### 🔐 User Model

**Purpose**: Multi-role authentication and authorization

**Roles**:

- `USER`: Regular customer (place orders, view menu)
- `KASIR`: Cashier (operate POS, approve transactions, view sales)
- `PENGURUS`: Administrator (full access, modify settings, manage users)
- `MITRA`: Student partner (upload products, view revenue reports)

**Key Relations**:

- `items[]`: Products uploaded by MITRA
- `transactions[]`: Sales created by KASIR or orders from USER
- `posSessions[]`: Active POS sessions operated by KASIR

**Indexes**:

- `role`: Fast role-based queries
- `email`: Unique login lookup

---

### 🛍️ Item Model

**Purpose**: Products sold by student partners (MITRA)

**Critical Fields**:

- `hargaSatuan`: Unit price stored as `Decimal(10, 2)`
- `jumlahStok`: Current inventory level
- `status`: Approval workflow state
- `mitraId`: Foreign key to partner (SET NULL on delete to preserve transaction history)

**Status Workflow**:

```
PENDING → MENUNGGU_KONFIRMASI → TERSEDIA/DITOLAK
              ↓
         (PENGURUS approval)
```

**Indexes**:

- `(mitraId, status)`: Composite index for partner dashboard queries
- `status`: Fast filtering for available items

**onDelete Behavior**:

- `mitra`: `SetNull` (preserve transaction history if partner is deleted)
- `transactionDetails`: `Restrict` (prevent deletion if sold in transactions)

---

### 💳 PosSession Model

**Purpose**: Dual-screen POS session management

**Lifecycle**:

```
OPEN → PAYMENT → CLOSED
```

**Fields**:

- `sessionId`: UUID for Firebase realtime path (e.g., `/pos-sessions/{sessionId}`)
- `firebaseSessionPath`: Optional reference to Firebase node
- `kasirId`: KASIR operating this session
- `closedAt`: Timestamp when session finalized

**Usage**:

1. KASIR starts shift → Create PosSession (status=OPEN)
2. Items added to cart → Sync to Firebase under `sessionId`
3. Customer display reads Firebase → Real-time cart updates
4. Checkout initiated → Update status to PAYMENT
5. Payment completed → Create Transaction, set status=CLOSED

**Indexes**:

- `kasirId`: Find all sessions by cashier
- `status`: Query active sessions
- `createdAt`: Session history reports

---

### 💰 Transaction Model

**Purpose**: Authoritative financial record for ALL sales

**Financial Flow**:

```
grossAmount (cart total)
    ↓
paymentFee = grossAmount × (qrisFeePercent / 100)  [QRIS only]
    ↓
netAmount = grossAmount - paymentFee
    ↓
platformFee = netAmount × (platformCommissionPercent / 100)
    ↓
mitraRevenue = netAmount - platformFee  [what partner receives]
```

**Critical Fields**:

| Field             | Type            | Purpose                              |
| ----------------- | --------------- | ------------------------------------ |
| `grossAmount`     | Decimal(10,2)   | Total before any deductions          |
| `paymentFee`      | Decimal(10,2)   | QRIS gateway fee (0.7% default)      |
| `platformFee`     | Decimal(10,2)   | School commission (10% default)      |
| `netAmount`       | Decimal(10,2)   | After payment fee, before commission |
| `mitraRevenue`    | Decimal(10,2)   | Final partner payout                 |
| `midtransOrderId` | String (UNIQUE) | Prevents duplicate webhooks          |
| `qrisUrl`         | String          | Generated QR code URL                |
| `paymentExpireAt` | DateTime        | Payment deadline (+5 min default)    |

**Status Transitions**:

```
QRIS Flow:
PENDING → SETTLEMENT → COMPLETED
   ↓         ↓
EXPIRE    CANCEL

Cash Flow:
CASH → COMPLETED
```

**Indexes (Performance Critical)**:

- `(createdAt, status)`: Daily revenue reports
- `(userId, createdAt)`: User transaction history
- `midtransOrderId`: Webhook idempotency check
- `(paymentMethod, status)`: Payment analytics

**onDelete Behaviors**:

- `user`: `Restrict` (preserve financial records)
- `posSession`: `SetNull` (keep transaction even if session deleted)
- `details[]`: `Cascade` (line items deleted with transaction)

---

### 📦 TransactionDetail Model

**Purpose**: Line items with inventory audit trail

**Snapshot Philosophy**: Capture item state at transaction time to handle:

- Price changes after sale
- Item deletion
- Inventory reconciliation

**Fields**:

- `hargaSatuan`: Price at time of sale (may differ from current Item.hargaSatuan)
- `stokSebelum`: Inventory before transaction
- `stokSesudah`: Inventory after transaction (stokSebelum - jumlah)
- `subtotal`: jumlah × hargaSatuan (pre-calculated for accuracy)

**Indexes**:

- `(itemId, transactionId)`: Item sales reports (best-selling products)

**onDelete Behaviors**:

- `transaction`: `Cascade` (delete line items with parent transaction)
- `item`: `Restrict` (prevent item deletion if sold)

---

### ⚙️ Settings Model

**Purpose**: Single-row configuration table (runtime-editable)

**⚠️ CRITICAL RULES**:

1. **NEVER hardcode fee percentages in code**
2. **ALWAYS read Settings at payment creation and webhook processing**
3. **Single row enforced** (id=1 with default)

**Fee Configuration Fields**:

| Field                       | Type         | Default | Usage                           |
| --------------------------- | ------------ | ------- | ------------------------------- |
| `qrisFeePercent`            | Decimal(5,2) | 0.7     | Gateway fee (QRIS only)         |
| `platformCommissionPercent` | Decimal(5,2) | 10.0    | School commission (all methods) |
| `paymentTimeoutMinutes`     | Int          | 5       | QRIS expiry time                |

**Runtime Fee Calculation**:

```typescript
// ❌ WRONG: Hardcoded
const fee = grossAmount * 0.007;

// ✅ CORRECT: Settings-driven
const settings = await prisma.settings.findUnique({ where: { id: 1 } });
const fee = grossAmount * (settings.qrisFeePercent / 100);
```

**Other Settings**:

- Branding: `cafeteriaName`, `heroTitle`, `logoUrl`
- Contact: `kasirWhatsapp`, `contactInfo`
- Midtrans: `midtransServerKey`, `midtransEnvironment`

**Access Pattern**:

```typescript
// Cache settings in memory (refresh every 5 min)
let cachedSettings: Settings | null = null;
let lastFetch = 0;

async function getSettings() {
  if (!cachedSettings || Date.now() - lastFetch > 300000) {
    cachedSettings = await prisma.settings.findUnique({ where: { id: 1 } });
    lastFetch = Date.now();
  }
  return cachedSettings;
}
```

---

## Fee Calculation Logic

### QRIS Payment Fee Calculation

```typescript
// Step 1: Read settings
const settings = await prisma.settings.findUnique({ where: { id: 1 } });

// Step 2: Calculate fees (use Decimal library for precision)
import { Decimal } from "@prisma/client/runtime/library";

const grossAmount = new Decimal(50000); // IDR 50,000

// Payment gateway fee (QRIS only)
const paymentFee = grossAmount
  .mul(settings.qrisFeePercent)
  .div(100)
  .toDecimalPlaces(0, Decimal.ROUND_HALF_UP); // Round to nearest IDR

// Net amount after payment fee
const netAmount = grossAmount.sub(paymentFee);

// Platform commission (from net amount)
const platformFee = netAmount
  .mul(settings.platformCommissionPercent)
  .div(100)
  .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

// Mitra revenue (what partner receives)
const mitraRevenue = netAmount.sub(platformFee);

// Store in Transaction
await prisma.transaction.create({
  data: {
    grossAmount: grossAmount.toString(),
    paymentFee: paymentFee.toString(),
    netAmount: netAmount.toString(),
    platformFee: platformFee.toString(),
    mitraRevenue: mitraRevenue.toString(),
    // ... other fields
  },
});
```

### Cash Payment (No Payment Fee)

```typescript
const grossAmount = new Decimal(50000);
const paymentFee = new Decimal(0); // No gateway fee for cash
const netAmount = grossAmount; // Same as gross for cash

const platformFee = netAmount
  .mul(settings.platformCommissionPercent)
  .div(100)
  .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

const mitraRevenue = netAmount.sub(platformFee);
```

### Example Calculation (IDR)

**Scenario**: IDR 50,000 cart, QRIS payment

- QRIS Fee: 0.7%
- Platform Commission: 10%

```
Gross Amount:     50,000
Payment Fee:         350  (50,000 × 0.7%)
Net Amount:       49,650  (50,000 - 350)
Platform Fee:      4,965  (49,650 × 10%)
Mitra Revenue:    44,685  (49,650 - 4,965)
```

---

## Required API Routes

### 1. **POST /api/pos/create-session**

**Purpose**: Initialize dual-screen POS session

**Flow**:

1. Verify kasirId is KASIR role
2. Create PosSession with UUID sessionId
3. Initialize Firebase node: `/pos-sessions/{sessionId}`
4. Return sessionId to kasir screen and customer display

**Request**:

```json
{
  "kasirId": 3
}
```

**Response**:

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "firebaseSessionPath": "/pos-sessions/550e8400-e29b-41d4-a716-446655440000",
  "status": "OPEN"
}
```

---

### 2. **POST /api/pos/add-item**

**Purpose**: Add item to cart (sync to Firebase)

**Flow**:

1. Verify sessionId exists and status=OPEN
2. Check item stock availability
3. Update Firebase cart node
4. Return updated cart

**Request**:

```json
{
  "sessionId": "550e8400-...",
  "itemId": 5,
  "quantity": 2
}
```

**Response**:

```json
{
  "cart": [
    { "itemId": 5, "quantity": 2, "hargaSatuan": 15000, "subtotal": 30000 }
  ],
  "grossAmount": 30000
}
```

---

### 3. **POST /api/payments/create-qris**

**Purpose**: Generate QRIS payment (Midtrans)

**Flow**:

1. Read Settings for fees and timeout
2. Calculate grossAmount, paymentFee, platformFee, mitraRevenue
3. Generate unique midtransOrderId (e.g., `TXN-{timestamp}-{randomId}`)
4. Call Midtrans API to create dynamic QR
5. Create Transaction with status=PENDING
6. Update PosSession status=PAYMENT
7. Return qrisUrl and expiry

**Request**:

```json
{
  "sessionId": "550e8400-...",
  "customerName": "John Doe",
  "customerLocation": "Kelas 10A"
}
```

**Response**:

```json
{
  "transactionId": 123,
  "midtransOrderId": "TXN-1733184000-abc123",
  "qrisUrl": "https://api.midtrans.com/v2/qris/550e8400...",
  "grossAmount": 30000,
  "paymentFee": 210,
  "netAmount": 29790,
  "platformFee": 2979,
  "mitraRevenue": 26811,
  "expireAt": "2025-12-03T10:05:00Z"
}
```

**Midtrans API Call**:

```typescript
const midtransOrderId = `TXN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

const response = await fetch("https://api.midtrans.com/v2/charge", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(
      settings.midtransServerKey + ":"
    ).toString("base64")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payment_type: "qris",
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: grossAmount.toNumber(),
    },
    qris: {
      acquirer: "gopay", // or 'airpay'
    },
    custom_expiry: {
      expiry_duration: settings.paymentTimeoutMinutes,
      unit: "minute",
    },
  }),
});

const { actions } = await response.json();
const qrisUrl = actions.find((a) => a.name === "generate-qr-code")?.url;
```

---

### 4. **POST /api/payments/create-cash**

**Purpose**: Record cash payment (manual settlement)

**Flow**:

1. Read Settings for commission
2. Calculate fees (paymentFee=0 for cash)
3. Create Transaction with status=CASH
4. Deduct stock for all items
5. Create TransactionDetails with stock snapshots
6. Update PosSession status=CLOSED
7. Clear Firebase session

**Request**:

```json
{
  "sessionId": "550e8400-...",
  "customerName": "Jane Doe",
  "amountReceived": 50000,
  "change": 20000
}
```

**Response**:

```json
{
  "transactionId": 124,
  "status": "CASH",
  "grossAmount": 30000,
  "platformFee": 3000,
  "mitraRevenue": 27000,
  "change": 20000
}
```

---

### 5. **POST /api/webhooks/midtrans**

**Purpose**: Handle Midtrans payment notifications

**Flow**:

1. Verify signature (SHA512 hash)
2. Find Transaction by midtransOrderId
3. Update status based on transaction_status:
   - `settlement` → SETTLEMENT (payment success)
   - `expire` → EXPIRE
   - `cancel` → CANCEL
4. If SETTLEMENT:
   - Deduct stock for all items
   - Create TransactionDetails with snapshots
   - Update settledAt timestamp
   - Close PosSession
5. Send response to Midtrans

**Request (from Midtrans)**:

```json
{
  "order_id": "TXN-1733184000-abc123",
  "transaction_status": "settlement",
  "gross_amount": "30000",
  "signature_key": "abc123..."
}
```

**Signature Verification**:

```typescript
import crypto from "crypto";

const signatureKey = crypto
  .createHash("sha512")
  .update(
    `${order_id}${status_code}${gross_amount}${settings.midtransServerKey}`
  )
  .digest("hex");

if (signatureKey !== notification.signature_key) {
  return res.status(403).json({ error: "Invalid signature" });
}
```

**Idempotency Check**:

```typescript
const transaction = await prisma.transaction.findUnique({
  where: { midtransOrderId: order_id },
});

if (transaction.status === "SETTLEMENT") {
  // Already processed, return success
  return res.status(200).json({ status: "OK" });
}
```

---

### 6. **GET /api/reports/daily**

**Purpose**: Generate daily revenue report

**Flow**:

1. Query Transactions by createdAt (start/end of day)
2. Filter by status=SETTLEMENT or CASH
3. Aggregate grossAmount, paymentFee, platformFee, mitraRevenue
4. Group by paymentMethod
5. Return summary

**Query**:

```typescript
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

const transactions = await prisma.transaction.findMany({
  where: {
    createdAt: { gte: startOfDay, lte: endOfDay },
    status: { in: ["SETTLEMENT", "CASH", "COMPLETED"] },
  },
  include: { details: true },
});

const report = {
  totalGross: transactions.reduce(
    (sum, t) => sum.add(new Decimal(t.grossAmount)),
    new Decimal(0)
  ),
  totalPaymentFees: transactions.reduce(
    (sum, t) => sum.add(new Decimal(t.paymentFee)),
    new Decimal(0)
  ),
  totalPlatformFees: transactions.reduce(
    (sum, t) => sum.add(new Decimal(t.platformFee)),
    new Decimal(0)
  ),
  totalMitraRevenue: transactions.reduce(
    (sum, t) => sum.add(new Decimal(t.mitraRevenue)),
    new Decimal(0)
  ),
  qrisCount: transactions.filter((t) => t.paymentMethod === "QRIS").length,
  cashCount: transactions.filter((t) => t.paymentMethod === "CASH").length,
};
```

**Response**:

```json
{
  "date": "2025-12-03",
  "totalGross": 500000,
  "totalPaymentFees": 3500,
  "totalPlatformFees": 49650,
  "totalMitraRevenue": 446850,
  "qrisCount": 15,
  "cashCount": 8,
  "transactionCount": 23
}
```

---

### 7. **GET /api/reports/mitra-revenue**

**Purpose**: Partner revenue breakdown

**Flow**:

1. Filter Transactions by mitraId (from TransactionDetails)
2. Group by date and itemId
3. Sum mitraRevenue

**Query**:

```typescript
const transactions = await prisma.transaction.findMany({
  where: {
    status: { in: ["SETTLEMENT", "CASH", "COMPLETED"] },
    details: { some: { item: { mitraId } } },
  },
  include: {
    details: {
      include: { item: true },
      where: { item: { mitraId } },
    },
  },
});

// Calculate revenue per item
const itemRevenue = transactions.flatMap((t) =>
  t.details.map((d) => ({
    itemId: d.itemId,
    itemName: d.item.namaBarang,
    quantity: d.jumlah,
    revenue: new Decimal(t.mitraRevenue)
      .mul(d.subtotal)
      .div(t.grossAmount)
      .toDecimalPlaces(0),
  }))
);
```

---

### 8. **PATCH /api/settings**

**Purpose**: Update fee configuration (PENGURUS only)

**Flow**:

1. Verify user role = PENGURUS
2. Validate fee percentages (0-100)
3. Update Settings (id=1)
4. Clear cached settings

**Request**:

```json
{
  "qrisFeePercent": 0.8,
  "platformCommissionPercent": 12.0,
  "paymentTimeoutMinutes": 10
}
```

**Validation**:

```typescript
if (qrisFeePercent < 0 || qrisFeePercent > 100) {
  return res.status(400).json({ error: "Invalid fee percentage" });
}

await prisma.settings.update({
  where: { id: 1 },
  data: { qrisFeePercent, platformCommissionPercent },
});
```

---

## Migration Instructions

### Step 1: Backup Current Data

```bash
mysqldump -u root -p cafetaria_db > backup_$(date +%Y%m%d).sql
```

### Step 2: Generate Migration

```bash
npx prisma migrate dev --name add_qris_and_fees_support
```

### Step 3: Seed Settings Table

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure Settings row exists
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      qrisFeePercent: 0.7,
      platformCommissionPercent: 10.0,
      paymentTimeoutMinutes: 5,
      cafeteriaName: "Cafetaria Sekolah",
      heroDescription: "Nikmati makanan segar dan lezat",
      footerText: "© 2025 Cafetaria",
    },
  });

  console.log("Settings seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:

```bash
npx prisma db seed
```

### Step 4: Migrate Existing Data

```sql
-- Convert Float to Decimal (manual migration if needed)
ALTER TABLE Item MODIFY hargaSatuan DECIMAL(10, 2);
ALTER TABLE Transaction ADD COLUMN grossAmount DECIMAL(10, 2);
UPDATE Transaction SET grossAmount = totalHarga WHERE grossAmount IS NULL;

-- Add default values for new fields
UPDATE Transaction SET paymentFee = 0, platformFee = 0, netAmount = grossAmount, mitraRevenue = grossAmount WHERE paymentFee IS NULL;
```

### Step 5: Verify Migration

```bash
npx prisma studio
```

Check:

- Settings table has 1 row
- All Decimal fields display correctly
- Indexes are created
- Relations are intact

---

## Best Practices

### 1. **Never Hardcode Fees**

```typescript
// ❌ BAD
const fee = amount * 0.007;

// ✅ GOOD
const settings = await getSettings();
const fee = amount.mul(settings.qrisFeePercent).div(100);
```

### 2. **Use Decimal for Money**

```typescript
// ❌ BAD
const total = 10.5 + 20.3; // 30.799999999999997

// ✅ GOOD
import { Decimal } from "@prisma/client/runtime/library";
const total = new Decimal(10.5).add(new Decimal(20.3)); // 30.8
```

### 3. **Snapshot Item Data**

```typescript
// ❌ BAD (uses current price)
await prisma.transactionDetail.create({
  data: { itemId, hargaSatuan: item.hargaSatuan },
});

// ✅ GOOD (snapshot at transaction time)
const itemSnapshot = await prisma.item.findUnique({ where: { id: itemId } });
await prisma.transactionDetail.create({
  data: {
    itemId,
    hargaSatuan: itemSnapshot.hargaSatuan,
    stokSebelum: itemSnapshot.jumlahStok,
    stokSesudah: itemSnapshot.jumlahStok - quantity,
  },
});
```

### 4. **Verify Midtrans Webhooks**

```typescript
// ❌ BAD (accepts any webhook)
await prisma.transaction.update({
  where: { midtransOrderId },
  data: { status: "SETTLEMENT" },
});

// ✅ GOOD (verifies signature)
const isValid = verifySignature(notification, settings.midtransServerKey);
if (!isValid) throw new Error("Invalid signature");
```

### 5. **Use Transactions for Stock Deduction**

```typescript
// ✅ GOOD (atomic operation)
await prisma.$transaction(async (tx) => {
  // Deduct stock
  await tx.item.update({
    where: { id: itemId },
    data: { jumlahStok: { decrement: quantity } },
  });

  // Create transaction detail
  await tx.transactionDetail.create({
    data: { transactionId, itemId, jumlah: quantity },
  });
});
```

### 6. **Index Optimization**

```typescript
// Use composite indexes for common queries
const transactions = await prisma.transaction.findMany({
  where: {
    createdAt: { gte: startDate, lte: endDate },
    status: "SETTLEMENT",
  },
  // This query benefits from index: (createdAt, status)
});
```

### 7. **Cache Settings**

```typescript
// Global settings cache (refresh every 5 min)
let settingsCache: Settings | null = null;
let lastFetch = 0;

export async function getSettings(): Promise<Settings> {
  const now = Date.now();
  if (!settingsCache || now - lastFetch > 300000) {
    settingsCache = await prisma.settings.findUnique({ where: { id: 1 } });
    lastFetch = now;
  }
  return settingsCache!;
}
```

---

## H+1 Settlement Reconciliation

Midtrans provides settlement reports the next day. Implement daily reconciliation:

```typescript
// Run daily at 2 AM
async function reconcileSettlements() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Fetch Midtrans settlement report
  const report = await fetchMidtransSettlementReport(yesterday);

  // Compare with database
  const dbTransactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: yesterday },
      paymentMethod: "QRIS",
      status: "SETTLEMENT",
    },
  });

  for (const dbTxn of dbTransactions) {
    const midtransTxn = report.find(
      (r) => r.order_id === dbTxn.midtransOrderId
    );

    if (!midtransTxn) {
      console.warn(`Missing settlement: ${dbTxn.midtransOrderId}`);
    } else if (midtransTxn.gross_amount !== dbTxn.grossAmount.toString()) {
      console.error(`Amount mismatch: ${dbTxn.midtransOrderId}`);
    }
  }
}
```

---

## Summary

**Key Achievements**:

- ✅ Production-ready Prisma schema with Decimal precision
- ✅ Settings-driven fee calculation (no hardcoded percentages)
- ✅ Complete QRIS payment flow with Midtrans integration
- ✅ Dual-screen POS session management
- ✅ Comprehensive audit trail (stock snapshots, price snapshots)
- ✅ Optimized indexes for daily reports
- ✅ Idempotent webhook handling
- ✅ Partner revenue calculation with 10% commission

**Next Steps**:

1. Run migration: `npx prisma migrate dev`
2. Seed Settings: `npx prisma db seed`
3. Implement API routes (see above)
4. Configure Midtrans credentials in Settings
5. Test dual-screen flow with Firebase
6. Deploy and monitor settlement reconciliation

---

**For Questions or Issues**:

- Prisma Documentation: https://www.prisma.io/docs
- Midtrans API: https://api-docs.midtrans.com
- Decimal.js: https://mikemcl.github.io/decimal.js
