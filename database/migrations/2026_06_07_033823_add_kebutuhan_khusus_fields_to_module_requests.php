<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('module_requests', function (Blueprint $table) {
            $table->string('jenis_kebutuhan')->nullable();
            $table->string('nama_instansi')->nullable();
            $table->string('judul_program')->nullable();
            $table->text('jam_khusus')->nullable();
            $table->string('pre_post_test')->nullable();
            $table->text('keterangan_kebutuhan')->nullable();
            
            // Processing fields for custom request by Admin
            $table->string('link_modul')->nullable();
            $table->date('tanggal_realisasi')->nullable();
            $table->date('tanggal_kebutuhan_baru')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('module_requests', function (Blueprint $table) {
            $table->dropColumn([
                'jenis_kebutuhan',
                'nama_instansi',
                'judul_program',
                'jam_khusus',
                'pre_post_test',
                'keterangan_kebutuhan',
                'link_modul',
                'tanggal_realisasi',
                'tanggal_kebutuhan_baru',
            ]);
        });
    }
};
