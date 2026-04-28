<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "designation" => $this->designation,
            'price' => $this->price,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            'pivot' => $this->when(
                $this->pivot !== null,
                fn() => [
                    'original_price'      => $this->pivot?->original_price,
                    'discount_amount'     => $this->pivot?->discount_amount,
                    'discount_percentage' => $this->pivot?->discount_percentage,
                    'final_price'         => $this->pivot?->final_price,
                    'promotion_id'        => $this->pivot?->promotion_id,
                ]
            ),
        ];
    }
}
