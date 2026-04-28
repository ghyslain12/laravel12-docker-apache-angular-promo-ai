<?php

use App\Models\Material;
use App\Models\Sale;
use App\Models\Customer;
use Illuminate\Support\Facades\Cache;


it('lists sales successfully', function () {
    $token = $this->getAuthToken();

    Sale::factory()->count(3)->create();

    $response = $this->withToken($token)->getJson('/api/sale');

    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJsonStructure([
            '*' => ['id', 'titre', 'description', 'customer_id', 'created_at', 'updated_at'],
        ]);
});

it('fails to list sales without auth', function () {
    Sale::factory()->count(3)->create();

    $response = $this->getJson('/api/sale');

    $response->assertUnauthorized();
});

it('creates a new sale', function () {
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();

    $data = [
        'titre'       => 'SaleTest',
        'description' => 'DescriptionTest',
        'customer_id' => $customer->id,
    ];

    $response = $this->withToken($token)->postJson('/api/sale', $data);

    $response->assertCreated()
        ->assertJsonFragment(['titre' => 'SaleTest'])
        ->assertJsonStructure([
            'data' => ['id', 'titre', 'description', 'customer_id', 'created_at', 'updated_at']
        ]);

    $this->assertDatabaseHas('sales', ['titre' => 'SaleTest']);
});

it('creates a sale with materials and stores pivot prices', function () {
    $token     = $this->getAuthToken();
    $customer  = Customer::factory()->create();
    $materials = Material::factory()->count(2)->create(['price' => 50.00]);

    $data = [
        'titre'       => 'Vente avec matériaux',
        'description' => 'Test pivot',
        'customer_id' => $customer->id,
        'materials'   => $materials->pluck('id')->toArray(),
    ];

    $response = $this->withToken($token)->postJson('/api/sale', $data);

    $response->assertCreated();

    foreach ($materials as $m) {
        $this->assertDatabaseHas('material_sale', [
            'sale_id'        => $response->json('data.id'),
            'material_id'    => $m->id,
            'original_price' => 50.00,
            'final_price'    => 50.00,
        ]);
    }
});

it('fails to create sale with invalid data', function () {
    $token = $this->getAuthToken();

    $data = [
        'titre'       => '',
        'customer_id' => 999,
    ];

    $response = $this->withToken($token)->postJson('/api/sale', $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['titre', 'customer_id']);
});

it('shows a sale successfully', function () {
    $token = $this->getAuthToken();
    $sale  = Sale::factory()->create();

    $response = $this->withToken($token)->getJson("/api/sale/{$sale->id}");

    $response->assertOk()
        ->assertJsonFragment([
            'id'          => $sale->id,
            'titre'       => $sale->titre,
            'customer_id' => $sale->customer_id,
        ])
        ->assertJsonStructure(['id', 'titre', 'description', 'customer_id', 'created_at', 'updated_at']);
});

it('fails to show nonexistent sale', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->getJson('/api/sale/999');

    $response->assertNotFound();
});

it('updates a sale successfully', function () {
    $token    = $this->getAuthToken();
    $sale     = Sale::factory()->create();
    $customer = Customer::factory()->create();

    $data = [
        'titre'       => 'UpdatedSale',
        'description' => 'UpdatedDescription',
        'customer_id' => $customer->id,
    ];

    $response = $this->withToken($token)->putJson("/api/sale/{$sale->id}", $data);

    $response->assertOk()
        ->assertJsonFragment(['titre' => 'UpdatedSale'])
        ->assertJsonStructure([
            'id', 'titre', 'description', 'customer_id', 'created_at', 'updated_at', 'customer', 'materials', 'tickets'
        ]);
});

it('updates materials of a sale and recalculates pivot prices', function () {
    $token     = $this->getAuthToken();
    $sale      = Sale::factory()->create();
    $materials = Material::factory()->count(3)->create(['price' => 20.00]);

    $sale->materials()->attach($materials->take(2)->pluck('id')->toArray(), [
        'original_price' => 20.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 20.00,
    ]);

    $response = $this->withToken($token)->putJson("/api/sale/{$sale->id}", [
        'titre'       => $sale->titre,
        'description' => $sale->description,
        'customer_id' => $sale->customer_id,
        'materials'   => [$materials->last()->id],
    ]);

    $response->assertOk();
    expect($sale->fresh()->materials)->toHaveCount(1);
});

it('deletes a sale successfully', function () {
    $token = $this->getAuthToken();
    $sale  = Sale::factory()->create();

    $response = $this->withToken($token)->deleteJson("/api/sale/{$sale->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('sales', ['id' => $sale->id]);
});

it('fails to delete nonexistent sale', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->deleteJson('/api/sale/999');

    $response->assertNotFound();
});

it('clears sale cache when a sale is deleted', function () {
    $token = $this->getAuthToken();
    $sale  = Sale::factory()->create();
    Cache::put('sales_list', [$sale]);

    $this->withToken($token)->deleteJson("/api/sale/{$sale->id}");

    expect(Cache::has('sales_list'))->toBeFalse();
});

it('clears sale cache when a sale is updated', function () {
    $token    = $this->getAuthToken();
    $sale     = Sale::factory()->create(['titre' => 'Ancien Titre']);
    $customer = Customer::factory()->create();

    Cache::put('sales_list', [$sale->toArray()]);
    expect(Cache::has('sales_list'))->toBeTrue();

    $response = $this->withToken($token)->putJson("/api/sale/{$sale->id}", [
        'titre'       => 'Nouveau Titre',
        'description' => 'Nouvelle Description',
        'customer_id' => $customer->id,
    ]);

    $response->assertOk();
    expect(Cache::has('sales_list'))->toBeFalse();
});

it('returns fresh data from index after an update invalidates the cache', function () {
    $token     = $this->getAuthToken();
    $sale      = Sale::factory()->create();
    $materials = Material::factory()->count(2)->create(['price' => 30.00]);

    $sale->materials()->attach($materials->pluck('id')->toArray(), [
        'original_price' => 30.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 30.00,
    ]);

    $this->withToken($token)->getJson('/api/sale');
    expect(Cache::has('sales_list'))->toBeTrue();

    $this->withToken($token)->putJson("/api/sale/{$sale->id}", [
        'titre'       => 'Titre mis à jour',
        'description' => $sale->description,
        'customer_id' => $sale->customer_id,
        'materials'   => [$materials->first()->id],
    ])->assertOk();

    expect(Cache::has('sales_list'))->toBeFalse();

    $response = $this->withToken($token)->getJson('/api/sale');
    $updatedSaleInList = collect($response->json())->firstWhere('id', $sale->id);

    expect($updatedSaleInList['materials'])->toHaveCount(1)
        ->and($updatedSaleInList['materials'][0]['id'])->toBe($materials->first()->id);
});
