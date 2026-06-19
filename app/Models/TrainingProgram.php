<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingProgram extends Model
{
    protected $fillable = [
        'code',
        'name',
        'revision_code',
        'effective_date',
        'status',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'file_pages',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
        ];
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(TrainingProgramRevision::class)->orderBy('id', 'desc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateCode(string $name, array $existingCodes = []): string
    {
        $words = array_filter(explode(' ', strtoupper($name)));
        $acronym = implode('', array_map(fn ($w) => $w[0], $words));
        $acronym = preg_replace('/[^A-Z0-9]/', '', $acronym) ?: 'PRG';
        $year = now()->year;

        $base = "PGT-{$acronym}-{$year}";
        $counter = 1;
        $code = $base;

        while (in_array($code, $existingCodes) || static::where('code', $code)->exists()) {
            $code = $base.'-'.$counter;
            $counter++;
        }

        return $code;
    }
}
