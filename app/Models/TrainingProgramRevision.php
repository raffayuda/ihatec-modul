<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingProgramRevision extends Model
{
    protected $fillable = [
        'training_program_id',
        'revision_code',
        'effective_date',
        'note',
        'author_name',
        'status',
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

    public function trainingProgram(): BelongsTo
    {
        return $this->belongsTo(TrainingProgram::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
