# 🚀 Quick Start Guide

Panduan cepat untuk mulai menggunakan Cafetaria POS System.

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Setup Database (2 min)

```bash
# Pastikan MySQL running
# Buat database (jika belum ada)
mysql -u root -p
CREATE DATABASE cafetaria_db;
exit;

# Copy .env.example ke .env
cp .env.example .env

# Edit .env, minimal set:
# DATABASE_URL="mysql://root:password@localhost:3306/cafetaria_db"
# NEXTAUTH_SECRET="<generate dengan: openssl rand -base64 32>"
```

### Step 3: Run Migration & Seed (1 min)

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4: Start Server (1 min)

```bash
npm run dev
```

Buka http://localhost:3000 🎉

---

## 🧪 Testing Features

### Test 1: Login & Authentication

```bash
# Login sebagai KASIR
Email: kasir@test.com
Password: password123

# Login sebagai PENGURUS
Email: pengurus@test.com
Password: password123

# Login sebagai MITRA
Email: mitra@test.com
Password: password123
```

### Test 2: Create Cash Transaction (KASIR)

1. Login sebagai **kasir@test.com**
2. Pilih dashboard **Kasir**
3. Tambah items ke cart (klik product cards)
4. Pilih payment method: **CASH**
5. Click **Checkout**
6. Verifikasi:
   - ✅ Transaction created
   - ✅ Stock berkurang
   - ✅ Redirect ke success page

### Test 3: Create QRIS Transaction (Need Midtrans Setup)

**Prerequisite**: Set environment variables:

```bash
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_ENVIRONMENT="sandbox"
```

**Steps**:

1. Login sebagai KASIR
2. Tambah items ke cart
3. Pilih payment method: **QRIS**
4. Click Checkout
5. QR Code akan muncul
6. Test dengan [Midtrans Simulator](https://simulator.sandbox.midtrans.com)
7. Verifikasi webhook received
8. Stock otomatis berkurang setelah payment success

### Test 4: Mitra Add Item

1. Login sebagai **mitra@test.com**
2. Go to **Dashboard Mitra**
3. Click **Tambah Barang Baru**
4. Fill form:
   - Nama Barang: "Nasi Goreng Spesial"
   - Stok: 20
   - Harga: 18000
   - Upload foto
5. Submit → Status: **PENDING**
6. Logout

### Test 5: Pengurus Approve Item

1. Login sebagai **pengurus@test.com**
2. Go to **Dashboard Pengurus**
3. Find item dengan status PENDING
4. Click **Approve** atau **Reject**
5. Verifikasi:
   - ✅ Status berubah menjadi TERSEDIA/DITOLAK
   - ✅ Item muncul di menu kasir (jika approved)

### Test 6: View Reports

1. Login sebagai **PENGURUS** atau **KASIR**
2. Go to **Laporan**
3. Set date range
4. Verifikasi data:
   - Total transactions
   - Total revenue
   - Payment method breakdown
   - Top selling items

---

## 🔧 Advanced Setup (Optional)

### Enable Dual-Screen POS with Firebase

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Realtime Database

2. **Get Service Account**

   - Project Settings → Service Accounts
   - Generate New Private Key
   - Download JSON

3. **Convert to Single Line**

   ```bash
   cat firebase-key.json | tr -d '\n' > firebase-key-single.txt
   ```

4. **Add to .env**

   ```bash
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
   ```

5. **Test Dual-Screen**
   - Screen 1: Kasir dashboard (add items)
   - Screen 2: Open `/customer-display?sessionId=xxx`
   - Changes sync in real-time

---

## 📊 API Testing

### Test All Endpoints

```bash
# Start dev server
npm run dev

# Run API test script
npx tsx test-api.ts
```

Expected output:

```
✅ GET /api/items
✅ GET /api/settings
✅ GET /api/webhooks/midtrans
✅ POST /api/auth/callback/credentials
✅ POST /api/transactions

📊 Test Summary
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100.0%
```

### Manual API Tests with curl

```bash
# Get all items (public)
curl http://localhost:3000/api/items

# Get settings (public)
curl http://localhost:3000/api/settings

# Create transaction (needs auth)
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=xxx" \
  -d '{
    "items": [{"itemId": 1, "quantity": 2}],
    "paymentMethod": "CASH",
    "customerName": "Test"
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: "Database not found"

```bash
# Create database manually
mysql -u root -p
CREATE DATABASE cafetaria_db;
exit;

# Then run migration again
npx prisma migrate dev
```

### Issue: "P2002: Unique constraint failed"

```bash
# Reset database
npx prisma migrate reset

# Re-seed
npx prisma db seed
```

### Issue: "NextAuth: No secret provided"

```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="<generated-secret>"
```

### Issue: "Midtrans: Invalid signature"

```bash
# Make sure using correct environment
MIDTRANS_ENVIRONMENT="sandbox"

# Check server key matches
MIDTRANS_SERVER_KEY="SB-Mid-server-..." # Should start with SB- for sandbox
```

### Issue: "Stock not deducting after QRIS payment"

```bash
# Webhook not accessible locally
# Solution 1: Use ngrok
ngrok http 3000

# Solution 2: Test with Midtrans simulator
# Go to: https://simulator.sandbox.midtrans.com
```

---

## 📈 Performance Tips

### 1. Enable Settings Cache

Already implemented! Settings cached for 5 minutes.

### 2. Add Database Indexes

Already optimized in schema:

- Transaction(createdAt, status)
- Transaction(userId, createdAt)
- TransactionDetail(itemId, transactionId)

### 3. Optimize Images

```bash
# Install sharp for Next.js image optimization
npm install sharp
```

### 4. Enable Production Mode

```bash
npm run build
npm start
```

---

## 🎓 Learn More

- [Full Documentation](./README.md)
- [Database Schema](./DATABASE_ARCHITECTURE.md)
- [API Reference](./API_ROUTES_REFERENCE.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Use production Midtrans credentials
- [ ] Configure Firebase security rules
- [ ] Enable HTTPS
- [ ] Set up backup automation
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Test webhook with real Midtrans account
- [ ] Load test with expected traffic
- [ ] Document API rate limits

---

Happy coding! 🚀
