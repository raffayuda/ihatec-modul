<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add perubahan-modul specific columns to module_requests table.
     * - jenis_modul      : JSON array of selected jenis modul checkboxes
     * - modul_rows       : JSON array of modul detail rows (Modul, Lembar Kerja, Post Test)
     * - program_rows     : JSON array of program detail rows
     * - approved_by      : name of the approver
     * - approved_at      : timestamp of approval
     */
    public function up(): void
    {
        Schema::table('module_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('module_requests', 'jenis_modul')) {
                $table->json('jenis_modul')->nullable()->after('language');
            }
            if (! Schema::hasColumn('module_requests', 'modul_rows')) {
                $table->json('modul_rows')->nullable()->after('jenis_modul');
            }
            if (! Schema::hasColumn('module_requests', 'program_rows')) {
                $table->json('program_rows')->nullable()->after('modul_rows');
            }
            if (! Schema::hasColumn('module_requests', 'approved_by')) {
                $table->string('approved_by')->nullable()->after('reject_reason');
            }
            if (! Schema::hasColumn('module_requests', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('module_requests', function (Blueprint $table) {
            $table->dropColumnIfExists('jenis_modul');
            $table->dropColumnIfExists('modul_rows');
            $table->dropColumnIfExists('program_rows');
            $table->dropColumnIfExists('approved_by');
            $table->dropColumnIfExists('approved_at');
        });
    }
};
