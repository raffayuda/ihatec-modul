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
        Schema::create('training_matrix', function (Blueprint $table) {
            $table->id();
            $table->string('unit');
            $table->string('program');
            $table->unsignedBigInteger('module_id')->nullable();
            $table->string('module_code')->nullable();
            $table->string('module_title')->nullable();
            $table->string('matrix_type')->default('Wajib'); // Wajib, Opsional
            $table->boolean('is_required')->default(true);
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
