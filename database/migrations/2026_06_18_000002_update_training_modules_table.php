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
        Schema::table('training_modules', function (Blueprint $table) {
            $table->string('training_code')->after('id');
            $table->foreignId('module_id')->after('training_code')->constrained('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_modules', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropColumn(['training_code', 'module_id']);
        });
    }
};
