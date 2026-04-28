<?php

namespace App\Actions\Promotion;

use App\Exceptions\Promotion\CouponException;
use App\Models\Material;
use App\Models\Promotion;

class FindBestPromotionAction
{
    public function __construct(
        private readonly ValidateCouponAction $validateCoupon
    ) {}

    public function execute(Material $material, ?string $couponCode = null): ?Promotion
    {
        try {
            if ($couponCode && $prom = $this->validateCoupon->execute($couponCode, $material)) {
                return $prom;
            }
        } catch (CouponException $ex) {
            if ($ex->getErrorCode() !== "COUPON_NOT_FOUND") {
                throw $ex;
            }
        }

        $materialPromo = Promotion::active()
            ->where('target_type', 'material')
            ->where('target_id', $material->id)
            ->orderByDesc('priority')
            ->first();

        $globalPromo = Promotion::active()
            ->where('target_type', 'all')
            ->orderByDesc('priority')
            ->first();

        return $this->pickHighestPriority($materialPromo, $globalPromo);
    }

    private function pickHighestPriority(?Promotion $a, ?Promotion $b): ?Promotion
    {
        if (!$a) return $b;
        if (!$b) return $a;

        if ($a->priority > $b->priority) return $a;
        if ($b->priority > $a->priority) return $b;

        return $a->target_type === 'material' ? $a : $b;
    }
}
