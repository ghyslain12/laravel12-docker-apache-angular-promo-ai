<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['designation', 'price'];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function sales(): BelongsToMany
    {
        return $this->belongsToMany(Sale::class, 'material_sale')
            ->withPivot([
                'original_price',
                'discount_amount',
                'discount_percentage',
                'final_price',
                'promotion_id',
            ]);
    }

    public function activePromotion()
    {
        return $this->hasOne(Promotion::class, 'target_id')
            ->active()
            ->orderByDesc('priority');
    }
}
