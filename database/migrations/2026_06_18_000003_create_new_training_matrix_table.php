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
        Schema::dropIfExists('training_matrix');

        Schema::create('training_matrix', function (Blueprint $table) {
            $table->id();
            $table->string('kode');
            $table->string('nama_pelatihan');
            $table->string('link_modul')->nullable();
            $table->string('master_sa')->nullable();
            $table->string('master_sertifikat_name')->nullable();
            $table->string('master_sertifikat_path')->nullable();
            $table->string('tipe_pelatihan')->nullable();
            $table->string('jenis_sertifikat')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('pic_periksa_lk')->nullable();
            $table->string('tipe_sertifikat_sihalal')->nullable();
            $table->bigInteger('harga_dasar_tte')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_matrix');
    }
};
