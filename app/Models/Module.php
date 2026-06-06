<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'drive_file_id',
        'file_size',
        'file_pages',
        'created_by',
    ];

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
}
