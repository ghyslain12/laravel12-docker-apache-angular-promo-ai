<?php

namespace App\Actions\Promotion;

use App\Exceptions\Promotion\CouponException;
use App\Models\Material;
use App\Models\Promotion;

class ValidateCouponAction
{
    public function execute(string $code, ?Material $material = null): Promotion
    {
        $promo = Promotion::withTrashed()
            ->where('code', strtoupper(trim($code)))
            ->first();

        if (!$promo || $promo->trashed()) {
            throw CouponException::notFound();
        }

        if (!$promo->active) {
            throw CouponException::inactive();
        }

        if ($promo->starts_at && $promo->starts_at->isFuture()) {
            throw CouponException::notStarted();
        }

        if ($promo->ends_at && $promo->ends_at->isPast()) {
            throw CouponException::expired();
        }

        if ($promo->target_id !== null && $material && $promo->target_id !== $material->id) {
            throw CouponException::notApplicable();
        }

        return $promo;
    }
}
