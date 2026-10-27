# LifeOS — Personal Life Management

> **LifeOS** adalah sistem operasi manajemen kehidupan pribadi (*Personal Life Management*) modern yang dirancang untuk membantu Anda memahami, mengatur, dan meningkatkan kualitas aktivitas sehari-hari tanpa merasa kewalahan. Dibangun dengan Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, dan PostgreSQL/Supabase.

---

## 🌟 Prinsip & Visi Produk

1. **Kejelasan Lebih Penting Daripada Kompleksitas** — Antarmuka bersih dengan ruang kosong proporsional dan tipografi charcoal yang menenangkan.
2. **Produktivitas yang Tenang dan Terarah** — Smart Planner memprioritaskan tugas penting tanpa menciptakan beban mental berlebihan.
3. **Kesadaran Finansial Tanpa Menghakimi** — Pencatatan berbasis Rupiah dengan batas anggaran transparan.
4. **Pembentukan Kebiasaan yang Berkelanjutan** — Pelacakan streak presisi dengan riwayat konsistensi 14 hari & 30 hari.
5. **Kemajuan yang Bermakna** — Target jangka panjang terhubung langsung dengan tugas dan alokasi tabungan riil.
6. **Privasi Sebagai Prioritas Utama** — Data terenkripsi, otorisasi server-side penuh, tanpa pelacak atau iklan.
7. **Bantuan Cerdas yang Alami** — AI Insights dengan fallback logika berbasis aturan 100% offline.

---

## 🚀 Fitur & Modul Utama

| Modul | Rute | Deskripsi |
|---|---|---|
| **Landing Page Premium** | `/` | Pengenalan produk, interactive live preview simulator, cara kerja, privasi, FAQ |
| **Halaman Fitur & Harga** | `/features`, `/pricing` | Informasi mendalam modul dan transparansi paket |
| **Autentikasi & Akun** | `/login`, `/register`, `/forgot-password`, `/reset-password` | Autentikasi aman JWT HttpOnly, password bcrypt, mode demo 1-klik |
| **Ringkasan Aktivitas** | `/app/dashboard` | Sapaan personal, 4 kartu metrik aktual, prioritas hari ini, habit check-in, grafik produktivitas & arus kas, peringatan anggaran, progres target, rekomendasi terarah |
| **Smart Planner** | `/app/planner` | Manajemen tugas lengkap (CRUD), tenggat waktu, checklist subtugas, kalkulasi prioritas cerdas dan transparan, penanda terlambat |
| **Kalender & Penjadwalan** | `/app/calendar` | Kalender bulanan interaktif, agenda harian, deteksi konflik jadwal (*overlap detection*), sinkronisasi otomatis dengan tugas berjadwal |
| **Habit Tracker** | `/app/habits` | Pelacakan kebiasaan (selesai/kuantitas), streak saat ini & streak terbaik, riwayat 14 hari, persentase konsistensi 30 hari, pengarsipan aman |
| **Target & Milestone** | `/app/goals` | Target capaian pribadi, pemecahan milestone langkah kerja, kalkulasi progres otomatis dari kontribusi tabungan atau tugas |
| **Keuangan Pribadi** | `/app/finance` | Pencatatan pemasukan & pengeluaran berbasis Rupiah, akun dompet/bank, saldo rekening, target tabungan dengan setoran/penarikan, ekspor CSV |
| **Anggaran Bulanan** | `/app/budgets` | Batas anggaran bulanan per kategori, progress bar pengeluaran, ambang batas peringatan (*warning threshold*), notifikasi otomatis |
| **AI Insights** | `/app/insights` | Rekomendasi terarah yang dapat dijelaskan (*explainable*), fakta terukur vs saran praktis, tanya-jawab asisten berbasis data, feedback pengguna |
| **Laporan & Analitik** | `/app/reports` | Evaluasi produktivitas harian/mingguan, rasio penyelesaian tugas, grafik pengeluaran kategori, ekspor laporan CSV |
| **Pusat Notifikasi** | `/app/notifications` | Pemberitahuan tenggat waktu, pengingat habit, ambang batas anggaran, penandaan dibaca/semua dibaca |
| **Profil Pengguna** | `/app/profile` | Pembaruan data diri, bidang pekerjaan, lokasi, dan ringkasan peran akun |
| **Pengaturan & Privasi** | `/app/settings` | Preferensi zona waktu (WIB/WITA/WIT), format mata uang, preferensi notifikasi, ekspor arsip JSON lengkap, penghapusan akun permanen |
| **Admin Platform** | `/admin` | Khusus role `ADMIN`: monitoring statistik agregat platform, manajemen aktivasi akun pengguna, penerbitan pengumuman sistem, audit log operasional |

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode), Tailwind CSS, Lucide React, Recharts, date-fns.
- **Backend**: Next.js Server Actions & Server Components, Prisma ORM, Jose (JWT), Bcryptjs.
- **Database**:
  - Pengembangan & Pengujian Lokal: SQLite (`file:./dev.db`) — langsung berjalan tanpa ketergantungan eksternal.
  - Produksi: PostgreSQL melalui Supabase (`prisma/schema.postgresql.prisma`).
- **Pengujian**: Vitest untuk pengujian unit dan integrasi algoritma bisnis.

---

## 💻 Panduan Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat
- Node.js versi 18 atau lebih tinggi
- npm atau pnpm

### 2. Kloning dan Instalasi Dependensi
```bash
git clone <repository-url>
cd "LifeOS Web"
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi contoh:
```bash
cp .env.example .env
```
Secara default, konfigurasi lokal telah disiapkan dengan database SQLite mandiri:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="lifeos_super_secret_jwt_encryption_key_development_32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@lifeos.id"
```

### 4. Sinkronisasi Skema Database & Data Contoh (Seed)
Generate Prisma client dan push skema:
```bash
npx prisma generate
npx prisma db push
```

Jalankan skrip seed data realistis:
```bash
npx tsx prisma/seed.ts
```

### 5. Akun Bawaan untuk Pengujian
Setelah proses seeding selesai, Anda dapat langsung masuk menggunakan akun berikut:

| Peran (Role) | Email | Kata Sandi | Keterangan |
|---|---|---|---|
| **Demo User** | `demo@lifeos.id` | `Demo1234!` | Dapat diakses langsung melalui tombol 1-klik "Lihat Demo" di Navbar atau Login |
| **Pengguna Utama** | `budi@lifeos.id` | `LifeOS123!` | Akun lengkap dengan tugas, jadwal, kebiasaan, transaksi keuangan, dan target riil |
| **Administrator** | `admin@lifeos.id` | `AdminLifeOS123!` | Memiliki akses ke halaman `/admin` untuk memonitor platform & audit log |

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Menjalankan Pengujian Otomatis

Aplikasi dilengkapi dengan pengujian otomatis menggunakan **Vitest** untuk menguji logika bisnis krusial:
- Algoritma prioritas tugas cerdas (`calculateTaskPriority`, deteksi keterlambatan, quick-win, batas deadline).
- Perhitungan streak habit (`calculateHabitStats`, best streak, completion rate 30 hari, penanganan zona waktu).
- Perhitungan keuangan & ambang batas anggaran (`calculateFinancialSummary`, `calculateBudgetUsage`, peringatan over-budget).
- Integrasi antarmodul, fallback AI berbasis aturan, dan isolasi data pengguna.

Jalankan seluruh pengujian:
```bash
npm test
```

Jalankan pengujian tipe TypeScript:
```bash
npx tsc --noEmit
```

---

## 🌐 Panduan Deployment ke Supabase & Vercel

### 1. Setup Database di Supabase
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Salin *Connection String* URI PostgreSQL dari menu **Project Settings -> Database -> Connection string** (Transaction pooler port 6543 dan Direct connection port 5432).
3. Ganti konfigurasi skema Prisma jika ingin menggunakan skema PostgreSQL murni:
   Salin isi `prisma/schema.postgresql.prisma` ke `prisma/schema.prisma` atau atur `provider = "postgresql"` di datasource.
4. Terapkan skema ke Supabase:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true" DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" npx prisma db push
   ```

### 2. Deployment ke Vercel
1. Hubungkan repositori GitHub/GitLab ke Vercel.
2. Tambahkan Environment Variables di Vercel Dashboard:
   - `DATABASE_URL`: URL PostgreSQL Supabase
   - `DIRECT_URL`: URL langsung PostgreSQL Supabase
   - `JWT_SECRET`: Kunci acak string minimal 32 karakter
   - `NEXT_PUBLIC_APP_URL`: URL domain Vercel Anda (misal `https://lifeos.vercel.app`)
   - `AI_API_KEY`: *(Opsional)* Kunci Google Gemini API jika ingin mengaktifkan inferensi LLM eksternal.
   - `AI_MODEL`: `gemini-1.5-flash`
3. Jalankan build: Vercel akan otomatis menjalankan `next build`.

---

## 🛡️ Kebijakan Keamanan & Backup Data

- **Isolasi Data Antar-Pengguna**: Setiap query database selalu menyertakan filter `userId` dari session terenkripsi di server. Pengguna biasa tidak dapat mengakses atau memodifikasi data milik pengguna lain.
- **Proteksi Halaman Admin**: Halaman `/admin` dilindungi oleh `requireAdmin()` di level server-side.
- **Ekspor Data Mandiri**: Pengguna dapat mengunduh seluruh arsip data pribadi mereka (tugas, riwayat kebiasaan, anggaran, target, dan transaksi) kapan saja melalui menu **Pengaturan -> Ekspor Data Anda** dalam format JSON standar.
- **Penghapusan Permanen**: Pengguna dapat meminta penghapusan akun mandiri dengan konfirmasi kata sandi, yang menghapus data pengguna secara kaskade (*cascade delete*).

---

## 📄 Lisensi
Hak Cipta © 2026 LifeOS. Seluruh hak cipta dilindungi.

