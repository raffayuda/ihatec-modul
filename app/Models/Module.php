<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Module extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'title',
        'program',
        'language',
        'description',
        'status',
        'current_revision',
        'file_path',
        'file_name',
        'file_size',
        'file_pages',
        'drive_file_id',
        'approved_by',
        'approved_at',
        'source_request_id',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the public URL of the file.
     */
    public function getFileUrlAttribute(): ?string
    {
        if ($this->file_path) {
            return Storage::url($this->file_path);
        }

        return null;
    }

    /**
     * Generate a module code from a request number.
     * e.g. PMD-2026-0001 -> MOD-2026-001
     */
    public static function generateCode(): string
    {
        $year = now()->year;
        $prefix = "MOD-{$year}-";
        $last = static::where('code', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->first();

        $number = $last
            ? (int) substr($last->code, -3) + 1
            : 1;

        return $prefix.str_pad($number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Increment revision code: 1.0 -> 1.1 -> 1.2 -> ...
     */
    public static function incrementRevision(string $current): string
    {
        if ($current === '0.0' || $current === '00' || $current === '0') {
            return '1.0';
        }

        [$major, $minor] = explode('.', $current.'.0');

        return $major.'.'.((int) $minor + 1);
    }

    /**
     * Get the revisions for the module.
     *
     * @return HasMany<ModuleRevision, $this>
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(ModuleRevision::class)->orderBy('id', 'desc');
    }

    /**
     * Get the user who created the module.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved the module.
     *
     * @return BelongsTo<User, $this>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the source module request.
     *
     * @return BelongsTo<ModuleRequest, $this>
     */
    public function sourceRequest(): BelongsTo
    {
        return $this->belongsTo(ModuleRequest::class, 'source_request_id');
    }
}
