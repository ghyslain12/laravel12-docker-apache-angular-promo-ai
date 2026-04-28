<?php

use App\Models\Sale;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Ticket;

it('creates a sale with basic data', function () {
    $sale = Sale::factory()->create(['titre' => 'Main Sale']);

    expect($sale->titre)->toBe('Main Sale');
    $this->assertDatabaseHas('sales', ['titre' => 'Main Sale']);
});

it('is associated with a customer', function () {
    $customer = Customer::factory()->create();
    $sale = Sale::factory()->create(['customer_id' => $customer->id]);

    expect($sale->customer)->toBeInstanceOf(Customer::class)
        ->and($sale->customer->id)->toBe($customer->id);
});

it('has many materials', function () {
    $sale = Sale::factory()->create();
    $materials = Material::factory()->count(2)->create();
    $sale->materials()->attach($materials);

    expect($sale->materials)->toHaveCount(2);
});

it('has many tickets', function () {
    $sale = Sale::factory()->create();
    Ticket::factory()->count(2)->create(['sale_id' => $sale->id]);

    expect($sale->fresh()->tickets)->toHaveCount(2);
});
