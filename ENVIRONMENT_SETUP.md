# Environment Configuration Guide

## Overview

Konfigurasi untuk Midtrans, Firebase, dan services lainnya menggunakan **environment variables** (`.env` file), **BUKAN dari database**. Ini untuk keamanan dan best practice.

## Quick Start

1. **Copy `.env.example` ke `.env`**:

   ```bash
   cp .env.example .env
   ```

2. **Isi semua credentials yang diperlukan** (lihat panduan di bawah)

3. **Restart development server** setelah mengubah `.env`

---

## Required Environment Variables

### 1. Database Configuration

```bash
DATABASE_URL="mysql://username:password@localhost:3306/cafetaria_db"
```

- Ganti `username` dan `password` dengan credentials MySQL Anda
- Pastikan database `cafetaria_db` sudah dibuat

### 2. NextAuth Configuration

```bash
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

- Generate `NEXTAUTH_SECRET`:
  ```bash
  openssl rand -base64 32
  ```
- Untuk production, ganti `NEXTAUTH_URL` dengan domain Anda

### 3. Midtrans Configuration (QRIS Payment)

```bash
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxx"
MIDTRANS_ENVIRONMENT="sandbox"  # atau "production"
```

**Cara mendapatkan Midtrans credentials**:

1. **Register** di [Midtrans Dashboard](https://dashboard.midtrans.com/register)
2. **Login** dan pilih environment:
   - **Sandbox** (testing): Settings → Access Keys → Sandbox
   - **Production** (live): Settings → Access Keys → Production
3. **Copy** Server Key dan Client Key
4. **Paste** ke `.env` file

**Environment modes**:

- `sandbox` - Untuk testing (gunakan test cards)
- `production` - Untuk transaksi real (uang asli!)

### 4. Firebase Configuration (Dual-Screen Sync)

```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
```

**Cara setup Firebase**:

1. **Buat project** di [Firebase Console](https://console.firebase.google.com)
2. **Enable Realtime Database**:
   - Build → Realtime Database → Create Database
   - Pilih location (asia-southeast1 untuk Indonesia)
   - Start in **test mode** (atur rules nanti)
3. **Get Database URL**:
   - Copy URL dari Realtime Database dashboard
   - Format: `https://[PROJECT-ID].firebaseio.com`
4. **Generate Service Account**:
   - Project Settings (⚙️) → Service Accounts
   - Click **"Generate New Private Key"**
   - Download JSON file
5. **Convert JSON to single line**:
   ```bash
   # Di terminal, jalankan:
   cat firebase-service-account.json | tr -d '\n' | pbcopy
   ```
   - Paste hasil ke `FIREBASE_SERVICE_ACCOUNT` (dalam single quotes!)

**Security Rules** (Realtime Database):

```json
{
  "rules": {
    "pos-sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 5. Supabase Storage (Product Images)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Cara setup Supabase**:

1. **Create project** di [Supabase](https://supabase.com)
2. **Get API credentials**:
   - Project Settings → API
   - Copy `URL`, `anon/public key`, dan `service_role key`
3. **Create storage bucket**:
   - Storage → Create Bucket
   - Name: `cafetaria-images`
   - Public bucket: **YES** (untuk public image access)
4. **Set bucket policies**:

   ```sql
   -- Allow public read access
   CREATE POLICY "Public Read Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'cafetaria-images');

   -- Allow authenticated upload
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'cafetaria-images' AND auth.role() = 'authenticated');
   ```

---

## Verification Checklist

Setelah setup, verifikasi dengan checklist ini:

### ✅ Database

```bash
npx prisma db push  # Should succeed
npx prisma db seed  # Should create test data
```

### ✅ Midtrans

- [ ] Server Key dimulai dengan `SB-Mid-server-` (sandbox) atau `Mid-server-` (production)
- [ ] Environment set ke `sandbox` untuk testing
- [ ] Test dengan create QRIS payment (lihat test script di bawah)

### ✅ Firebase

- [ ] Realtime Database sudah dibuat
- [ ] Service Account JSON valid (bisa parse)
- [ ] Database URL correct format

### ✅ Supabase

- [ ] Bucket `cafetaria-images` exists
- [ ] Public access enabled
- [ ] Upload policies configured

---

## Testing Configuration

### Test Midtrans Connection

Buat file `test-midtrans.ts`:

```typescript
import { createQrisPayment } from "./src/lib/midtrans";

async function test() {
  try {
    const result = await createQrisPayment({
      orderId: "TEST-" + Date.now(),
      grossAmount: 50000,
      customerName: "Test User",
    });
    console.log("✅ Midtrans OK:", result);
  } catch (error) {
    console.error("❌ Midtrans Error:", error);
  }
}

test();
```

Run: `npx tsx test-midtrans.ts`

### Test Firebase Connection

```typescript
import { initializeFirebaseSession } from "./src/lib/firebase";

async function test() {
  try {
    await initializeFirebaseSession("test-session-123", 1, "Test Kasir");
    console.log("✅ Firebase OK");
  } catch (error) {
    console.error("❌ Firebase Error:", error);
  }
}

test();
```

---

## Common Issues

### Issue: "MIDTRANS_SERVER_KEY not configured"

- **Cause**: Environment variable tidak terbaca
- **Fix**:
  1. Pastikan `.env` file ada di root project
  2. Restart Next.js dev server
  3. Check typo di variable name

### Issue: "Firebase not initialized"

- **Cause**: `FIREBASE_SERVICE_ACCOUNT` format salah
- **Fix**:
  1. Pastikan JSON dalam single line
  2. Gunakan single quotes: `'{ ... }'`
  3. Escape special characters jika perlu

### Issue: Midtrans "Access forbidden"

- **Cause**: Server Key salah atau expired
- **Fix**:
  1. Re-generate key dari Midtrans Dashboard
  2. Pastikan environment match (sandbox vs production)

---

## Production Deployment

### Environment Variables di Production

**Vercel/Netlify**:

1. Dashboard → Project Settings → Environment Variables
2. Add semua variables dari `.env`
3. Pastikan `NEXTAUTH_URL` sesuai domain production

**Docker**:

```bash
docker run -e MIDTRANS_SERVER_KEY="..." -e FIREBASE_SERVICE_ACCOUNT="..." ...
```

### Security Best Practices

1. **NEVER commit `.env` to Git**

   - Already in `.gitignore`
   - Use `.env.example` untuk template

2. **Rotate keys regularly**

   - Midtrans: Every 6 months
   - Firebase: Every 1 year
   - Supabase: On-demand

3. **Use environment-specific keys**

   - Development: Sandbox keys
   - Production: Production keys

4. **Encrypt sensitive values**
   - Consider using secret management (AWS Secrets Manager, Vault)

---

## Next Steps

After environment setup:

1. ✅ Database migration & seeding - **DONE**
2. ⏭️ Implement API routes (transactions, items, etc.)
3. ⏭️ Test QRIS payment flow
4. ⏭️ Setup dual-screen Firebase sync
5. ⏭️ Build frontend dashboard

Lanjut ke implementasi API? 🚀
