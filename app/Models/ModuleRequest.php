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
     * Generate a new request number.
     */
    public static function generateRequestNumber(): string
    {
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
