# Google OAuth Setup Guide

## 📋 Langkah-langkah Setup Google OAuth

### 1. Buat Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" → "New Project"
3. Beri nama project (contoh: "Cafetaria POS")
4. Klik "Create"

### 2. Enable Google+ API

1. Di sidebar, pilih "APIs & Services" → "Library"
2. Cari "Google+ API"
3. Klik "Enable"

### 3. Create OAuth 2.0 Credentials

1. Di sidebar, pilih "APIs & Services" → "Credentials"
2. Klik "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Jika diminta, configure OAuth consent screen terlebih dahulu:

   - User Type: **External**
   - App name: `Cafetaria POS`
   - User support email: email Anda
   - Developer contact: email Anda
   - Klik "Save and Continue"
   - Scopes: Skip (klik "Save and Continue")
   - Test users: Skip (klik "Save and Continue")

4. Kembali ke "Credentials" → "+ CREATE CREDENTIALS" → "OAuth client ID"
5. Application type: **Web application**
6. Name: `Cafetaria Web Client`

7. **Authorized redirect URIs** - Tambahkan:

   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

8. Klik "Create"

### 4. Copy Credentials ke .env

Setelah create, Anda akan mendapat:

- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

Tambahkan ke file `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"

# Pastikan juga sudah ada:
NEXTAUTH_URL="http://localhost:3000"  # atau domain production
NEXTAUTH_SECRET="your-secret-key"     # generate dengan: openssl rand -base64 32
```

### 5. Testing

1. Jalankan development server:

   ```bash
   npm run dev
   ```

2. Buka `http://localhost:3000/login`

3. Klik tombol "Masuk dengan Google"

4. Login dengan Google account

5. Setelah berhasil, Anda akan di-redirect ke dashboard sesuai role (default: USER)

## 🔒 Database Changes

Migration telah dibuat untuk mendukung Google OAuth:

**New Tables:**

- `Account` - Menyimpan OAuth provider data (Google, Facebook, dll)
- `Session` - Session management untuk OAuth
- `VerificationToken` - Email verification tokens

**Updated Table:**

- `User.password` - Sekarang **nullable** (user OAuth tidak perlu password)
- `User.emailVerified` - Timestamp OAuth verification
- `User.image` - URL profile picture dari Google

## 🎯 How It Works

1. **User klik "Masuk dengan Google"**

   - Redirect ke Google OAuth consent screen
   - User authorize aplikasi

2. **Google callback**

   - NextAuth menerima data dari Google
   - Check apakah email sudah terdaftar:
     - **Jika YA**: Login dengan account existing
     - **Jika TIDAK**: Auto-create user baru dengan role USER

3. **Session created**
   - JWT token dibuat dengan user data + role
   - User di-redirect ke dashboard

## 👥 User Roles

Google sign-in users **selalu** mendapat role `USER` sebagai default.

Untuk upgrade role (KASIR, PENGURUS, MITRA):

1. Login sebagai PENGURUS
2. Buka "Users Management"
3. Edit user yang login via Google
4. Ubah role sesuai kebutuhan

## 🚀 Production Deployment

Saat deploy ke production:

1. Update `NEXTAUTH_URL` di `.env`:

   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. Tambahkan production callback URL di Google Console:

   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. Pastikan database migration sudah run di production:
   ```bash
   npx prisma migrate deploy
   ```

## 🔐 Security Notes

- ✅ Password field sekarang optional (OAuth users tidak perlu password)
- ✅ Credential login masih berfungsi untuk existing users
- ✅ Google users tidak bisa login dengan password (harus via Google)
- ✅ Email verification otomatis untuk Google users
- ✅ Session menggunakan JWT (stateless)

## 🐛 Troubleshooting

**Error: "redirect_uri_mismatch"**

- Pastikan redirect URI di Google Console **exact match** dengan NEXTAUTH_URL + `/api/auth/callback/google`
- Check http vs https

**Error: "Missing GOOGLE_CLIENT_ID"**

- Pastikan environment variables sudah di-set di `.env`
- Restart dev server setelah update `.env`

**User tidak bisa login setelah OAuth**

- Check database: `SELECT * FROM User WHERE email = 'user@gmail.com'`
- Check Account table: `SELECT * FROM Account WHERE userId = X`
- Verify migration sudah run: `npx prisma migrate status`

## 📚 References

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
