<?php

namespace App\Observers;

use App\Models\Material;
use Illuminate\Support\Facades\Cache;

class MaterialObserver
{
    private function clearCache(): void
    {
        Cache::forget('materials_list');
    }

    public function created(Material $material): void { $this->clearCache(); }
    public function updated(Material $material): void { $this->clearCache(); }
    public function deleted(Material $material): void { $this->clearCache(); }
}
