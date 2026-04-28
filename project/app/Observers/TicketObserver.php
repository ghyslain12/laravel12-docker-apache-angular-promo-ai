<?php

namespace App\Observers;

use App\Models\Ticket;
use Illuminate\Support\Facades\Cache;

class TicketObserver
{
    private function clearCache(): void
    {
        Cache::forget('tickets_list');
    }

    public function created(Ticket $ticket): void { $this->clearCache(); }
    public function updated(Ticket $ticket): void { $this->clearCache(); }
    public function deleted(Ticket $ticket): void { $this->clearCache(); }
}
