<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserObserver
{
    private function clearCache(): void
    {
        Cache::forget('users_list');
    }

    public function created(User $user): void { $this->clearCache(); }
    public function updated(User $user): void { $this->clearCache(); }
    public function deleted(User $user): void { $this->clearCache(); }
}
