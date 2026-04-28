<?php

namespace App\Observers;

use App\Models\Promotion;
use Illuminate\Support\Facades\Cache;

class PromotionObserver
{
    private function clearCache(): void
    {
        Cache::forget('promotions_list');
    }

    public function created(Promotion $promotion): void  { $this->clearCache(); }
    public function updated(Promotion $promotion): void  { $this->clearCache(); }
    public function deleted(Promotion $promotion): void  { $this->clearCache(); }
    public function restored(Promotion $promotion): void { $this->clearCache(); }
}
