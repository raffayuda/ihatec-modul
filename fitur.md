# fitur.md — Daftar Fitur Aplikasi Training Module Management System

## 1. Overview

Aplikasi ini adalah sistem manajemen modul pelatihan yang digunakan untuk mengelola pengajuan modul, revisi modul, approval, database modul, matriks pelatihan, master data, storage dokumen, notifikasi, dan laporan.

Dokumen ini berisi daftar fitur yang akan dibuat pada aplikasi berbasis Laravel + React.

---

## 2. Fitur Berdasarkan Role

## 2.1 Admin

Admin adalah role dengan akses penuh ke seluruh sistem.

### Fitur Admin

- Login dan logout.
- Melihat Dashboard Admin.
- Melihat statistik total user, role aktif, total modul, dan storage digunakan.
- Mengelola user.
- Mengelola role dan permission.
- Mengakses pengajuan modul.
- Mengakses approval modul.
- Mengakses database modul.
- Mengakses matriks pelatihan.
- Mengelola master data.
- Melihat report.
- Mengelola integrasi storage/email.

### Menu Admin

- Dashboard Admin
- Manajemen User
- Role & Permission
- Pengajuan Modul
- Approval Modul
- Database Modul
- Matriks Pelatihan
- Master Data
- Report
- Integrasi
- Pengaturan

---

## 2.2 User / Pengaju

User adalah pengguna yang dapat mengajukan permintaan modul khusus dan memantau status pengajuannya.

### Fitur User

- Login dan logout.
- Melihat Dashboard User.
- Mengajukan permintaan modul khusus.
- Mengisi jenis kebutuhan modul.
- Mengisi deskripsi permintaan khusus.
- Mengisi tanggal dibutuhkan.
- Melihat status pengajuan.
- Melihat riwayat pengajuan pribadi.
- Menerima notifikasi approval/reject/progress.
- Mengubah profil pribadi.

### Menu User

- Dashboard User
- Ajukan Modul Khusus
- Riwayat Pengajuan
- Notifikasi
- Profil

---

## 2.3 Staf PD

Staf PD bertugas memproses modul baru, revisi modul, dan upload dokumen sebelum dikirim ke Manager PD.

### Fitur Staf PD

- Login dan logout.
- Melihat Dashboard Staf PD.
- Melihat daftar permintaan modul khusus.
- Membuat pengajuan modul baru.
- Mengisi data modul baru.
- Upload dokumen PDF modul.
- Mengirim modul ke approval Manager PD.
- Membuat revisi modul existing.
- Mengisi alasan revisi.
- Mengisi detail perubahan.
- Upload dokumen revisi.
- Melihat riwayat perubahan modul.
- Melihat status approval.
- Menerima notifikasi approved/rejected.

### Menu Staf PD

- Dashboard Staf PD
- Permintaan Modul Khusus
- Modul Baru
- Revisi Modul
- Riwayat Pengajuan
- Database Modul
- Notifikasi

---

## 2.4 Manager PD

Manager PD bertugas melakukan review dan approval terhadap modul baru maupun revisi modul.

### Fitur Manager PD

- Login dan logout.
- Melihat Dashboard Manager PD.
- Melihat daftar modul menunggu approval.
- Melihat detail modul baru.
- Melihat detail revisi modul.
- Preview/download dokumen PDF.
- Approve modul baru.
- Reject modul baru dengan alasan.
- Approve revisi modul.
- Reject revisi modul dengan alasan.
- Melihat riwayat approval.
- Melihat database modul.
- Melihat matriks pelatihan.
- Menerima notifikasi pengajuan baru.

### Menu Manager PD

- Dashboard Manager PD
- Approval Modul Baru
- Approval Revisi Modul
- Database Modul
- Matriks Pelatihan
- Riwayat Approval
- Notifikasi
- Report

---

## 2.5 Tim Training

Tim Training menggunakan data modul yang sudah approved untuk kebutuhan pelatihan.

### Fitur Tim Training

- Login dan logout.
- Melihat Dashboard Tim Training.
- Melihat daftar modul approved.
- Mengakses dokumen PDF modul.
- Melihat matriks pelatihan.
- Melihat formula modul.
- Menerima notifikasi modul baru approved.
- Menerima notifikasi revisi modul approved.
- Export data modul jika memiliki izin.

### Menu Tim Training

- Dashboard Tim Training
- Database Modul Approved
- Matriks Pelatihan
- Formula Modul
- Notifikasi
- Report

---

# 3. Fitur Utama Aplikasi

## 3.1 Authentication dan Authorization

### Deskripsi

Fitur untuk mengatur login, logout, dan pembatasan akses berdasarkan role.

### Detail Fitur

- Login email dan password.
- Logout.
- Middleware role.
- Permission per menu.
- Permission per action.
- Redirect dashboard sesuai role.
- Proteksi endpoint backend.

### Output

- User hanya bisa mengakses fitur sesuai hak aksesnya.

---

## 3.2 Dashboard Admin

### Deskripsi

Dashboard untuk Admin yang berfokus pada kontrol sistem.

### Komponen Dashboard

- Total User.
- Role Aktif.
- Total Modul.
- Storage Digunakan.
- Manajemen User & Akses.
- Distribusi Role.
- Quick Action.
- Pengajuan & Approval Modul.
- Matriks Pelatihan Preview.
- Master Data Overview.
- Storage & File Overview.
- Kesehatan Sistem.
- Notifikasi Penting.

### Quick Action

- Tambah User.
- Kelola Master Data.
- Kelola Matriks.
- Backup Sekarang.

---

## 3.3 Dashboard Manager PD

### Deskripsi

Dashboard untuk Manager PD yang berfokus pada approval dan monitoring modul.

### Komponen Dashboard

- Total Modul.
- Menunggu Approval.
- Modul Approved.
- Revisi Modul.
- Alur Proses Modul.
- Pengajuan Terbaru.
- Aktivitas Terbaru.
- Quick Action.
- Penyimpanan Dokumen.
- Ringkasan Approval.
- Matriks Modul Pelatihan Preview.

---

## 3.4 Dashboard Staf PD

### Deskripsi

Dashboard untuk Staf PD yang berfokus pada proses pembuatan dan revisi modul.

### Komponen Dashboard

- Modul Draft.
- Modul Submitted.
- Modul Rejected.
- Modul Approved.
- Daftar pekerjaan aktif.
- Permintaan modul khusus terbaru.
- Riwayat upload dokumen.
- Notifikasi status modul.

---

## 3.5 Dashboard User

### Deskripsi

Dashboard untuk User yang berfokus pada pengajuan modul khusus.

### Komponen Dashboard

- Total Pengajuan Saya.
- Dalam Proses.
- Disetujui.
- Ditolak.
- Tombol Ajukan Modul Khusus.
- Riwayat pengajuan saya.
- Notifikasi terbaru.

---

## 3.6 Dashboard Tim Training

### Deskripsi

Dashboard untuk Tim Training yang berfokus pada modul approved dan matriks pelatihan.

### Komponen Dashboard

- Total Modul Approved.
- Modul Baru Approved.
- Revisi Approved.
- Matriks Pelatihan.
- Modul terbaru.
- Notifikasi modul siap digunakan.

---

# 4. Fitur Pengajuan Modul

## 4.1 Permintaan Modul Khusus

### Deskripsi

Fitur untuk User mengajukan kebutuhan modul khusus.

### Field Form

- No Pengajuan otomatis.
- Tanggal Pengajuan otomatis.
- Jenis Kebutuhan Modul.
- Permintaan Khusus.
- Tanggal Dibutuhkan.
- Lampiran opsional.

### Fitur

- Tambah pengajuan.
- Edit pengajuan selama belum diproses.
- Hapus pengajuan selama masih draft.
- Lihat detail pengajuan.
- Lihat status pengajuan.
- Filter berdasarkan status.
- Urutkan berdasarkan tanggal dibutuhkan tercepat.

### Status

- Draft
- Submitted
- In Review
- Approved
- Rejected
- Done

---

## 4.2 Modul Baru

### Deskripsi

Fitur untuk Staf PD membuat pengajuan modul baru.

### Field Form

- Jenis Pelatihan.
- Judul Program Pelatihan.
- Judul Modul.
- Deskripsi Permintaan Khusus.
- Bahasa Pelatihan.
- Jumlah Hari Pelatihan.
- Jenis Sertifikat.
- Tipe Pelatihan.
- Upload Dokumen PDF.

### Fitur

- Simpan sebagai draft.
- Submit ke Manager PD.
- Upload PDF.
- Preview PDF.
- Edit sebelum submit.
- Validasi data wajib.
- Notifikasi ke Manager PD.

---

## 4.3 Revisi Modul Existing

### Deskripsi

Fitur untuk mengajukan revisi terhadap modul yang sudah ada.

### Field Form

- Kode Modul.
- Judul Modul.
- Kode Revisi Saat Ini.
- Kode Revisi Baru otomatis.
- Alasan Perubahan.
- Detail Perubahan.
- Upload Dokumen Revisi.

### Fitur

- Pilih modul existing.
- Generate kode revisi otomatis.
- Upload dokumen revisi.
- Submit approval.
- Simpan history versi lama.
- Catatan reject.
- Notifikasi ke Manager PD.

---

# 5. Fitur Approval

## 5.1 Approval Modul Baru

### Deskripsi

Fitur untuk Manager PD melakukan review terhadap modul baru.

### Fitur

- Lihat daftar modul menunggu approval.
- Lihat detail modul.
- Preview/download PDF.
- Approve modul.
- Reject modul.
- Isi alasan reject.
- Simpan tanggal approval.
- Simpan nama approver.
- Notifikasi ke Staf PD.
- Notifikasi ke Tim Training jika approved.

---

## 5.2 Approval Revisi Modul

### Deskripsi

Fitur untuk Manager PD melakukan review terhadap revisi modul.

### Fitur

- Lihat daftar revisi menunggu approval.
- Lihat detail perubahan.
- Bandingkan versi lama dan versi baru.
- Preview file revisi.
- Approve revisi.
- Reject revisi.
- Isi alasan reject.
- Update versi aktif jika approved.
- Simpan versi lama sebagai history.
- Notifikasi ke Staf PD dan Tim Training.

---

# 6. Fitur Database Modul

## 6.1 Daftar Modul

### Deskripsi

Halaman untuk melihat semua modul yang sudah tersedia di sistem.

### Kolom Tabel

- Kode Modul.
- Judul Modul.
- Kode Revisi.
- Tanggal Persetujuan Terakhir.
- Jenis Pelatihan.
- Bahasa.
- Jenis Sertifikat.
- Status.
- Action.

### Fitur

- Search modul.
- Filter kode modul.
- Filter status.
- Filter jenis pelatihan.
- Filter tanggal approval.
- Detail modul.
- Preview PDF.
- Download PDF.
- Lihat riwayat revisi.
- Export Excel/PDF.

---

## 6.2 Detail Modul

### Informasi Detail

- Kode Modul.
- Judul Modul.
- Jenis Pelatihan.
- Bahasa Pelatihan.
- Jumlah Hari.
- Tipe Pelatihan.
- Jenis Sertifikat.
- Kode Revisi.
- Status.
- Tanggal Approval.
- Approver.
- File PDF.
- Riwayat revisi.

---

## 6.3 Riwayat Revisi Modul

### Deskripsi

Fitur untuk melihat perubahan versi modul dari waktu ke waktu.

### Informasi

- Kode revisi.
- Tanggal revisi.
- Alasan perubahan.
- Detail perubahan.
- File versi lama.
- File versi baru.
- Submitted by.
- Approved by.
- Status approval.

---

# 7. Fitur Matriks Pelatihan

## 7.1 Matriks Modul Pelatihan

### Deskripsi

Fitur untuk memetakan modul terhadap program pelatihan, unit, jabatan, atau kebutuhan pelatihan tertentu.

### Tampilan

- Tabel matriks seperti spreadsheet.
- Baris berisi unit/program/jabatan.
- Kolom berisi modul atau kode materi.
- Tanda cek jika modul digunakan.
- Kategori wajib/opsional.

### Fitur

- Tambah relasi modul ke pelatihan.
- Hapus relasi modul dari pelatihan.
- Tandai modul wajib.
- Tandai modul opsional.
- Filter berdasarkan unit.
- Filter berdasarkan program pelatihan.
- Filter berdasarkan kode modul.
- Export Excel.
- Export PDF.

---

## 7.2 Preview Matriks di Dashboard

### Deskripsi

Ringkasan matriks yang tampil di dashboard Admin/Manager/Tim Training.

### Isi

- Unit/Jabatan.
- Total modul wajib.
- Total modul opsional.
- Total keseluruhan.

---

# 8. Fitur Master Data

## 8.1 Jenis Kebutuhan Modul

Contoh data:

- Pelatihan Inhouse.
- Pelatihan Internal.
- Seminar.

Fitur:

- Tambah data.
- Edit data.
- Delete data.
- Aktif/nonaktif data.

---

## 8.2 Jenis Pelatihan

Contoh data:

- Inhouse.
- Internal.
- Public Training.
- Workshop.

---

## 8.3 Kode Pelatihan

Fitur untuk mengelola kode program/kode materi pelatihan.

Field:

- Kode.
- Nama Pelatihan.
- Deskripsi.
- Status.

---

## 8.4 Jenis Sertifikat

Contoh data:

- Kelulusan.
- Kehadiran.
- Kompetensi.
- Tidak Ada Sertifikat.

---

## 8.5 Bahasa Pelatihan

Contoh data:

- Indonesia.
- Inggris.
- Bilingual.

---

## 8.6 Unit / Jabatan / Program

Digunakan untuk kebutuhan matriks pelatihan.

Fitur:

- Tambah unit.
- Tambah jabatan.
- Tambah program.
- Hubungkan dengan matriks pelatihan.

---

# 9. Fitur Storage Dokumen

## 9.1 Upload File PDF

### Deskripsi

Fitur untuk menyimpan file modul ke cloud storage.

### Validasi

- File wajib PDF.
- Ukuran file maksimal dapat dikonfigurasi.
- Nama file otomatis dinormalisasi.
- File disimpan berdasarkan kode modul dan revisi.

### Contoh Struktur Path

```text
modules/{kode_modul}/revisi-{kode_revisi}/file.pdf
```

---

## 9.2 Preview dan Download PDF

### Fitur

- Preview PDF langsung di aplikasi.
- Download PDF sesuai permission.
- Signed URL untuk file private.
- Catat aktivitas download di audit log.

---

## 9.3 Storage Overview

### Informasi

- Total storage digunakan.
- Jumlah file PDF.
- Jumlah dokumen revisi.
- Arsip file lama.
- Sisa kapasitas.
- Provider storage.

---

# 10. Fitur Notifikasi

## 10.1 Notifikasi In-App

### Trigger Notifikasi

- Pengajuan modul khusus dibuat.
- Modul baru disubmit.
- Revisi modul disubmit.
- Modul approved.
- Modul rejected.
- Deadline pengajuan hampir lewat.
- File berhasil diupload.

---

## 10.2 Email Notification

### Penerima Email

- Manager PD saat ada modul menunggu approval.
- Staf PD saat modul approved/rejected.
- Tim Training saat modul sudah approved.
- Admin saat ada error sistem penting.

---

# 11. Fitur Audit Log

## 11.1 Aktivitas yang Dicatat

- Login berhasil.
- Login gagal.
- Logout.
- Tambah user.
- Ubah role.
- Ubah permission.
- Tambah master data.
- Ubah master data.
- Upload file.
- Download file.
- Submit modul.
- Approve modul.
- Reject modul.
- Update matriks pelatihan.

## 11.2 Tampilan Audit Log

Kolom:

- Waktu.
- User.
- Aktivitas.
- Modul/Entity.
- IP Address.
- Device/User Agent.
- Detail.

---

# 12. Fitur Report

## 12.1 Report Modul

- Total modul per periode.
- Modul approved.
- Modul rejected.
- Modul revisi.
- Modul berdasarkan jenis pelatihan.

## 12.2 Report Pengajuan

- Total pengajuan modul khusus.
- Pengajuan berdasarkan status.
- Pengajuan berdasarkan user.
- Pengajuan berdasarkan tanggal dibutuhkan.

## 12.3 Report Approval

- Approval per Manager PD.
- Rata-rata waktu approval.
- Jumlah reject.
- Alasan reject terbanyak.

## 12.4 Export Report

- Export Excel.
- Export PDF.

---

# 13. Fitur Integrasi

## 13.1 Cloudflare R2

Digunakan untuk menyimpan file PDF modul.

Konfigurasi:

- Access Key.
- Secret Key.
- Bucket Name.
- Endpoint.
- Public/Signed URL setting.

## 13.2 Email SMTP

Digunakan untuk mengirim notifikasi email.

Konfigurasi:

- Mail host.
- Mail port.
- Mail username.
- Mail password.
- Mail encryption.
- Sender email.

---

# 14. Fitur Pengaturan

## 14.1 Pengaturan Umum

- Nama aplikasi.
- Logo aplikasi.
- Default storage provider.
- Maksimal ukuran upload.
- Format nomor pengajuan.
- Format kode revisi.

## 14.2 Pengaturan Approval

- Role approver default.
- Wajib alasan reject.
- Batas waktu approval.
- Reminder approval.

## 14.3 Pengaturan Notifikasi

- Aktif/nonaktif email notification.
- Aktif/nonaktif in-app notification.
- Template email.

---

# 15. Prioritas Pengembangan

## Prioritas Tinggi

- Login dan role.
- Dashboard Admin.
- Manajemen User.
- Master Data.
- Pengajuan Modul Baru.
- Upload PDF.
- Approval Modul.
- Database Modul.
- Revisi Modul.
- Riwayat Revisi.

## Prioritas Sedang

- Matriks Pelatihan.
- Notifikasi Email.
- Audit Log.
- Report.
- Storage Overview.

## Prioritas Rendah

- Integrasi lanjutan.
- Dashboard analitik detail.
- Export custom.
- Pengaturan template email.

---

# 16. Rekomendasi Halaman Awal yang Dibuat

Agar development tidak terlalu berat, urutan halaman yang sebaiknya dibuat adalah:

1. Login.
2. Dashboard Admin.
3. Manajemen User.
4. Role & Permission.
5. Master Data Jenis Kebutuhan Modul.
6. Pengajuan Modul Baru.
7. Upload PDF.
8. Approval Modul.
9. Database Modul.
10. Revisi Modul.
11. Riwayat Revisi.
12. Matriks Pelatihan.
13. Report.
14. Audit Log.
15. Storage Setting.

---

# 17. Catatan Desain UI

Style UI yang disarankan:

- Clean corporate.
- Warna utama biru/teal.
- Background putih dan abu muda.
- Card rounded.
- Status badge warna:
  - Hijau: Approved/Aktif/Berhasil.
  - Kuning: Pending/Menunggu.
  - Merah: Rejected/Nonaktif/Gagal.
  - Biru: Draft/Info.
  - Ungu: Revisi/Manager.
- Sidebar tetap di kiri.
- Topbar berisi search, notifikasi, dan profil.
- Tabel menggunakan pagination dan filter.
- Form menggunakan layout dua kolom untuk desktop.
- Modal digunakan untuk aksi cepat.

---

# 18. Kesimpulan

Fitur inti aplikasi ini adalah mengelola siklus hidup modul pelatihan dari pengajuan, drafting, approval, revisi, penyimpanan PDF, database modul, hingga matriks pelatihan. Admin memiliki all access untuk mengatur sistem, sedangkan role lain memiliki dashboard dan menu sesuai kebutuhan kerja masing-masing.
