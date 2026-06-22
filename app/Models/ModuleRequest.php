<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class ModuleRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'request_number',
        'type',
        'title',
        'applicant_id',
        'unit',
        'description',
        'deadline',
        'status',
        'priority',
        'related_module_id',
        'program',
        'language',
        'training_days',
        'revision_reason',
        'file_path',
        'file_name',
        'file_size',
        'file_mime',
        'reject_reason',
        'processed_by',
        'processed_at',

        // Kebutuhan Khusus fields
        'jenis_kebutuhan',
        'nama_instansi',
        'judul_program',
        'jam_khusus',
        'pre_post_test',
        'keterangan_kebutuhan',

        // Processing fields
        'link_modul',
        'tanggal_realisasi',
        'tanggal_kebutuhan_baru',

        // Perubahan Modul row-based fields
        'jenis_modul',
        'modul_rows',
        'program_rows',
        'approved_by',
        'approved_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'processed_at' => 'datetime',
            'tanggal_realisasi' => 'date',
            'tanggal_kebutuhan_baru' => 'date',
        ];
    }

    /**
     * Get the user who submitted this request.
     */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    /**
     * Get the related module (for revision requests).
     */
    public function relatedModule(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'related_module_id');
    }

    /**
     * Get the user who processed this request.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Convert month to Roman numerals.
     */
    private static function romanMonth(int $month): string
    {
        $map = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        return $map[$month] ?? '';
    }

    /**
     * Generate a unique request number inside a DB transaction with row-level lock
     * to prevent duplicate numbers under concurrent requests.
     */
    public static function generateRequestNumber(string $type = 'Modul Baru'): string
    {
        return DB::transaction(function () use ($type) {
            if ($type === 'Kebutuhan Khusus') {
                $year = now()->year;
                $month = str_pad(now()->month, 2, '0', STR_PAD_LEFT);

                $lastRequest = static::where('type', 'Kebutuhan Khusus')
                    ->where('request_number', 'like', "%/Modul Khusus/PD/%/{$year}")
                    ->lockForUpdate()
                    ->orderByDesc('id')
                    ->first();

                $newNumber = 1;
                if ($lastRequest) {
                    $parts = explode('/', $lastRequest->request_number);
                    $newNumber = (int) $parts[0] + 1;
                }

                return str_pad($newNumber, 3, '0', STR_PAD_LEFT)."/Modul Khusus/PD/{$month}/{$year}";
            }

            $year = now()->year;
            $romanMonth = self::romanMonth(now()->month);

            $lastRequest = static::whereIn('type', ['Modul Baru', 'Revisi Modul'])
                ->where('request_number', 'like', "%/Modul/PD/%/{$year}")
                ->lockForUpdate()
                ->orderByDesc('id')
                ->first();

            $newNumber = 1;
            if ($lastRequest) {
                $parts = explode('/', $lastRequest->request_number);
                $newNumber = (int) $parts[0] + 1;
            }

            return str_pad($newNumber, 3, '0', STR_PAD_LEFT)."/Modul/PD/{$romanMonth}/{$year}";
        });
    }
}
