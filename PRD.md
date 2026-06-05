# PRD.md — Product Requirements Document

## 1. Ringkasan Produk

**Nama aplikasi:** Training PD / Training Module Management System  
**Jenis aplikasi:** Web application berbasis Laravel + React  
**Tujuan utama:** Membantu perusahaan mengelola proses pengajuan, pembuatan, revisi, approval, penyimpanan, dan pemetaan modul pelatihan secara terpusat.

Aplikasi ini dibuat untuk menggantikan proses manual berbasis spreadsheet dan file terpisah menjadi sistem yang lebih rapi, terdokumentasi, memiliki alur approval, dan dapat menyimpan riwayat perubahan modul.

---

## 2. Latar Belakang Masalah

Saat ini pengelolaan modul pelatihan masih terlihat dilakukan melalui spreadsheet dan file manual. Alur seperti pengajuan modul baru, revisi modul existing, approval Manager PD, penyimpanan file PDF, serta pemetaan modul ke pelatihan masih rawan terjadi:

- Data modul tersebar di banyak file.
- Riwayat revisi sulit dilacak.
- Approval modul tidak terdokumentasi dengan baik.
- File PDF modul berpotensi tertukar antara versi lama dan versi terbaru.
- Tim Training sulit mengetahui modul mana yang sudah approved.
- Admin sulit mengelola user, role, master data, dan laporan secara terpusat.

Karena itu dibutuhkan aplikasi yang mampu mengelola seluruh siklus hidup modul pelatihan dari awal pengajuan hingga modul digunakan oleh Tim Training.

---

## 3. Tujuan Produk

Tujuan aplikasi ini adalah:

1. Menyediakan sistem pengajuan modul pelatihan baru dan modul khusus.
2. Menyediakan proses revisi modul existing dengan riwayat perubahan.
3. Menyediakan fitur approval/reject oleh Manager PD.
4. Menyediakan database modul yang sudah disetujui.
5. Menyediakan matriks pelatihan untuk memetakan modul terhadap program/unit/pelatihan.
6. Menyediakan master data agar input sistem konsisten.
7. Menyediakan penyimpanan dokumen PDF modul secara aman menggunakan cloud storage.
8. Menyediakan dashboard berbeda berdasarkan role pengguna.
9. Menyediakan audit log dan laporan aktivitas sistem.

---

## 4. Target Pengguna

### 4.1 Admin

Admin memiliki akses penuh terhadap seluruh fitur aplikasi. Admin bertanggung jawab terhadap pengelolaan sistem, user, role, master data, storage, audit log, database modul, matriks pelatihan, dan laporan.

### 4.2 User / Pengaju

User adalah pengguna yang dapat mengajukan permintaan modul khusus. User dapat melihat status pengajuan dan riwayat pengajuan miliknya sendiri.

### 4.3 Staf PD

Staf PD bertugas membuat pengajuan modul baru, memproses dokumen modul, melakukan upload PDF, mengajukan revisi modul existing, dan mengirimkan modul ke tahap approval.

### 4.4 Manager PD

Manager PD bertugas melakukan review, approval, atau reject terhadap pengajuan modul baru dan revisi modul.

### 4.5 Tim Training

Tim Training dapat melihat modul yang sudah approved, mengakses matriks pelatihan, mengunduh modul, dan menerima notifikasi jika ada modul baru atau revisi yang sudah disetujui.

---

## 5. Ruang Lingkup Produk

### 5.1 Termasuk dalam Scope

- Login dan autentikasi pengguna.
- Role-based access control.
- Dashboard sesuai role.
- Pengajuan permintaan modul khusus.
- Pengajuan modul baru.
- Revisi modul existing.
- Approval/reject modul.
- Upload dan penyimpanan PDF modul.
- Database modul approved.
- Riwayat revisi modul.
- Matriks pelatihan.
- Master data.
- Notifikasi aplikasi.
- Email notification dasar.
- Audit log.
- Report dan export.
- Storage overview.

### 5.2 Tidak Termasuk dalam MVP Awal

- Streaming video pelatihan.
- E-learning lengkap dengan kuis dan nilai peserta.
- Sertifikat otomatis untuk peserta.
- Integrasi penuh dengan HRIS perusahaan.
- Mobile app native Android/iOS.
- AI recommendation untuk modul.

---

## 6. Platform dan Teknologi

### 6.1 Frontend

- React
- Inertia.js atau API-based React SPA
- Tailwind CSS
- shadcn/ui atau custom component system
- Lucide React untuk ikon

### 6.2 Backend

- Laravel
- Laravel Breeze / Sanctum / Passport sesuai kebutuhan autentikasi
- MySQL atau PostgreSQL
- Queue Worker untuk email dan background job

### 6.3 Storage

- Cloudflare R2 untuk penyimpanan dokumen PDF
- Local storage untuk development
- Signed URL untuk akses file private

### 6.4 Deployment

- VPS / Cloud server
- Nginx
- PHP-FPM
- Supervisor untuk queue
- Database managed/self-hosted sesuai kebutuhan

---

## 7. Role dan Hak Akses

| Role | Hak Akses Utama |
|---|---|
| Admin | Semua akses, user, role, master data, database modul, matriks, approval, report, storage, audit log |
| User | Ajukan modul khusus, lihat status pengajuan sendiri, lihat notifikasi |
| Staf PD | Buat modul baru, revisi modul, upload dokumen, submit approval, lihat riwayat |
| Manager PD | Review, approve, reject modul baru dan revisi modul |
| Tim Training | Akses modul approved, matriks pelatihan, formula modul, notifikasi modul approved |

---

## 8. Alur Utama Sistem

### 8.1 Alur Modul Baru

1. Staf PD membuka menu Modul Baru.
2. Staf PD mengisi data modul.
3. Staf PD mengupload dokumen PDF.
4. Sistem menyimpan data sebagai draft atau submitted.
5. Manager PD menerima notifikasi approval.
6. Manager PD melakukan review.
7. Manager PD memilih approve atau reject.
8. Jika approved, modul masuk ke Database Modul.
9. Tim Training menerima notifikasi.
10. Modul dapat digunakan dalam Matriks Pelatihan.

### 8.2 Alur Revisi Modul Existing

1. Staf PD memilih modul existing dari Database Modul.
2. Staf PD mengisi alasan perubahan dan detail perubahan.
3. Staf PD mengupload dokumen revisi.
4. Sistem membuat kode revisi sementara.
5. Manager PD melakukan approval/reject.
6. Jika approved, kode revisi modul bertambah otomatis.
7. File revisi menjadi versi aktif.
8. Versi lama tetap tersimpan sebagai history.
9. Tim Training menerima notifikasi revisi approved.

### 8.3 Alur Permintaan Modul Khusus

1. User membuka menu Permintaan Modul Khusus.
2. User mengisi jenis kebutuhan, permintaan khusus, dan tanggal dibutuhkan.
3. Sistem menyimpan pengajuan dengan status baru.
4. Staf PD melihat daftar permintaan berdasarkan tanggal kebutuhan tercepat.
5. Staf PD memproses permintaan menjadi modul baru atau revisi modul.
6. User dapat memantau status pengajuannya.

---

## 9. Status Data

### 9.1 Status Pengajuan

- Draft
- Submitted
- In Review
- Approved
- Rejected
- Revision Needed
- Done

### 9.2 Status Modul

- Draft
- Waiting Approval
- Approved
- Rejected
- Archived

### 9.3 Status User

- Aktif
- Nonaktif
- Pending

---

## 10. Kebutuhan Fungsional

### 10.1 Authentication

- Pengguna dapat login menggunakan email dan password.
- Pengguna dapat logout.
- Sistem menampilkan dashboard sesuai role.
- Sistem membatasi menu berdasarkan permission.

### 10.2 Dashboard

- Admin dapat melihat statistik sistem.
- Manager PD dapat melihat modul menunggu approval.
- Staf PD dapat melihat modul yang sedang diproses.
- User dapat melihat pengajuan miliknya sendiri.
- Tim Training dapat melihat modul approved dan matriks pelatihan.

### 10.3 Manajemen User dan Role

- Admin dapat membuat, mengubah, menonaktifkan, dan menghapus user.
- Admin dapat membuat role dan permission.
- Admin dapat menetapkan role ke user.
- Admin dapat melihat status user dan last login.

### 10.4 Pengajuan Modul

- User dapat membuat permintaan modul khusus.
- Staf PD dapat membuat pengajuan modul baru.
- Staf PD dapat melakukan revisi modul existing.
- Sistem dapat mengurutkan permintaan berdasarkan tanggal dibutuhkan.

### 10.5 Approval

- Manager PD dapat melihat daftar modul menunggu approval.
- Manager PD dapat membuka detail pengajuan.
- Manager PD dapat approve atau reject.
- Manager PD wajib mengisi alasan jika reject.
- Sistem menyimpan nama approver dan tanggal approval.

### 10.6 Database Modul

- Sistem menyimpan semua modul approved.
- Sistem menyimpan kode modul, judul, revisi, tanggal approval, file PDF, dan status.
- Pengguna berwenang dapat melihat, mencari, memfilter, dan mengunduh modul.
- Sistem menyimpan history revisi.

### 10.7 Matriks Pelatihan

- Admin dan Tim Training dapat melihat matriks pelatihan.
- Admin dapat mengelola relasi modul dengan program/unit/pelatihan.
- Sistem dapat menampilkan jumlah modul wajib dan opsional.
- Sistem dapat export matriks ke Excel/PDF.

### 10.8 Master Data

- Admin dapat mengelola jenis kebutuhan modul.
- Admin dapat mengelola jenis pelatihan.
- Admin dapat mengelola kode pelatihan.
- Admin dapat mengelola jenis sertifikat.
- Admin dapat mengelola bahasa pelatihan.
- Admin dapat mengelola kategori pelatihan.

### 10.9 Storage Dokumen

- Sistem dapat upload file PDF.
- Sistem memvalidasi tipe file PDF.
- Sistem menyimpan file ke Cloudflare R2.
- Sistem menyimpan path file ke database.
- Sistem dapat membuat signed URL untuk akses file.
- Sistem menampilkan penggunaan storage.

### 10.10 Notifikasi

- Sistem memberi notifikasi saat pengajuan baru dibuat.
- Sistem memberi notifikasi saat modul perlu approval.
- Sistem memberi notifikasi saat modul approved/rejected.
- Sistem memberi notifikasi ke Tim Training saat modul final tersedia.
- Sistem dapat mengirim email notification dasar.

### 10.11 Audit Log

- Sistem mencatat aktivitas penting.
- Aktivitas yang dicatat meliputi login, upload file, approval, reject, perubahan user, perubahan role, perubahan master data, dan perubahan modul.
- Admin dapat melihat audit log.

### 10.12 Report

- Admin dapat melihat laporan pengajuan modul.
- Admin dapat melihat laporan revisi modul.
- Admin dapat melihat laporan approval/reject.
- Admin dapat export laporan ke Excel/PDF.

---

## 11. Kebutuhan Non-Fungsional

### 11.1 Keamanan

- Password harus di-hash.
- File PDF private tidak boleh diakses langsung tanpa izin.
- Role dan permission harus diterapkan di backend.
- Endpoint upload harus divalidasi.
- Audit log harus mencatat aktivitas penting.

### 11.2 Performa

- Dashboard utama harus dapat dimuat kurang dari 3 detik pada data normal.
- Tabel besar menggunakan pagination.
- File upload besar harus ditangani dengan baik.

### 11.3 Skalabilitas

- Storage file menggunakan cloud object storage.
- Database dapat ditingkatkan sesuai jumlah modul dan user.
- Queue digunakan untuk email dan proses background.

### 11.4 Usability

- UI harus clean, modern, dan mudah dipahami.
- Status harus ditampilkan dengan badge warna.
- Form harus memiliki validasi yang jelas.
- Tabel harus memiliki search, filter, dan pagination.

---

## 12. Struktur Menu

### 12.1 Admin

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

### 12.2 Manager PD

- Dashboard Manager PD
- Approval Modul Baru
- Approval Revisi Modul
- Database Modul
- Matriks Pelatihan
- Notifikasi
- Report

### 12.3 Staf PD

- Dashboard Staf PD
- Modul Baru
- Revisi Modul
- Riwayat Pengajuan
- Database Modul
- Notifikasi

### 12.4 User

- Dashboard User
- Ajukan Modul Khusus
- Riwayat Pengajuan
- Notifikasi
- Profil

### 12.5 Tim Training

- Dashboard Tim Training
- Database Modul Approved
- Matriks Pelatihan
- Formula Modul
- Notifikasi
- Report

---

## 13. Entitas Data Utama

### 13.1 Users

- id
- name
- email
- password
- role_id
- unit_id
- status
- last_login_at
- created_at
- updated_at

### 13.2 Roles

- id
- name
- description
- created_at
- updated_at

### 13.3 Permissions

- id
- name
- module
- action
- created_at
- updated_at

### 13.4 Training Modules

- id
- module_code
- title
- training_type_id
- language_id
- certificate_type_id
- days_count
- revision_code
- status
- approved_at
- approved_by
- active_file_id
- created_by
- created_at
- updated_at

### 13.5 Module Files

- id
- module_id
- revision_code
- file_name
- file_path
- file_size
- mime_type
- storage_provider
- uploaded_by
- uploaded_at

### 13.6 Module Requests

- id
- request_number
- request_type
- need_type_id
- requested_by
- special_request
- needed_at
- status
- created_at
- updated_at

### 13.7 Module Revisions

- id
- module_id
- old_revision_code
- new_revision_code
- reason
- change_detail
- status
- submitted_by
- approved_by
- approved_at
- rejected_reason
- created_at
- updated_at

### 13.8 Training Matrix

- id
- unit_id
- program_id
- module_id
- matrix_type
- is_required
- created_at
- updated_at

### 13.9 Master Data

Master data dapat dipecah ke tabel:

- training_types
- need_types
- training_codes
- certificate_types
- languages
- categories
- units
- programs

### 13.10 Audit Logs

- id
- user_id
- action
- entity_type
- entity_id
- old_value
- new_value
- ip_address
- user_agent
- created_at

---

## 14. Prioritas MVP

### MVP 1 — Fondasi Sistem

- Login dan role user.
- Dashboard sederhana per role.
- Manajemen user dan role.
- Master data dasar.

### MVP 2 — Modul dan Approval

- Pengajuan modul baru.
- Upload PDF modul.
- Approval/reject Manager PD.
- Database modul approved.

### MVP 3 — Revisi dan History

- Revisi modul existing.
- Kode revisi otomatis.
- Riwayat revisi modul.
- Notifikasi dasar.

### MVP 4 — Matriks dan Report

- Matriks pelatihan.
- Report pengajuan dan revisi.
- Export Excel/PDF.
- Audit log.

---

## 15. Acceptance Criteria Utama

1. Admin dapat login dan mengakses seluruh menu.
2. User hanya dapat melihat dan mengelola pengajuan miliknya sendiri.
3. Staf PD dapat membuat modul baru dan revisi modul.
4. Manager PD dapat approve/reject modul.
5. Modul approved otomatis masuk ke Database Modul.
6. Revisi modul approved tidak menghapus versi lama.
7. File PDF tersimpan di storage dan dapat diakses sesuai permission.
8. Matriks pelatihan dapat menampilkan hubungan modul dengan program/unit.
9. Audit log mencatat aktivitas penting.
10. Dashboard menampilkan ringkasan sesuai role.

---

## 16. Risiko dan Catatan

- Jika permission role tidak dirancang dari awal, sistem akan sulit dikembangkan.
- Jika file revisi menimpa file lama, riwayat dokumen bisa hilang.
- Jika storage menggunakan link public biasa, dokumen perusahaan berisiko bocor.
- Jika master data tidak dikunci melalui dropdown, data akan mudah tidak konsisten.
- Jika matriks pelatihan terlalu besar, perlu pagination atau tampilan spreadsheet-like.

---

## 17. Definisi Sukses Produk

Aplikasi dianggap berhasil jika:

- Proses pengajuan dan approval modul tidak lagi bergantung pada spreadsheet manual.
- Tim dapat melihat status modul secara real-time.
- Modul approved tersimpan rapi dan mudah dicari.
- Riwayat revisi setiap modul terdokumentasi.
- Admin dapat mengelola user, role, master data, storage, dan laporan dari satu sistem.
- Tim Training dapat mengetahui modul mana yang sudah siap digunakan.
