<?php

namespace Database\Seeders;

use App\Models\Module;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ModuleRevision;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Siti Nurhayati',
            'email' => 'manager@example.com',
            'role' => 'manager PD',
        ]);

        User::factory()->create([
            'name' => 'Rina Apriyani',
            'email' => 'staf@example.com',
            'role' => 'Staf PD',
        ]);

        User::factory()->create([
            'name' => 'Andi Pratama',
            'email' => 'user@example.com',
            'role' => 'User',
        ]);

        $modulesData = [
            [
                'code' => 'ILN.1.8',
                'title' => 'Interpretasi Sistem dan Implementasi ISO 17025',
                'program' => 'Manajerial & Kepemimpinan',
                'current_revision' => '2.1',
                'language' => 'Indonesia',
                'status' => 'Approved',
                'file_size' => '2.45 MB',
                'file_pages' => 24,
                'description' => 'Panduan teknis dan implementasi persyaratan umum kompetensi laboratorium pengujian dan kalibrasi sesuai standar ISO/IEC 17025:2017.',
                'revisions' => [
                    ['revision' => '2.1', 'date' => '12 Jun 2024 09:21 WIB', 'author_name' => 'Raffa (Administrator)', 'note' => 'Perbaikan minor pada materi and update referensi.', 'status' => 'Approved'],
                    ['revision' => '2.0', 'date' => '30 Mei 2024 11:28 WIB', 'author_name' => 'Dewi Lestari', 'note' => 'Penyesuaian prosedur dan penambahan studi kasus.', 'status' => 'Approved'],
                    ['revision' => '1.1', 'date' => '15 Mei 2024 14:05 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Penambahan materi pada bab 3 dan 4.', 'status' => 'Approved'],
                    ['revision' => '1.0', 'date' => '01 Mei 2024 09:00 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Versi awal modul.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'SJPH',
                'title' => 'Sistem Jaminan Produk Halal (SJPH)',
                'program' => 'Regulasi & Kepatuhan',
                'current_revision' => '1.3',
                'language' => 'Indonesia',
                'status' => 'Approved',
                'file_size' => '3.12 MB',
                'file_pages' => 35,
                'description' => 'Acuan standard implementasi jaminan produk halal di industri pangan, farmasi, dan kosmetika berdasarkan regulasi BPJPH.',
                'revisions' => [
                    ['revision' => '1.3', 'date' => '07 Jun 2024 14:35 WIB', 'author_name' => 'Dewi Lestari', 'note' => 'Sinkronisasi kriteria SJPH Kemenag terbaru.', 'status' => 'Approved'],
                    ['revision' => '1.2', 'date' => '12 Apr 2024 10:15 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Penambahan diagram alir proses sertifikasi.', 'status' => 'Approved'],
                    ['revision' => '1.0', 'date' => '02 Jan 2024 09:00 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Rilis pertama modul panduan SJPH.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'AUD.HALAL',
                'title' => 'Auditor Halal',
                'program' => 'Sertifikasi & Auditor',
                'current_revision' => '3.0',
                'language' => 'Indonesia',
                'status' => 'Approved',
                'file_size' => '4.80 MB',
                'file_pages' => 48,
                'description' => 'Kurikulum standar kompetensi kerja auditor halal mencakup teknik pemeriksaan dokumen, audit lapangan, dan pelaporan.',
                'revisions' => [
                    ['revision' => '3.0', 'date' => '04 Jun 2024 10:12 WIB', 'author_name' => 'Mega Kusuma', 'note' => 'Pembaruan materi checklist bahan kritis.', 'status' => 'Approved'],
                    ['revision' => '2.0', 'date' => '18 Nov 2023 15:40 WIB', 'author_name' => 'Dewi Lestari', 'note' => 'Penambahan simulasi kasus audit pabrik skala besar.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'PPH.01',
                'title' => 'Pemeriksaan Bahan PPH',
                'program' => 'Teknis Laboratorium',
                'current_revision' => '1.2',
                'language' => 'Indonesia',
                'status' => 'Revisi',
                'file_size' => '1.95 MB',
                'file_pages' => 18,
                'description' => 'Tata cara pemeriksaan bahan baku, bahan tambahan, dan bahan penolong dalam Proses Produk Halal.',
                'revisions' => [
                    ['revision' => '1.2', 'date' => '02 Jun 2024 16:47 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Draft usulan revisi tabel titik kritis bahan hewani.', 'status' => 'Draft'],
                    ['revision' => '1.0', 'date' => '10 Feb 2024 11:20 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Rilis pertama.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'CPPOB.02',
                'title' => 'Cara Produksi Pangan Olahan yang Baik',
                'program' => 'Teknis Produksi',
                'current_revision' => '2.0',
                'language' => 'Indonesia',
                'status' => 'Approved',
                'file_size' => '2.70 MB',
                'file_pages' => 26,
                'description' => 'Pedoman industri pengolahan pangan untuk menghasilkan produk pangan yang aman, bermutu, dan layak dikonsumsi.',
                'revisions' => [
                    ['revision' => '2.0', 'date' => '30 Mei 2024 11:28 WIB', 'author_name' => 'Yusuf Setiawan', 'note' => 'Pembaruan panduan sanitasi peralatan pabrik.', 'status' => 'Approved'],
                    ['revision' => '1.0', 'date' => '15 Okt 2023 09:30 WIB', 'author_name' => 'Yusuf Setiawan', 'note' => 'Versi awal.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'TRACE.01',
                'title' => 'Traceability Rantai Pasok Halal',
                'program' => 'Supply Chain & Logistik',
                'current_revision' => '1.0',
                'language' => 'Indonesia',
                'status' => 'Revisi',
                'file_size' => '1.60 MB',
                'file_pages' => 15,
                'description' => 'Prinsip ketertelusuran produk dari bahan baku hingga produk sampai ke konsumen untuk menjamin integritas halal.',
                'revisions' => [
                    ['revision' => '1.0', 'date' => '28 Mei 2024 08:55 WIB', 'author_name' => 'Mega Kusuma', 'note' => 'Draft usulan modul baru ketertelusuran logistik.', 'status' => 'Draft'],
                ],
            ],
            [
                'code' => 'HALAL.AWARE',
                'title' => 'Halal Awareness',
                'program' => 'Pengembangan SDM',
                'current_revision' => '1.1',
                'language' => 'English',
                'status' => 'Approved',
                'file_size' => '1.40 MB',
                'file_pages' => 14,
                'description' => 'Basic introduction to halal and haram concepts for general staff and third-party contractors.',
                'revisions' => [
                    ['revision' => '1.1', 'date' => '24 Mei 2024 15:32 WIB', 'author_name' => 'Nita Fadilah', 'note' => 'English translation review & grammar adjustments.', 'status' => 'Approved'],
                    ['revision' => '1.0', 'date' => '01 Apr 2024 09:30 WIB', 'author_name' => 'Nita Fadilah', 'note' => 'First release.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'MGMT.RISK',
                'title' => 'Manajemen Risiko',
                'program' => 'Manajerial & Kepemimpinan',
                'current_revision' => '2.2',
                'language' => 'Indonesia',
                'status' => 'Arsip',
                'file_size' => '2.10 MB',
                'file_pages' => 22,
                'description' => 'Kerangka manajemen risiko perusahaan secara korporat, metode identifikasi risiko dan penyusunan risk register.',
                'revisions' => [
                    ['revision' => '2.2', 'date' => '22 Mei 2024 09:10 WIB', 'author_name' => 'Andi Pratama', 'note' => 'Modul diarsipkan karena digantikan oleh versi terintegrasi.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'SAMPL.01',
                'title' => 'Teknik Pengambilan Sampel',
                'program' => 'Teknis Laboratorium',
                'current_revision' => '1.0',
                'language' => 'Indonesia',
                'status' => 'Approved',
                'file_size' => '2.15 MB',
                'file_pages' => 20,
                'description' => 'Pedoman pengambilan contoh uji di lapangan guna menjaga validitas hasil pengujian laboratorium kimia dan mikrobiologi.',
                'revisions' => [
                    ['revision' => '1.0', 'date' => '20 Mei 2024 13:41 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Rilis pertama.', 'status' => 'Approved'],
                ],
            ],
            [
                'code' => 'LAB.SAFE',
                'title' => 'Keselamatan dan Kesehatan Kerja Laboratorium',
                'program' => 'K3 & Keamanan',
                'current_revision' => '1.3',
                'language' => 'Indonesia',
                'status' => 'Revisi',
                'file_size' => '2.50 MB',
                'file_pages' => 25,
                'description' => 'Pedoman keselamatan penggunaan bahan kimia berbahaya, penanganan kecelakaan kerja, dan penggunaan alat pelindung diri.',
                'revisions' => [
                    ['revision' => '1.3', 'date' => '18 Mei 2024 10:05 WIB', 'author_name' => 'Budi Santoso', 'note' => 'Penambahan panduan MSDS format GHS terbaru.', 'status' => 'Draft'],
                ],
            ],
        ];

        $translateDate = function ($dateStr) {
            $dateStr = str_replace(' WIB', '', $dateStr);
            $id = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            $en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return Carbon::parse(str_replace($id, $en, $dateStr));
        };

        foreach ($modulesData as $m) {
            $latestRevisionDate = null;

            // Find the latest revision date to set the module updated_at/created_at
            if (! empty($m['revisions'])) {
                $latestRev = $m['revisions'][0];
                $latestRevisionDate = $translateDate($latestRev['date']);
            }

            $module = Module::create([
                'code' => $m['code'],
                'title' => $m['title'],
                'program' => $m['program'],
                'current_revision' => $m['current_revision'],
                'language' => $m['language'],
                'status' => $m['status'],
                'file_size' => $m['file_size'],
                'file_pages' => $m['file_pages'],
                'description' => $m['description'],
                'created_by' => $admin->id,
                'created_at' => $latestRevisionDate ?? now(),
                'updated_at' => $latestRevisionDate ?? now(),
            ]);

            foreach ($m['revisions'] as $r) {
                $revDate = $translateDate($r['date']);
                ModuleRevision::create([
                    'module_id' => $module->id,
                    'revision' => $r['revision'],
                    'note' => $r['note'],
                    'author_name' => $r['author_name'],
                    'status' => $r['status'],
                    'file_size' => $m['file_size'], // seed same size
                    'file_pages' => $m['file_pages'], // seed same pages
                    'created_by' => $admin->id,
                    'created_at' => $revDate,
                    'updated_at' => $revDate,
                ]);
            }
        }
    }
}
