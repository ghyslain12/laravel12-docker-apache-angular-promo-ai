<?php

use App\Models\Sale;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Ticket;
use App\Http\Resources\SaleResource;

it('formats sale resource data and handles relationships', function () {
    $sale = Sale::factory()->create();
    $sale->load(['customer', 'materials', 'tickets']);

    $resource = new SaleResource($sale);
    $data = $resource->toArray(request());

    expect($data)->toHaveKeys(['id', 'customer', 'materials', 'tickets']);
    expect($data['customer'])->not->toBeNull();
});

it('does not include relationships when not loaded', function () {
    $sale = Sale::factory()->create();

    $resource = new SaleResource($sale);
    $data = json_decode($resource->toJson(), true);

    expect($data)->not->toHaveKey('customer')
        ->and($data)->not->toHaveKey('materials')
        ->and($data)->not->toHaveKey('tickets');
});
