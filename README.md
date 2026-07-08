# Savora — Web Desktop

**"Cita Rasa Nusantara di Tanganmu."**

Savora adalah platform web untuk menemukan resep masakan Indonesia sekaligus membeli bahan-bahannya secara langsung — dari resep ke keranjang belanja dalam satu alur.

## Fitur

- **Jelajah tanpa akun** — Beranda, daftar resep, dan toko bisa diakses tanpa login. Login baru diminta saat mau menyimpan resep atau checkout.
- **Resep** — daftar resep dengan filter kategori/kesulitan & pencarian real-time, halaman detail dengan checklist bahan interaktif dan langkah memasak.
- **Toko & Keranjang** — bahan segar per kategori dengan filter harga, keranjang belanja yang mengelompokkan item per resep.
- **Checkout & Pembayaran** — integrasi [Midtrans Snap](https://midtrans.com) (sandbox), pengurangan stok otomatis saat pembayaran berhasil.
- **Autentikasi** — login/register via [Supabase Auth](https://supabase.com), termasuk **Login dengan Google (OAuth)**.
- **Profil** — kelola data diri & alamat, riwayat pembayaran, resep tersimpan.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 13 (PHP 8.3+) |
| Frontend | React 19 + Inertia.js v3 |
| Styling | Tailwind CSS v4 (design system "The Modern Warung Editorial") |
| Database & Auth | Supabase (PostgreSQL + Auth API, termasuk Google OAuth) |
| Payment Gateway | Midtrans Snap (sandbox) |
| Build tool | Vite |

## Menjalankan Secara Lokal

### Prasyarat
- PHP >= 8.3, Composer
- Node.js + npm
- Project Supabase (URL + API keys) dan akun Midtrans Sandbox

### Instalasi

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Lengkapi `.env` dengan kredensial berikut sebelum lanjut:

```env
DB_CONNECTION=pgsql
DB_HOST=<host-pooler-supabase-kamu>
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=<username-supabase>
DB_PASSWORD=<password-supabase>

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

> Untuk login Google, aktifkan provider **Google** di Supabase Dashboard (Authentication → Providers) dan isi Client ID/Secret dari Google Cloud Console.

Lanjutkan setup:

```bash
php artisan migrate --seed
php artisan storage:link
composer dev
```

`composer dev` menjalankan server Laravel, queue listener, dan Vite dev server sekaligus. Buka `http://localhost:8000`.

### Catatan testing pembayaran di local

Server Midtrans tidak bisa mengirim webhook konfirmasi ke `localhost`. Untuk testing di lokal, setelah membuka popup Snap, gunakan tombol **cek status** / **simulasi pembayaran** di halaman sukses checkout — ini mengambil status transaksi langsung dari API Midtrans tanpa bergantung pada webhook.
