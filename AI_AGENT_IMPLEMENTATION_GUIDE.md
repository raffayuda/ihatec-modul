# AI_AGENT_IMPLEMENTATION_GUIDE.md  
## Panduan Implementasi Aplikasi PD / TrainingPD Berdasarkan Mockup Final

Dokumen ini dibuat sebagai panduan kerja untuk AI Agent agar dapat membangun aplikasi **Aplikasi PD / TrainingPD** sesuai mockup final pada file Excel `Aplikasi PD.xlsx`.

Aplikasi ini adalah sistem internal untuk mengelola **pengajuan modul pelatihan, perubahan/revisi modul, approval, database modul, formula modul, matriks pelatihan, master data, dan penyimpanan file**.

---

# 1. Tujuan Utama Aplikasi

Aplikasi PD / TrainingPD bertujuan untuk menggantikan proses manual berbasis Excel menjadi aplikasi web yang lebih terstruktur.

Fungsi utama aplikasi:

1. User dapat mengajukan permintaan modul khusus.
2. Staf PD dapat memproses pengajuan modul baru dan revisi modul.
3. Manager PD dapat melakukan approval/reject.
4. Admin dapat mengelola user, role, master data, database modul, dan konfigurasi sistem.
5. Tim Training dapat mengakses database modul, formula modul, dan matriks pelatihan.
6. Dokumen modul dapat diupload dan disimpan ke Google Drive.
7. Riwayat revisi dan perubahan modul tersimpan dengan jelas.

---

# 2. Stack yang Digunakan

Gunakan stack berikut:

```text
Backend  : Laravel
Frontend : React
Routing  : Inertia.js atau React Router sesuai struktur project
Database : MySQL / PostgreSQL
Storage  : Google Drive OAuth
Auth     : Laravel Breeze / Laravel Auth
Role     : Spatie Laravel Permission atau sistem role custom
Style    : Tailwind CSS
Icon     : Lucide React atau Heroicons
```

---

# 3. Prinsip Implementasi

AI Agent harus mengikuti prinsip berikut:

1. Jangan membuat aplikasi dashboard umum yang tidak sesuai mockup.
2. Struktur menu sidebar harus sama dengan mockup final.
3. Setiap role hanya melihat menu sesuai hak akses.
4. Semua form harus mengikuti field yang ada pada mockup dan flow.
5. Upload file wajib terhubung ke Google Drive OAuth.
6. Data penting seperti pengajuan, revisi, approval, dan database modul wajib disimpan di database.
7. Gunakan tampilan clean, modern, dan mudah digunakan.
8. Jangan membuat desain terlalu ramai.
9. Gunakan komponen reusable.
10. Pastikan aplikasi bisa dijalankan lokal tanpa error.

---

# 4. Struktur Sidebar Wajib

Sidebar harus mengikuti mockup final.

## 4.1 Sidebar Utama

Gunakan menu berikut:

```text
HOME
Menu Permintaan Modul Khusus
Menu Perubahan Modul
Database Modul
Database Formula Modul
Matriks Pelatihan
Role & Master Data
Report
Notifikasi
Pengaturan
```

## 4.2 Sidebar Versi Rapi untuk Web App

Jika ingin dibuat lebih rapi, boleh menggunakan pengelompokan berikut, tetapi label utama tetap harus sama dengan mockup:

```text
Dashboard
- HOME

Pengajuan
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul

Database
- Database Modul
- Database Formula Modul
- Matriks Pelatihan

Master
- Role & Master Data

Laporan
- Report

Sistem
- Notifikasi
- Pengaturan
```

## 4.3 Catatan Penting Sidebar

Pastikan menu berikut tetap ada:

```text
HOME
Menu Permintaan Modul Khusus
Menu Perubahan Modul
Database Modul
Database Formula Modul
Matriks Pelatihan
Role & Master Data
Report
Notifikasi
Pengaturan
```

Jangan mengganti nama menu menjadi terlalu berbeda, karena harus sesuai mockup final.

---

# 5. Role dan Hak Akses

## 5.1 Admin

Admin memiliki akses penuh.

Akses Admin:

```text
- HOME
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul
- Database Modul
- Database Formula Modul
- Matriks Pelatihan
- Role & Master Data
- Report
- Notifikasi
- Pengaturan
```

Admin dapat:

```text
- Mengelola semua pengajuan
- Mengelola semua modul
- Mengelola user
- Mengelola role
- Mengelola master data
- Import dan export data
- Melihat seluruh report
- Melihat audit/log aktivitas
- Mengelola integrasi Google Drive
```

---

## 5.2 User

User berfokus pada pengajuan permintaan modul khusus.

Akses User:

```text
- HOME
- Menu Permintaan Modul Khusus
- Notifikasi
- Pengaturan Profil
```

User dapat:

```text
- Membuat pengajuan modul khusus
- Melihat status pengajuan sendiri
- Melihat detail pengajuan sendiri
- Melihat link modul jika pengajuan sudah Done
```

User tidak boleh:

```text
- Approve/reject pengajuan
- Mengubah database modul
- Mengelola master data
- Melihat pengajuan user lain
```

---

## 5.3 Staf PD

Staf PD berfokus pada proses modul baru dan revisi modul.

Akses Staf PD:

```text
- HOME
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul
- Database Modul
- Database Formula Modul
- Matriks Pelatihan
- Notifikasi
```

Staf PD dapat:

```text
- Melihat semua pengajuan modul khusus
- Memproses pengajuan modul khusus
- Membuat dan memproses perubahan modul
- Upload dokumen modul
- Mengisi link modul
- Mengisi tanggal realisasi
- Mengubah status proses
- Melihat riwayat revisi
```

---

## 5.4 Manager PD

Manager PD berfokus pada approval.

Akses Manager PD:

```text
- HOME
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul
- Approval / detail pengajuan
- Database Modul
- Report
- Notifikasi
```

Manager PD dapat:

```text
- Melihat pengajuan yang menunggu approval
- Approve pengajuan modul baru
- Reject pengajuan modul baru
- Approve revisi modul
- Reject revisi modul
- Memberikan alasan reject
- Melihat riwayat keputusan
```

---

## 5.5 Tim Training

Tim Training berfokus pada penggunaan data modul final.

Akses Tim Training:

```text
- HOME
- Database Modul
- Database Formula Modul
- Matriks Pelatihan
- Report
- Notifikasi
```

Tim Training dapat:

```text
- Melihat modul yang sudah approved
- Mengakses formula modul
- Mengakses matriks pelatihan
- Download dokumen modul
- Melihat report terkait modul dan pelatihan
```

---

# 6. Halaman HOME

## 6.1 Fungsi

Halaman HOME berfungsi sebagai dashboard ringkas untuk melihat status pengajuan dan akses cepat ke menu utama.

## 6.2 Komponen HOME

Tampilkan:

```text
- Card Progress Permintaan Modul Khusus
- Card Done Permintaan Modul Khusus
- Card Pengajuan Perubahan Modul
- Card Approval Pending
- Tabel Pengajuan Terbaru
- Shortcut menu
```

## 6.3 Tabel Pengajuan Terbaru

Kolom:

```text
No Pengajuan
Tanggal Pengajuan
Jenis Kebutuhan Modul
Permintaan Khusus
Tanggal Dibutuhkan
Status
Action
```

Action:

```text
Detail
Edit
Process
Approve
Reject
Download
```

Action ditampilkan berdasarkan role.

---

# 7. Menu Permintaan Modul Khusus

## 7.1 Fungsi

Menu ini digunakan untuk mengajukan kebutuhan modul khusus.

## 7.2 Hak Akses

```text
User      : Create dan melihat pengajuan sendiri
Staf PD   : Melihat dan memproses semua pengajuan
ManagerPD : Approval/reject jika diperlukan
Admin     : Akses penuh
```

## 7.3 List Data

Kolom list:

```text
No Pengajuan
Tanggal Pengajuan
Jenis Kebutuhan Modul
Permintaan Khusus
Tanggal Dibutuhkan
Status
Action
```

## 7.4 Form Pengajuan

Field form:

```text
Tanggal Pengajuan
No Pengajuan
Nama Pengaju
Jenis Kebutuhan Modul
Bahasa Pengantar
Nama Instansi
Judul Program Pelatihan
Jumlah Hari Pelatihan
Request Jam Khusus Pelatihan
Permintaan Pre & Post Test
Detail Permintaan Modul Khusus
Keterangan Kebutuhan
Tanggal Kebutuhan
Upload Dokumen Pendukung
```

## 7.5 Aturan Form

```text
Tanggal Pengajuan otomatis hari ini
No Pengajuan otomatis
Nama Pengaju otomatis dari user login
Jenis Kebutuhan Modul berupa dropdown dari master data
Bahasa Pengantar berupa dropdown dari master data
Tanggal Kebutuhan minimal 14 hari setelah Tanggal Pengajuan
Status default = Process
```

## 7.6 Format Nomor Pengajuan

Format:

```text
001/Modul Khusus/PD/MM/YYYY
```

Contoh:

```text
001/Modul Khusus/PD/06/2026
```

## 7.7 Field Proses oleh Staf PD/Admin

Field tambahan saat diproses:

```text
Link Modul
Tanggal Realisasi
Status
Keterangan
Tanggal Kebutuhan Baru
```

## 7.8 Status

Gunakan status berikut:

```text
Process
Done
Cancel
Hold
```

## 7.9 Aturan Status

```text
Jika status = Done:
- Link Modul wajib diisi
- Tanggal Realisasi wajib diisi
- Kirim notifikasi ke pengaju

Jika status = Hold:
- Tanggal Kebutuhan Baru wajib diisi
- Keterangan wajib diisi

Jika status = Cancel:
- Keterangan wajib diisi
```

---

# 8. Menu Perubahan Modul

## 8.1 Fungsi

Menu ini digunakan untuk mengajukan dan memproses revisi/perubahan pada modul existing.

## 8.2 Hak Akses

```text
Staf PD   : Create, proses, upload dokumen revisi
ManagerPD : Approve/reject revisi
Admin     : Akses penuh
TimTraining: Melihat revisi yang sudah approved
```

## 8.3 List Data

Kolom:

```text
No Pengajuan
Tanggal Pengajuan
Kode Modul
Judul Modul
Kode Revisi
Alasan Perubahan
Status
Action
```

## 8.4 Form Perubahan Modul

Field:

```text
Tanggal Pengajuan
No Pengajuan Perubahan Modul
Kode Modul
Judul Modul
Kode Revisi
Alasan Perubahan
Detail Perubahan
Upload Dokumen Revisi
Tanggal Kebutuhan
```

## 8.5 Field Proses

```text
Link Modul
Tanggal Realisasi
Status
Keterangan
Tanggal Kebutuhan Baru
```

## 8.6 Format Nomor Pengajuan

Format:

```text
001/Modul/PD/MM/YYYY
```

Contoh:

```text
001/Modul/PD/06/2026
```

## 8.7 Kode Revisi Otomatis

Jika modul existing memiliki kode revisi terakhir:

```text
0
1
2
3
```

Maka saat revisi baru approved, sistem otomatis membuat:

```text
Kode Revisi = kode terakhir + 1
```

Contoh:

```text
Kode revisi lama: 2
Kode revisi baru: 3
```

## 8.8 Riwayat Perubahan

Setiap revisi harus menyimpan:

```text
Kode Modul
Kode Revisi Lama
Kode Revisi Baru
Tanggal Revisi
Alasan Perubahan
Detail Perubahan
File Lama
File Baru
Dibuat Oleh
Disetujui Oleh
Status Approval
Catatan Reject
```

---

# 9. Approval Modul

## 9.1 Fungsi

Halaman atau modal approval digunakan oleh Manager PD untuk menyetujui atau menolak pengajuan.

## 9.2 Jenis Approval

```text
Approval Permintaan Modul Khusus
Approval Perubahan Modul
```

## 9.3 Field Approval

```text
Status Approval
Catatan Approval
Alasan Reject
Tanggal Approval
Approver
```

## 9.4 Action Approval

```text
Approve
Reject
Minta Revisi
```

## 9.5 Aturan Approval

```text
Jika Approve:
- Status berubah menjadi Approved/Done sesuai flow
- Jika perubahan modul, update Database Modul
- Simpan riwayat approval
- Kirim notifikasi ke Staf PD/User/Tim Training sesuai kebutuhan

Jika Reject:
- Alasan reject wajib diisi
- Status berubah menjadi Rejected
- Kirim notifikasi ke pengaju

Jika Minta Revisi:
- Catatan revisi wajib diisi
- Status berubah menjadi Need Revision
```

---

# 10. Database Modul

## 10.1 Fungsi

Database Modul adalah pusat penyimpanan seluruh modul pelatihan.

## 10.2 Kolom Utama

```text
No
Jenis Modul
Nama Modul
Kode Revisi
Tanggal Berlaku
Attachment File
Status
Action
```

## 10.3 Fitur

```text
Tambah data manual
Edit data
Delete data
Import Excel
Export Excel
Download template Excel
Upload attachment
Preview file
Download file
Search
Filter jenis modul
Filter status
Filter kode revisi
Lihat riwayat revisi
```

## 10.4 Aturan

```text
Data awal dapat dimasukkan melalui import Excel
Modul baru yang sudah approved otomatis masuk ke Database Modul
Perubahan modul yang sudah approved otomatis update Database Modul
File lama tidak boleh hilang, tetapi masuk ke riwayat revisi
```

---

# 11. Database Formula Modul

## 11.1 Fungsi

Database Formula Modul berisi formula atau aturan modul terhadap program pelatihan.

## 11.2 Kolom yang Disarankan

```text
No
Kode Formula
Jenis Pelatihan
Program Pelatihan
Kode Modul
Nama Modul
Jumlah Hari
Bahasa
Tipe Pelatihan
Jenis Sertifikat
Status
Action
```

## 11.3 Fitur

```text
Tambah formula
Edit formula
Delete formula
Import Excel
Export Excel
Search
Filter program pelatihan
Filter jenis pelatihan
Filter bahasa
```

## 11.4 Hubungan dengan Database Modul

Formula Modul harus mengambil referensi dari Database Modul agar tidak ada nama modul ganda atau tidak valid.

---

# 12. Matriks Pelatihan

## 12.1 Fungsi

Matriks Pelatihan digunakan untuk memetakan hubungan antara program pelatihan, modul, kompetensi, atau kebutuhan pelatihan.

## 12.2 Bentuk Tampilan

Tampilan matriks seperti spreadsheet/table besar.

Contoh:

```text
Program / Modul | Modul A | Modul B | Modul C | Modul D
Tim Admin       |   v     |         |   v     |
Tim Training    |   v     |   v     |         |
Tim Operasional |         |   v     |   v     |
```

## 12.3 Fitur

```text
Lihat matriks
Edit mapping
Tambah baris program
Tambah kolom modul
Import Excel
Export Excel
Filter program
Filter modul
Search
```

## 12.4 Aturan

```text
Matriks hanya boleh mengambil data modul dari Database Modul
Gunakan checkbox atau tanda centang untuk mapping
Perubahan matriks harus dicatat di log
```

---

# 13. Role & Master Data

## 13.1 Fungsi

Role & Master Data digunakan untuk mengelola data dasar aplikasi.

## 13.2 Master Role

Role:

```text
Admin
User
Staf PD
Manager PD
Tim Training
```

## 13.3 Master User

Kolom:

```text
No
Nama User
Email
Role
Status
Action
```

Fitur:

```text
Tambah user
Edit user
Delete user
Reset password
Aktif/nonaktif user
Assign role
```

## 13.4 Master Jenis Kebutuhan Modul

Contoh data:

```text
Pelatihan Inhouse
Pelatihan Internal
Seminar
```

## 13.5 Master Kode Pelatihan

Kolom:

```text
No
Nama Pelatihan
Kode Pelatihan
Action
```

## 13.6 Master Data Tambahan

Tambahkan master data berikut:

```text
Jenis Modul Pelatihan
Bahasa Pengantar
Jenis Sertifikat
Tipe Pelatihan
Status Pengajuan
Unit/Divisi
```

---

# 14. Report

## 14.1 Fungsi

Report digunakan untuk melihat laporan dan melakukan export.

## 14.2 Jenis Report

```text
Report Permintaan Modul Khusus
Report Perubahan Modul
Report Approval
Report Database Modul
Report Revisi Modul
Report User Activity
Report Storage
```

## 14.3 Filter Report

```text
Tanggal mulai
Tanggal akhir
Status
Jenis Modul
Pengaju
Approver
Unit
```

## 14.4 Export

```text
Export PDF
Export Excel
Export CSV
```

---

# 15. Notifikasi

## 15.1 Fungsi

Notifikasi digunakan untuk memberi informasi perubahan status.

## 15.2 Trigger Notifikasi

Kirim notifikasi ketika:

```text
Pengajuan baru dibuat
Pengajuan diproses Staf PD
Pengajuan diapprove
Pengajuan direject
Status berubah menjadi Done
Status berubah menjadi Hold
Ada revisi modul baru
File modul sudah tersedia
```

## 15.3 Jenis Notifikasi

```text
In-app notification
Email notification
```

Untuk tahap MVP, cukup buat in-app notification terlebih dahulu.

---

# 16. Pengaturan

## 16.1 Fungsi

Pengaturan digunakan untuk mengelola konfigurasi sistem.

## 16.2 Isi Pengaturan

```text
Profil user
Password
Konfigurasi Google Drive
Folder ID Google Drive
Email admin
Template nomor pengajuan
Konfigurasi notifikasi
```

---

# 17. Google Drive OAuth Storage

## 17.1 Fungsi

Google Drive digunakan sebagai tempat penyimpanan file modul.

## 17.2 Alur

```text
Admin connect Google Drive
Aplikasi mendapatkan refresh token
Refresh token disimpan di .env atau database konfigurasi
User/Staf PD upload PDF
Laravel upload file ke Google Drive folder tertentu
Metadata file disimpan di database
File bisa preview/download dari aplikasi
```

## 17.3 Environment Variable

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/google-drive/callback
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_REFRESH_TOKEN=
```

## 17.4 Route Wajib

```text
GET /google-drive/connect
GET /google-drive/callback
POST /module-files/upload
GET /module-files/{id}/download
GET /module-files/{id}/preview
```

## 17.5 Scope

Gunakan salah satu:

```text
https://www.googleapis.com/auth/drive.file
```

Jika file tidak masuk folder manual atau butuh akses penuh folder, gunakan:

```text
https://www.googleapis.com/auth/drive
```

Jika scope berubah, wajib connect ulang dan ambil refresh token baru.

## 17.6 Data File yang Disimpan

```text
id
module_id
google_file_id
file_name
mime_type
file_size
folder_id
view_link
download_link
uploaded_by
created_at
updated_at
```

---

# 18. Database Schema Rekomendasi

## 18.1 users

```text
id
name
email
password
role
status
created_at
updated_at
```

## 18.2 module_requests

Untuk Permintaan Modul Khusus.

```text
id
request_number
request_date
requester_id
jenis_kebutuhan_modul_id
bahasa_pengantar_id
nama_instansi
judul_program_pelatihan
jumlah_hari_pelatihan
request_jam_khusus
permintaan_pre_post_test
detail_permintaan
keterangan_kebutuhan
tanggal_kebutuhan
link_modul
tanggal_realisasi
tanggal_kebutuhan_baru
status
keterangan_status
created_by
processed_by
created_at
updated_at
```

## 18.3 module_changes

Untuk Perubahan/Revisi Modul.

```text
id
change_number
request_date
module_id
kode_revisi_lama
kode_revisi_baru
alasan_perubahan
detail_perubahan
tanggal_kebutuhan
link_modul
tanggal_realisasi
tanggal_kebutuhan_baru
status
keterangan_status
created_by
processed_by
approved_by
created_at
updated_at
```

## 18.4 modules

```text
id
jenis_modul
nama_modul
kode_modul
kode_revisi
tanggal_berlaku
attachment_file_id
status
created_at
updated_at
```

## 18.5 module_revisions

```text
id
module_id
revision_code
previous_revision_code
reason
detail
file_id
approved_by
approved_at
created_by
created_at
updated_at
```

## 18.6 module_files

```text
id
module_id
google_file_id
file_name
mime_type
file_size
folder_id
view_link
download_link
uploaded_by
created_at
updated_at
```

## 18.7 formula_modules

```text
id
kode_formula
jenis_pelatihan
program_pelatihan
module_id
jumlah_hari
bahasa
tipe_pelatihan
jenis_sertifikat
status
created_at
updated_at
```

## 18.8 training_matrices

```text
id
program_pelatihan
module_id
is_required
notes
created_at
updated_at
```

## 18.9 master_data

```text
id
type
code
name
description
status
created_at
updated_at
```

## 18.10 notifications

```text
id
user_id
title
message
type
is_read
related_type
related_id
created_at
updated_at
```

## 18.11 activity_logs

```text
id
user_id
activity
module
description
ip_address
created_at
updated_at
```

---

# 19. UI Design Guidelines

## 19.1 Style

Gunakan style:

```text
Clean
Modern
Corporate
White background
Soft blue accent
Rounded cards
Simple icon
Table rapi
Tidak terlalu ramai
```

## 19.2 Warna

```css
Primary Blue: #0F67EA
Dark Navy: #0F172A
Muted Text: #64748B
Background: #F8FBFF
Border: #E5ECF5
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444
Purple: #8B5CF6
```

## 19.3 Komponen

Gunakan komponen reusable:

```text
Sidebar
Topbar
StatCard
DataTable
StatusBadge
ActionButton
FormInput
FormSelect
DatePicker
UploadBox
Modal
ConfirmDialog
NotificationDropdown
```

---

# 20. Urutan Pengerjaan AI Agent

AI Agent harus mengerjakan secara bertahap.

## Tahap 1 — Setup Project

```text
1. Pastikan Laravel + React berjalan.
2. Setup auth login/logout.
3. Setup role user.
4. Setup layout utama dengan sidebar dan topbar.
5. Pastikan sidebar sesuai mockup.
```

## Tahap 2 — Database dan Model

```text
1. Buat migration.
2. Buat model.
3. Buat relasi antar model.
4. Buat seeder role.
5. Buat seeder master data awal.
```

## Tahap 3 — Role & Master Data

```text
1. Buat halaman Role & Master Data.
2. Buat CRUD user.
3. Buat CRUD role.
4. Buat CRUD master data.
```

## Tahap 4 — Permintaan Modul Khusus

```text
1. Buat list pengajuan.
2. Buat form pengajuan.
3. Buat nomor otomatis.
4. Buat validasi.
5. Buat status process/done/cancel/hold.
6. Buat detail pengajuan.
7. Buat proses oleh Staf PD/Admin.
```

## Tahap 5 — Perubahan Modul

```text
1. Buat list perubahan modul.
2. Buat form perubahan.
3. Buat upload dokumen revisi.
4. Buat kode revisi otomatis.
5. Buat riwayat perubahan.
```

## Tahap 6 — Approval

```text
1. Buat approval action.
2. Buat approve/reject/minta revisi.
3. Buat catatan approval.
4. Buat notifikasi setelah keputusan.
```

## Tahap 7 — Database Modul

```text
1. Buat list database modul.
2. Buat CRUD modul.
3. Buat upload file.
4. Buat preview/download.
5. Buat import/export Excel.
6. Buat riwayat revisi.
```

## Tahap 8 — Formula Modul dan Matriks Pelatihan

```text
1. Buat CRUD formula modul.
2. Buat halaman matriks pelatihan.
3. Buat mapping modul terhadap program pelatihan.
4. Buat import/export.
```

## Tahap 9 — Google Drive OAuth

```text
1. Buat route connect.
2. Buat route callback.
3. Simpan refresh token.
4. Buat GoogleDriveService.
5. Upload file ke folder Google Drive.
6. Simpan metadata file.
7. Test preview/download.
```

## Tahap 10 — Report dan Notifikasi

```text
1. Buat report dasar.
2. Buat filter report.
3. Buat export.
4. Buat notifikasi in-app.
```

## Tahap 11 — Finishing

```text
1. Rapikan UI sesuai mockup.
2. Pastikan responsive.
3. Test semua role.
4. Test upload file.
5. Test approval flow.
6. Test status Done/Hold/Cancel.
7. Test import/export.
```

---

# 21. Prompt Siap Pakai untuk AI Agent

Gunakan prompt berikut ke AI Agent:

```text
Saya sedang membuat aplikasi Laravel + React bernama Aplikasi PD / TrainingPD.

Tolong bangun aplikasi sesuai mockup final pada file Aplikasi PD.xlsx. Aplikasi ini adalah sistem manajemen modul pelatihan untuk pengajuan modul khusus, perubahan/revisi modul, approval, database modul, database formula modul, matriks pelatihan, role & master data, report, notifikasi, dan pengaturan.

PENTING:
Sidebar harus sama seperti mockup final:
- HOME
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul
- Database Modul
- Database Formula Modul
- Matriks Pelatihan
- Role & Master Data
- Report
- Notifikasi
- Pengaturan

Role aplikasi:
- Admin
- User
- Staf PD
- Manager PD
- Tim Training

Hak akses:
- Admin: semua akses
- User: hanya pengajuan modul khusus dan status miliknya
- Staf PD: memproses modul baru, revisi, upload dokumen, dan update status
- Manager PD: approve/reject pengajuan dan revisi
- Tim Training: melihat database modul, formula modul, dan matriks pelatihan

Tolong kerjakan bertahap:
1. Buat layout utama dengan sidebar dan topbar.
2. Buat auth dan role access.
3. Buat database migration dan model.
4. Buat Role & Master Data.
5. Buat Menu Permintaan Modul Khusus.
6. Buat Menu Perubahan Modul.
7. Buat Approval.
8. Buat Database Modul.
9. Buat Database Formula Modul.
10. Buat Matriks Pelatihan.
11. Integrasikan upload file ke Google Drive OAuth.
12. Buat Report dan Notifikasi.
13. Rapikan UI agar clean, modern, dan sesuai mockup.

Field Menu Permintaan Modul Khusus:
- Tanggal Pengajuan
- No Pengajuan
- Nama Pengaju
- Jenis Kebutuhan Modul
- Bahasa Pengantar
- Nama Instansi
- Judul Program Pelatihan
- Jumlah Hari Pelatihan
- Request Jam Khusus Pelatihan
- Permintaan Pre & Post Test
- Detail Permintaan Modul Khusus
- Keterangan Kebutuhan
- Tanggal Kebutuhan
- Upload Dokumen Pendukung

Field Menu Perubahan Modul:
- Tanggal Pengajuan
- No Pengajuan Perubahan Modul
- Kode Modul
- Judul Modul
- Kode Revisi
- Alasan Perubahan
- Detail Perubahan
- Upload Dokumen Revisi
- Tanggal Kebutuhan

Status:
- Process
- Done
- Cancel
- Hold

Aturan:
- Tanggal pengajuan otomatis hari ini
- Nomor pengajuan otomatis
- Tanggal kebutuhan minimal 14 hari setelah tanggal pengajuan
- Jika status Done, link modul dan tanggal realisasi wajib diisi
- Jika status Hold, tanggal kebutuhan baru dan keterangan wajib diisi
- Jika revisi modul approved, kode revisi otomatis +1
- File lama harus tetap disimpan sebagai riwayat revisi
- Semua perubahan penting harus masuk activity log
- Notifikasi dikirim saat status berubah

Google Drive:
Gunakan OAuth, bukan service account.
Env:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/google-drive/callback
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_REFRESH_TOKEN=

Route:
GET /google-drive/connect
GET /google-drive/callback
POST /module-files/upload
GET /module-files/{id}/download
GET /module-files/{id}/preview

Pastikan semua fitur berjalan lokal dan UI tidak terlalu berbeda dari mockup.
```

---

# 22. Checklist Testing

Gunakan checklist ini setelah implementasi.

## Auth

```text
[ ] User bisa login
[ ] User bisa logout
[ ] Role terbaca benar
[ ] Sidebar berubah sesuai role
```

## Sidebar

```text
[ ] HOME muncul
[ ] Menu Permintaan Modul Khusus muncul
[ ] Menu Perubahan Modul muncul
[ ] Database Modul muncul
[ ] Database Formula Modul muncul
[ ] Matriks Pelatihan muncul
[ ] Role & Master Data muncul
[ ] Report muncul
[ ] Notifikasi muncul
[ ] Pengaturan muncul
```

## Permintaan Modul Khusus

```text
[ ] User bisa membuat pengajuan
[ ] Nomor pengajuan otomatis
[ ] Validasi tanggal kebutuhan minimal 14 hari
[ ] Staf PD bisa memproses
[ ] Status bisa berubah
[ ] Done wajib link modul dan tanggal realisasi
[ ] Hold wajib tanggal kebutuhan baru
[ ] Notifikasi terkirim
```

## Perubahan Modul

```text
[ ] Staf PD bisa membuat perubahan modul
[ ] Bisa upload dokumen revisi
[ ] Manager PD bisa approve/reject
[ ] Kode revisi otomatis +1
[ ] Riwayat revisi tersimpan
```

## Database Modul

```text
[ ] Modul bisa ditambah
[ ] Modul bisa diedit
[ ] Modul bisa dihapus
[ ] File bisa diupload
[ ] File bisa didownload
[ ] File bisa dipreview
[ ] Import Excel berjalan
[ ] Export Excel berjalan
```

## Google Drive

```text
[ ] /google-drive/connect berjalan
[ ] /google-drive/callback menerima token
[ ] Refresh token tersimpan
[ ] Upload PDF berhasil
[ ] File muncul di folder Google Drive
[ ] File bisa didownload dari aplikasi
```

## Report

```text
[ ] Filter report berjalan
[ ] Export report berjalan
```

---

# 23. Catatan Penting untuk AI Agent

1. Jangan menghapus struktur mockup.
2. Jangan mengganti nama menu utama tanpa alasan.
3. Jangan membuat sidebar yang berbeda dari mockup.
4. Jangan membuat upload file lokal saja jika Google Drive sudah dikonfigurasi.
5. Jangan menimpa file lama saat revisi; simpan sebagai history.
6. Jangan membuat semua user bisa approve.
7. Jangan membuat semua user bisa melihat semua pengajuan.
8. Jangan lupa validasi status Done/Hold/Cancel.
9. Jangan membuat UI terlalu ramai.
10. Pastikan aplikasi bisa dipakai secara bertahap walaupun belum semua fitur selesai.

---

# 24. Output yang Diharapkan

Setelah AI Agent selesai, aplikasi harus memiliki:

```text
- Login dan role access
- Sidebar sesuai mockup
- HOME dashboard
- Menu Permintaan Modul Khusus
- Menu Perubahan Modul
- Database Modul
- Database Formula Modul
- Matriks Pelatihan
- Role & Master Data
- Report
- Notifikasi
- Pengaturan
- Upload file ke Google Drive OAuth
- Approval flow
- Riwayat revisi
- Import/export Excel
```

Aplikasi harus siap digunakan sebagai sistem internal manajemen modul pelatihan berbasis Laravel + React.
