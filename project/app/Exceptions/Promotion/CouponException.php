<?php

namespace App\Exceptions\Promotion;

use Exception;

class CouponException extends Exception
{
    public function __construct(
        private readonly string $errorCode,
        string $message
    ) {
        parent::__construct($message);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public static function notFound(): self
    {
        return new self('COUPON_NOT_FOUND', "Ce code promo n'existe pas.");
    }

    public static function inactive(): self
    {
        return new self('COUPON_INACTIVE', 'Ce code promo est désactivé.');
    }

    public static function notStarted(): self
    {
        return new self('COUPON_NOT_STARTED', "Ce code promo n'est pas encore actif.");
    }

    public static function expired(): self
    {
        return new self('COUPON_EXPIRED', 'Ce code promo a expiré.');
    }

    public static function notApplicable(): self
    {
        return new self('COUPON_NOT_APPLICABLE', "Ce code promo ne s'applique pas à ce matériau.");
    }
}
