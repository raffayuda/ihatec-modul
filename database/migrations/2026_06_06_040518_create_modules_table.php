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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();              // e.g. PMD-2026-001
            $table->string('title');
            $table->string('program');                     // program/kategori pelatihan
            $table->string('language')->default('Indonesia');
            $table->text('description')->nullable();
            $table->string('status')->default('Approved'); // Approved, Revisi, Arsip
            $table->string('current_revision')->default('1.0');
            // File storage (local public disk)
            $table->string('file_path')->nullable();       // path di storage/app/public
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->integer('file_pages')->default(1);
            // Google Drive (opsional/fallback)
            $table->string('drive_file_id')->nullable();
            // Approval metadata
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            // Source request (linked to module_request that created this)
            $table->unsignedBigInteger('source_request_id')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
