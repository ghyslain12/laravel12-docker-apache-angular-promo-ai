<?php

namespace App\Observers;

use App\Models\Sale;
use Illuminate\Support\Facades\Cache;

class SaleObserver
{
    private function clearCache(): void
    {
        Cache::forget('sales_list');
    }

    public function created(Sale $sale): void { $this->clearCache(); }
    public function updated(Sale $sale): void {
        $this->clearCache();
    }
    public function deleted(Sale $sale): void { $this->clearCache(); }
}
