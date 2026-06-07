<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];
        return $map[$month] ?? '';
    }

    /**
     * Generate a new request number based on type.
     */
    public static function generateRequestNumber(string $type = 'Modul Baru'): string
    {
        if ($type === 'Kebutuhan Khusus') {
            $year = now()->year;
            $romanMonth = self::romanMonth(now()->month);
            
            $lastRequest = static::where('type', 'Kebutuhan Khusus')
                ->where('request_number', 'like', "%/Modul Khusus/PD/%/{$year}")
                ->orderByDesc('id')
                ->first();
                
            if ($lastRequest) {
                $parts = explode('/', $lastRequest->request_number);
                $lastNumber = (int) $parts[0];
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }
            
            return str_pad($newNumber, 3, '0', STR_PAD_LEFT) . "/Modul Khusus/PD/{$romanMonth}/{$year}";
        }

        $year = now()->year;
        $prefix = "PMD-{$year}-";
        $lastRequest = static::where('request_number', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) substr($lastRequest->request_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix.str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
