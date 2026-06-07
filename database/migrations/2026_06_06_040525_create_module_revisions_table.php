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
        Schema::create('module_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->string('revision');                    // e.g. 1.0, 1.1, 2.0
            $table->text('note')->nullable();              // catatan perubahan
            $table->text('reason')->nullable();            // alasan revisi
            $table->string('author_name');
            $table->string('status')->default('Approved'); // Approved, Pending, Rejected
            // File
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->integer('file_pages')->default(1);
            // Google Drive (opsional/fallback)
            $table->string('drive_file_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_revisions');
    }
};
