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
        Schema::create('training_program_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_program_id')->constrained('training_programs')->cascadeOnDelete();
            $table->string('revision_code');
            $table->date('effective_date')->nullable();
            $table->text('note')->nullable();
            $table->string('author_name')->nullable();
            $table->string('status')->default('Aktif');
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->integer('file_pages')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_program_revisions');
    }
};
