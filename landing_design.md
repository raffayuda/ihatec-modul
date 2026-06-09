# DESIGN.md — TrainingPD

## 1. Ringkasan Desain

**TrainingPD** adalah aplikasi manajemen modul pelatihan untuk mengelola pengajuan modul, approval, revisi, database modul, matriks pelatihan, dan penyimpanan file dalam satu sistem terpusat.

Dokumen ini menjadi panduan desain untuk landing page dan aplikasi dashboard berbasis **Laravel + React**. Style utama yang digunakan adalah **modern SaaS**, bersih, profesional, mudah dibangun ulang di Figma, dan tidak terlalu banyak elemen dekoratif yang sulit dibuat.

---

## 2. Tujuan Desain

Desain TrainingPD dibuat untuk:

1. Menampilkan aplikasi sebagai platform profesional untuk perusahaan.
2. Memudahkan user memahami fungsi utama aplikasi sejak landing page.
3. Memberikan pengalaman dashboard yang rapi untuk Admin, Staf PD, Manager PD, Tim Training, dan User.
4. Menjaga tampilan tetap clean, ringan, dan mudah diimplementasikan dengan React + Tailwind CSS.
5. Menghindari desain yang terlalu ramai, terlalu futuristik, atau sulit direplikasi.

---

## 3. Konsep Visual

Konsep desain yang digunakan:

- **Clean SaaS Landing Page**
- **Corporate Dashboard**
- **Soft Blue Gradient**
- **Rounded Card UI**
- **Simple Line Icon**
- **Minimal Dashboard Preview**
- **White Space Dominan**
- **Komponen mudah dibuat ulang**

Kesan visual yang ingin dicapai:

- Profesional
- Modern
- Terpercaya
- Rapi
- Terstruktur
- Tidak berlebihan

---

## 4. Warna Utama

### Primary Color

```css
--primary: #0F67EA;
--primary-dark: #084AC4;
--primary-soft: #EAF3FF;
```

Digunakan untuk:

- Button utama
- Active menu
- Link penting
- Icon utama
- Progress aktif

### Background Gradient

```css
--gradient-start: #0865F2;
--gradient-mid: #3A8DFF;
--gradient-end: #DDEEFF;
```

Digunakan pada:

- Hero section
- CTA section
- Background visual workflow

### Neutral Color

```css
--bg-main: #F8FBFF;
--bg-card: #FFFFFF;
--border: #E5ECF5;
--text-primary: #0F172A;
--text-secondary: #64748B;
--text-muted: #94A3B8;
```

### Status Color

```css
--success: #22C55E;
--success-soft: #DCFCE7;

--warning: #F59E0B;
--warning-soft: #FEF3C7;

--danger: #EF4444;
--danger-soft: #FEE2E2;

--info: #3B82F6;
--info-soft: #DBEAFE;

--purple: #8B5CF6;
--purple-soft: #EDE9FE;
```

---

## 5. Tipografi

Rekomendasi font:

- **Inter**
- **Geist Sans**
- **Plus Jakarta Sans**

Prioritas font:

```css
font-family: 'Inter', 'Geist Sans', system-ui, sans-serif;
```

### Ukuran Font

| Elemen | Ukuran | Weight |
|---|---:|---:|
| Hero Title | 56–72px | 700/800 |
| Section Title | 32–44px | 700 |
| Card Title | 16–20px | 600/700 |
| Body Text | 14–16px | 400/500 |
| Caption | 12–13px | 400/500 |
| Button | 14–15px | 600 |

---

## 6. Border Radius dan Shadow

### Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-2xl: 32px;
```

Penggunaan:

- Button: 10–14px
- Card kecil: 16–20px
- Panel besar: 24–32px
- Dashboard preview: 24–32px

### Shadow

```css
--shadow-card: 0 10px 30px rgba(15, 23, 42, 0.08);
--shadow-soft: 0 20px 60px rgba(15, 23, 42, 0.12);
```

Gunakan shadow tipis saja agar tetap clean.

---

## 7. Landing Page Structure

Landing page terdiri dari beberapa section utama:

1. Navbar
2. Hero Section
3. Dashboard Preview
4. About / Operational Section
5. Key Features Grid
6. Flow / CTA Section
7. Benefits Section
8. Final CTA
9. Footer

---

# 8. Landing Page Detail

## 8.1 Navbar

### Tujuan

Memberikan navigasi sederhana dan akses cepat ke demo.

### Layout

- Logo kiri: `TrainingPD`
- Menu tengah:
  - Produk
  - Solusi
  - Fitur
  - Alur Kerja
  - FAQ
- Button kanan:
  - Jadwalkan Demo

### Style

- Background transparan di atas gradient hero
- Text putih
- Button outline putih transparan
- Tinggi navbar sekitar 72px
- Padding horizontal 80–120px pada desktop

---

## 8.2 Hero Section

### Konten

Headline:

```text
Kelola Modul Pelatihan dengan Lebih Mudah
```

Subheadline:

```text
Platform terpusat untuk pengajuan modul, approval, revisi, penyimpanan file, dan matriks pelatihan dalam satu alur kerja yang rapi.
```

CTA:

- Mulai Sekarang
- Lihat Demo

### Style

- Background biru gradient
- Heading putih besar dan center
- CTA berada di tengah
- Dashboard preview berada di bawah hero text
- Tambahkan soft cloud/blur shape di bawah sebagai transisi

### Layout Desktop

```text
Navbar
↓
Hero title
↓
Subtitle
↓
CTA buttons
↓
Dashboard preview
```

---

## 8.3 Dashboard Preview

Dashboard preview menampilkan ringkasan aplikasi agar user langsung memahami fungsi sistem.

### Isi Preview

Sidebar:

- Dashboard
- Modul
- Review & Approval
- Dokumen
- Matriks Pelatihan
- Revisi
- Notifikasi
- Pengaturan

Topbar:

- Judul Dashboard
- Search field
- Notification icon
- Profile user
- Button Ajukan Modul

Card summary:

- Modul Aktif
- Menunggu Approval
- Dokumen Compliance
- Penyimpanan Terpakai

Panel bawah:

- Modul Terbaru
- Dokumen Compliance

### Style

- White rounded browser window
- Border halus
- Shadow lembut
- Icon sederhana
- Jangan terlalu banyak data agar tetap mudah dibuat

---

## 8.4 About / Operational Section

### Label

```text
TENTANG KAMI
```

### Title

```text
Operasional Modul yang Lebih Efisien
```

### 3 Kolom

#### 1. Manajemen Siklus Modul

```text
Membuat, revisi, dan mengelola modul pelatihan dalam satu tempat yang terpusat.
```

#### 2. Tracking & Validasi Dokumen

```text
Upload, pengecekan, dan validasi file dokumen secara cepat dan akurat.
```

#### 3. Notifikasi & Approval Cerdas

```text
Pengingat otomatis dan approval real-time untuk mempercepat proses persetujuan.
```

### Style

- Background putih
- Card/section rounded besar
- Ikon bulat pastel
- Layout 3 kolom desktop
- Mobile menjadi 1 kolom

---

## 8.5 Key Features Grid

### Label

```text
FITUR UTAMA
```

### Title

```text
Semua yang Dibutuhkan untuk Mengelola Modul dengan Lebih Cerdas
```

### Subtitle

```text
Kelola modul, dokumen, matriks pelatihan, hingga revisi dalam satu platform terintegrasi.
```

### Card 01 — Kepatuhan Dokumen

Deskripsi:

```text
Pantau status dokumen, validasi file, dan kelengkapan modul dalam satu tampilan.
```

Visual:

- Mini widget dokumen compliance
- Progress bar valid/pending/expired
- Badge status

### Card 02 — Penyimpanan File

Deskripsi:

```text
Lihat kapasitas penyimpanan, kategori dokumen, dan akses file secara terstruktur.
```

Visual:

- Donut chart storage
- Progress bar penyimpanan
- Kategori Modul, Dokumen, Laporan, Lainnya

### Card 03 — Matriks Pelatihan

Deskripsi:

```text
Petakan kebutuhan pelatihan dan hubungan antar modul dengan rapi.
```

Visual:

- Mini matrix table
- Dot warna sebagai indikator mapping

### Card 04 — Riwayat Revisi

Deskripsi:

```text
Lacak perubahan modul, versi file, dan histori approval dengan mudah.
```

Visual:

- List versi revisi
- Badge role
- Tanggal perubahan

### Style

- 2x2 grid desktop
- Card besar dengan background pastel
- Radius 24px
- White inner widget
- Shadow sangat halus

---

## 8.6 Flow / CTA Section

### Title

```text
Kendalikan Alur Modul Pelatihan dengan Lebih Mudah
```

### Subtitle

```text
Automasi proses review, approval, dan pengingat revisi agar tidak ada yang terlewat dan semua pihak selalu selaras.
```

### CTA

```text
Mulai Sekarang
```

### Floating Cards

- Dokumen Modul
- Reminder Revisi
- Review Performa
- Status Approval

### Style

- Background soft blue gradient
- Ada dotted orbit line sederhana
- Floating cards putih
- Center content
- Tidak perlu ilustrasi rumit

---

## 8.7 Benefits Section

### Label

```text
TENTANG FITUR
```

### Title

```text
Operasional Modul yang Lebih Efisien
```

### Benefit Items

#### Manajemen Siklus Modul

```text
Buat, revisi, dan kelola modul pelatihan dalam satu alur kerja yang praktis.
```

#### Tracking & Validasi Dokumen

```text
Upload, cek kelengkapan, dan verifikasi dokumen tanpa proses manual yang rumit.
```

#### Notifikasi & Approval Cerdas

```text
Dapatkan pengingat otomatis, status real-time, dan persetujuan yang lebih cepat.
```

### Style

- White card besar
- 3 kolom horizontal
- Icon bulat
- Divider tipis antar kolom
- Progress line dekoratif di bagian bawah

---

## 8.8 Final CTA

### Title

```text
Siap Menyederhanakan Pengelolaan Modul?
```

### Subtitle

```text
Bergabunglah dengan tim yang sudah meningkatkan produktivitas pelatihan mereka bersama TrainingPD.
```

### Button

```text
Ajukan Demo
```

### Style

- Gradient blue/lavender
- Rounded card
- Text kiri, button kanan
- Mobile menjadi stacked

---

## 8.9 Footer

### Isi

Logo:

```text
TrainingPD
```

Short description:

```text
Platform terintegrasi untuk mengelola modul pelatihan, approval, revisi, dan penyimpanan dokumen perusahaan.
```

Links:

- Produk
- Fitur
- FAQ
- Kontak

Copyright:

```text
© 2024 TrainingPD. Semua hak dilindungi.
```

---

# 9. Dashboard App Design

Selain landing page, aplikasi memiliki dashboard internal untuk beberapa role.

## 9.1 Role Aplikasi

Role utama:

1. Admin
2. Staf PD
3. Manager PD
4. Tim Training
5. User

---

## 9.2 Admin Dashboard

### Fokus

Admin berfokus pada pengelolaan sistem, user, role, master data, storage, dan audit.

### Sidebar Admin

- Dashboard Admin
- Manajemen User
- Role & Permission
- Pengajuan Modul
- Approval Modul
- Database Modul
- Matriks Pelatihan
- Master Data
- Audit Log
- Report
- Storage
- Integrasi
- Pengaturan

### Widget Admin

- Total User
- Role Aktif
- Total Modul
- Storage Digunakan
- User & Access Management
- Role Distribution
- Audit Log Terbaru
- Kesehatan Sistem
- Master Data Overview

---

## 9.3 Manager PD Dashboard

### Fokus

Manager PD berfokus pada approval dan monitoring modul.

### Menu Manager PD

- Dashboard
- Pengajuan Modul
- Approval Modul
- Database Modul
- Matriks Pelatihan
- Riwayat Revisi
- Report
- Notifikasi

### Widget Manager PD

- Menunggu Approval
- Approved Hari Ini
- Revisi Diminta
- Ditolak
- Antrian Approval
- Preview & Keputusan
- SLA Approval
- Riwayat Keputusan

---

## 9.4 Staf PD Dashboard

### Fokus

Staf PD membuat modul baru, mengajukan revisi, upload dokumen, dan memantau status.

### Menu Staf PD

- Dashboard
- Ajukan Modul
- Revisi Modul
- Draft Modul
- Upload Dokumen
- Riwayat Pengajuan
- Notifikasi

---

## 9.5 User Dashboard

### Fokus

User hanya mengajukan permintaan modul khusus dan melihat status pengajuannya.

### Menu User

- Dashboard
- Ajukan Modul Khusus
- Riwayat Pengajuan
- Notifikasi
- Profil

---

## 9.6 Tim Training Dashboard

### Fokus

Tim Training mengakses modul approved, matriks pelatihan, dan database modul.

### Menu Tim Training

- Dashboard
- Database Modul
- Matriks Pelatihan
- Formula Modul
- Report
- Notifikasi

---

# 10. Komponen UI

## 10.1 Button

### Primary Button

```css
background: #0F67EA;
color: #FFFFFF;
border-radius: 12px;
padding: 12px 20px;
font-weight: 600;
```

### Secondary Button

```css
background: transparent;
color: #0F67EA;
border: 1px solid #BBD7FF;
border-radius: 12px;
padding: 12px 20px;
font-weight: 600;
```

### Dark Button

```css
background: #020617;
color: #FFFFFF;
border-radius: 12px;
```

---

## 10.2 Card

```css
background: #FFFFFF;
border: 1px solid #E5ECF5;
border-radius: 24px;
box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
padding: 24px;
```

---

## 10.3 Badge

Status badge:

- Approved: green
- Review: blue
- Drafting: orange
- Revisi: purple
- Rejected: red
- Aktif: green
- Pending: amber

---

## 10.4 Table

Tabel digunakan pada:

- Modul terbaru
- Pengajuan terbaru
- Antrian approval
- Database modul
- Audit log
- User management

Style:

- Header background putih/soft gray
- Border row tipis
- Font kecil 13–14px
- Status menggunakan badge
- Action menggunakan icon button kecil

---

## 10.5 Dashboard Card

Dashboard card berisi:

- Icon circular
- Title kecil
- Value besar
- Subtitle/trend

Contoh:

```text
Modul Aktif
42
+12% dari bulan lalu
```

---

# 11. Responsive Design

## Desktop

- Max width content: 1180–1280px
- Hero centered
- Dashboard preview besar
- Feature grid 2x2 atau 3 kolom
- Dashboard app menggunakan sidebar tetap

## Tablet

- Navbar lebih ringkas
- Dashboard preview mengecil
- Grid menjadi 2 kolom
- Sidebar dashboard bisa collapse

## Mobile

- Navbar berubah menjadi hamburger
- Hero text center
- Dashboard preview bisa disembunyikan sebagian atau dibuat scroll horizontal
- Feature card menjadi 1 kolom
- Floating cards pada flow section disusun vertikal
- Dashboard app menggunakan bottom navigation atau drawer sidebar

---

# 12. Rekomendasi Implementasi Tailwind

## Container

```html
<div className="mx-auto max-w-7xl px-6 lg:px-8">
```

## Section Padding

```html
<section className="py-20 lg:py-28">
```

## Card

```html
<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
```

## Primary Button

```html
<button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
```

## Gradient Hero

```html
<section className="bg-gradient-to-b from-blue-700 via-blue-500 to-blue-100">
```

---

# 13. Design Do & Don't

## Do

- Gunakan white space yang luas.
- Gunakan icon sederhana.
- Gunakan card rounded.
- Gunakan text yang singkat dan jelas.
- Gunakan warna biru sebagai warna utama.
- Pastikan hierarchy visual mudah dibaca.
- Jaga konsistensi spacing.

## Don't

- Jangan terlalu banyak elemen dekoratif.
- Jangan menggunakan ilustrasi 3D rumit.
- Jangan membuat card terlalu penuh.
- Jangan memakai warna terlalu banyak.
- Jangan membuat landing page terlalu mirip template AI generatif.
- Jangan memakai efek glassmorphism berlebihan.

---

# 14. Kesimpulan

Desain TrainingPD harus terasa seperti aplikasi SaaS profesional untuk perusahaan: bersih, modern, terpercaya, dan mudah digunakan. Landing page berfungsi menjelaskan value aplikasi, sedangkan dashboard internal berfungsi memudahkan tiap role mengelola modul pelatihan sesuai tanggung jawabnya.

Fokus utama desain adalah:

- Pengajuan modul yang rapi
- Approval yang mudah dipantau
- Revisi dan history yang jelas
- Database modul yang terpusat
- Matriks pelatihan yang informatif
- Penyimpanan file yang terstruktur
- Role access yang aman dan jelas
