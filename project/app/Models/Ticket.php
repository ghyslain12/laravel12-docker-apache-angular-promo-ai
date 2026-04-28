<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = ['titre', 'description', 'sale_id'];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
