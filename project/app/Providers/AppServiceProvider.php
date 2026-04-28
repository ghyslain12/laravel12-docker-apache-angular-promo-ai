<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Material;
use App\Models\Promotion;
use App\Models\Sale;
use App\Models\Ticket;
use App\Models\User;
use App\Observers\CustomerObserver;
use App\Observers\MaterialObserver;
use App\Observers\PromotionObserver;
use App\Observers\SaleObserver;
use App\Observers\TicketObserver;
use App\Observers\UserObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Material::observe(MaterialObserver::class);
        Customer::observe(CustomerObserver::class);
        Sale::observe(SaleObserver::class);
        Ticket::observe(TicketObserver::class);
        User::observe(UserObserver::class);
        Promotion::observe(PromotionObserver::class);
    }
}
