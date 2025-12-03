# 🖥️ Dual-Screen POS Setup Guide

## Overview

Sistem POS mendukung **dual-screen mode** dimana:

- **Screen 1 (Kasir)**: Dashboard kasir untuk input transaksi
- **Screen 2 (Customer Display)**: Tampilan untuk customer yang menunjukkan:
  - Daftar barang yang dibeli
  - Total harga real-time
  - QR Code pembayaran (untuk QRIS)

Kedua layar tersinkronisasi secara **real-time** menggunakan API polling (atau Firebase untuk production).

---

## 🚀 How to Use

### Step 1: Start Dual-Screen Session (Kasir)

1. Login sebagai **KASIR**
2. Di dashboard kasir, klik button **"🖥️ Dual Screen"**
3. Session baru akan dibuat dengan unique Session ID
4. QR Code akan muncul untuk ditampilkan ke customer

### Step 2: Customer Scans QR Code

Customer scan QR code dengan smartphone/tablet mereka, atau:

**Manual Access**:

```
http://localhost:3000/customer-display?sessionId=<session-id>
```

### Step 3: Add Items to Cart (Kasir)

1. Di kasir dashboard, klik item untuk menambah ke cart
2. **Customer display otomatis update** menampilkan item yang ditambahkan
3. Total harga terupdate real-time

### Step 4: Checkout with QRIS

1. Kasir pilih payment method: **QRIS**
2. Klik **Checkout**
3. **Customer display otomatis menampilkan QR Code pembayaran**
4. Customer scan QR code untuk bayar
5. Status update otomatis setelah payment berhasil

### Step 5: Checkout with CASH

1. Kasir pilih payment method: **CASH**
2. Klik **Checkout**
3. Transaksi langsung selesai
4. Customer display menampilkan "Pembayaran Berhasil"

---

## 📱 Customer Display Features

### Real-time Updates

Customer display otomatis update setiap **2 detik** untuk menampilkan:

- ✅ Items yang ditambahkan ke cart
- ✅ Quantity changes
- ✅ Total amount
- ✅ QR code saat checkout (QRIS)
- ✅ Payment status

### Display States

1. **OPEN** - Menunggu kasir input items
2. **PAYMENT** - Menampilkan QR code untuk payment
3. **CLOSED** - Transaksi selesai, menampilkan success message

---

## 🔧 Technical Implementation

### Architecture

```
┌─────────────┐          ┌──────────────┐          ┌──────────────┐
│   Kasir     │          │   API/DB     │          │   Customer   │
│  Dashboard  │◄────────►│              │◄────────►│   Display    │
└─────────────┘          └──────────────┘          └──────────────┘
     Screen 1                Backend                   Screen 2
```

### API Endpoints

#### Create Session

```typescript
POST /api/pos/session

Response:
{
  "sessionId": "uuid-here",
  "kasirName": "Kasir 1",
  "qrCodeUrl": "http://localhost:3000/customer-display?sessionId=...",
  "firebaseSessionPath": "/pos-sessions/uuid-here"
}
```

#### Get Session Data

```typescript
GET /api/pos/session/[sessionId]

Response:
{
  "session": {
    "sessionId": "uuid",
    "kasirName": "Kasir 1",
    "status": "OPEN",
    "cart": [
      {
        "itemId": 1,
        "namaBarang": "Nasi Goreng",
        "quantity": 2,
        "hargaSatuan": 15000,
        "subtotal": 30000,
        "fotoUrl": "..."
      }
    ],
    "grossAmount": 30000,
    "qrisUrl": null,
    "expireAt": null,
    "updatedAt": "2025-12-03T12:00:00Z"
  }
}
```

#### Update Session Status

```typescript
PATCH /api/pos/session/[sessionId]
{
  "status": "PAYMENT" | "CLOSED"
}
```

### Database Schema

```prisma
model PosSession {
  id                  Int              @id @default(autoincrement())
  sessionId           String           @unique
  kasirId             Int
  status              PosSessionStatus @default(OPEN)
  firebaseSessionPath String?

  kasir               User             @relation(...)
  transactions        Transaction[]

  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  closedAt            DateTime?
}

enum PosSessionStatus {
  OPEN
  PAYMENT
  CLOSED
}
```

---

## 🎨 UI/UX Features

### Kasir Dashboard

- **Dual Screen button** - Create new session
- **Show QR button** - Display QR code modal
- **Session indicator** - Shows active session ID

### Customer Display

- **Live indicator** - Green dot showing real-time connection
- **Animated updates** - Smooth transitions when cart changes
- **Large QR code** - Easy to scan
- **Countdown timer** - Shows payment expiry time
- **Success animation** - After payment complete

---

## 🔥 Production Setup (Optional)

### Firebase Real-time Sync

Untuk production, replace API polling dengan Firebase real-time listener:

#### 1. Setup Firebase

```bash
# Already configured in ENVIRONMENT_SETUP.md
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
```

#### 2. Update Kasir Dashboard

```typescript
// Replace polling with Firebase listener
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const sessionRef = ref(db, `pos-sessions/${sessionId}`);

onValue(sessionRef, (snapshot) => {
  const data = snapshot.val();
  // Update cart state
  setCart(data.cart);
  setGrossAmount(data.grossAmount);
  setQrisUrl(data.qrisUrl);
});
```

#### 3. Update Customer Display

```typescript
// Same Firebase listener on customer side
const sessionRef = ref(db, `pos-sessions/${sessionId}`);

onValue(sessionRef, (snapshot) => {
  const data = snapshot.val();
  setSessionData(data);
});
```

#### 4. Sync Cart Changes

```typescript
// When kasir adds item
import { getDatabase, ref, set } from "firebase/database";

const db = getDatabase();
const sessionRef = ref(db, `pos-sessions/${sessionId}`);

await set(sessionRef, {
  sessionId,
  kasirName,
  status: "OPEN",
  cart: updatedCart,
  grossAmount: total,
  updatedAt: new Date().toISOString(),
});
```

---

## 🧪 Testing Dual-Screen

### Test Scenario 1: Basic Flow

1. Open **2 browser windows**:

   - Window 1: Kasir dashboard (login as kasir@test.com)
   - Window 2: Customer display

2. Kasir: Click "🖥️ Dual Screen"
3. Copy the URL from QR modal
4. Paste URL in Window 2 (customer display)
5. Kasir: Add items to cart
6. Verify: Customer display updates automatically
7. Kasir: Click checkout (QRIS)
8. Verify: QR code appears on customer display

### Test Scenario 2: Multiple Sessions

1. Create session A
2. Create session B
3. Verify both sessions independent
4. Each customer display shows correct cart

### Test Scenario 3: Session Expiry

1. Create session
2. Wait for payment timeout (5 minutes)
3. Verify: QR code expires
4. Verify: Session status updates to EXPIRE

---

## 📊 Monitoring & Debugging

### Check Active Sessions

```sql
-- MySQL query
SELECT sessionId, kasirId, status, createdAt, closedAt
FROM PosSession
WHERE status != 'CLOSED'
ORDER BY createdAt DESC;
```

### Debug Customer Display

Open browser console di customer display:

```javascript
// Check polling
console.log("Session data:", sessionData);
console.log("Connected:", connected);
console.log("Last updated:", sessionData?.updatedAt);
```

### Common Issues

#### Issue: Customer display tidak update

**Solution**: Check API polling interval (default 2 seconds)

#### Issue: QR code tidak muncul

**Solution**:

- Verify payment method = QRIS
- Check Midtrans credentials configured
- Verify transaction status = PAYMENT

#### Issue: Session ID not found

**Solution**:

- Verify sessionId parameter in URL
- Check session exists in database
- Session may have been closed

---

## 🚀 Advanced Features (Future)

### Planned Enhancements

1. **WebSocket Support** - Replace polling with WebSocket for instant updates
2. **QR Code Generator** - Generate actual QR code image (use `qrcode.react`)
3. **Multi-language** - Support English/Indonesian toggle
4. **Custom Branding** - Logo and colors from Settings
5. **Receipt Printer** - Auto-print receipt after payment
6. **Customer Feedback** - Rating after transaction
7. **Loyalty Program** - Point accumulation per transaction

### QR Code Generator Example

```bash
npm install qrcode.react
```

```typescript
import QRCode from "qrcode.react";

<QRCode value={customerDisplayUrl} size={256} level="H" includeMargin />;
```

---

## 📝 Best Practices

1. **Create new session** per transaction untuk isolasi data
2. **Close session** setelah payment berhasil
3. **Monitor active sessions** dan clean up yang lama
4. **Use HTTPS** di production untuk QR code security
5. **Rate limit** API endpoint untuk prevent abuse
6. **Cache session data** untuk reduce DB queries
7. **Log all session events** untuk audit trail

---

## 🎓 Learn More

- [Customer Display Implementation](./src/app/customer-display/page.tsx)
- [Kasir Dashboard](./src/app/dashboard/kasir/page.tsx)
- [Session API](./src/app/api/pos/session/route.ts)
- [Firebase Setup](./ENVIRONMENT_SETUP.md)

---

**Ready to test!** 🚀

Buka 2 browser windows dan test dual-screen flow!
