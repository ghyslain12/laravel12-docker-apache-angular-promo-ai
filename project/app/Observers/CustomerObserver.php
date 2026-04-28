<?php

namespace App\Observers;

use App\Models\Customer;
use Illuminate\Support\Facades\Cache;

class CustomerObserver
{
    private function clearCache(): void
    {
        Cache::forget('customers_list');
    }

    public function created(Customer $customer): void { $this->clearCache(); }
    public function updated(Customer $customer): void { $this->clearCache(); }
    public function deleted(Customer $customer): void { $this->clearCache(); }
}
