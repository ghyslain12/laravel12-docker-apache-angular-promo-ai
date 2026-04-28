<?php

namespace App\Actions\Promotion;

use App\Models\Promotion;

class CalculateDiscountAction
{
    public function execute(float $originalPrice, ?Promotion $promotion): array
    {
        if (!$promotion) {
            return [
                'original_price'      => $originalPrice,
                'discount_amount'     => 0,
                'discount_percentage' => 0,
                'final_price'         => $originalPrice,
                'promotion_id'        => null,
            ];
        }

        $discountAmount     = 0;
        $discountPercentage = 0;

        if ($promotion->type === 'percentage') {
            $discountPercentage = (float) $promotion->value;
            $discountAmount     = round($originalPrice * ($discountPercentage / 100), 2);
        } elseif ($promotion->type === 'fixed_amount') {
            $discountAmount     = min((float) $promotion->value, $originalPrice);
            $discountPercentage = $originalPrice > 0
                ? round(($discountAmount / $originalPrice) * 100, 2)
                : 0;
        }

        $finalPrice = max(0, round($originalPrice - $discountAmount, 2));

        return [
            'original_price'      => $originalPrice,
            'discount_amount'     => $discountAmount,
            'discount_percentage' => $discountPercentage,
            'final_price'         => $finalPrice,
            'promotion_id'        => $promotion->id,
        ];
    }
}
