<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'type',
        'value',
        'target_type',
        'target_id',
        'starts_at',
        'ends_at',
        'priority',
        'active',
    ];

    protected $casts = [
        'value'              => 'decimal:2',
        'starts_at'          => 'datetime',
        'ends_at'            => 'datetime',
        'active'             => 'boolean',
        'priority'           => 'integer',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'target_id');
    }

    public function scopeActive($query)
    {
        return $query
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function getStatusAttribute(): string
    {
        if (!$this->active) {
            return 'disabled';
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'scheduled';
        }
        if ($this->ends_at && $this->ends_at->isPast()) {
            return 'expired';
        }
        return 'active';
    }

    public function getDiscountLabelAttribute(): string
    {
        return $this->type === 'percentage'
            ? "-{$this->value}%"
            : "-{$this->value}€";
    }
}
