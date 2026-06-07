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
        Schema::create('module_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique(); // PMD-2024-0001
            $table->string('type'); // Modul Baru, Revisi Modul, Kebutuhan Khusus
            $table->string('title');
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->string('unit')->nullable();
            $table->text('description')->nullable();
            $table->date('deadline')->nullable();
            $table->string('status')->default('Baru'); // Baru, Drafting, Menunggu Approval, Selesai, Ditolak
            $table->string('priority')->default('Medium'); // High, Medium, Low
            $table->foreignId('related_module_id')->nullable()->constrained('modules')->nullOnDelete();

            // New fields from diagram
            $table->string('program')->nullable(); // Jenis Pelatihan
            $table->string('language')->default('Indonesia'); // Bahasa Pelatihan
            $table->integer('training_days')->nullable(); // Jumlah Hari Pelatihan
            $table->text('revision_reason')->nullable(); // Alasan Perubahan

            // File attachment
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // bytes
            $table->string('file_mime')->nullable();
            // Approval
            $table->text('reject_reason')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_requests');
    }
};
