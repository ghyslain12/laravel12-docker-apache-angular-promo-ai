<?php

use App\Models\Material;
use App\Models\Promotion;

it('lists promotions successfully', function () {
    $token = $this->getAuthToken();
    Promotion::factory()->count(3)->create();

    $response = $this->withToken($token)->getJson('/api/promotion');

    $response->assertOk()
             ->assertJsonCount(3)
             ->assertJsonStructure([
                 '*' => ['id', 'name', 'type', 'value', 'target_type', 'active', 'status'],
             ]);
});

it('fails to list promotions without auth', function () {
    $response = $this->getJson('/api/promotion');
    $response->assertUnauthorized();
});

it('creates a global percentage promotion', function () {
    $token = $this->getAuthToken();

    $data = [
        'name'        => 'Promo globale',
        'type'        => 'percentage',
        'value'       => 10,
        'target_type' => 'all',
        'active'      => true,
    ];

    $response = $this->withToken($token)->postJson('/api/promotion', $data);

    $response->assertCreated()
        ->assertJsonFragment(['name' => 'Promo globale'])
        ->assertJsonPath('data.target_type', 'all');

    $this->assertDatabaseHas('promotions', ['name' => 'Promo globale', 'type' => 'percentage']);
});

it('creates a promotion targeting a specific material', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create();

    $data = [
        'name'        => 'Promo material',
        'type'        => 'percentage',
        'value'       => 15,
        'target_type' => 'material',
        'target_id'   => $material->id,
    ];

    $response = $this->withToken($token)->postJson('/api/promotion', $data);

    $response->assertCreated()
        ->assertJsonPath('data.target_id', $material->id);
});

it('creates a coupon promotion', function () {
    $token = $this->getAuthToken();

    $data = [
        'name'        => 'Coupon test',
        'type'        => 'percentage',
        'value'       => 20,
        'target_type' => 'coupon',
        'code'        => 'TESTCODE',
        'ends_at'     => now()->addMonth()->toDateTimeString(),
    ];

    $response = $this->withToken($token)->postJson('/api/promotion', $data);

    $response->assertCreated()
        ->assertJsonPath('data.code', 'TESTCODE');

    $this->assertDatabaseHas('promotions', ['code' => 'TESTCODE']);
});

it('fails to create promotion with invalid data', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->postJson('/api/promotion', [
        'name'        => '',
        'type'        => 'invalid_type',
        'value'       => -5,
        'target_type' => 'unknown',
    ]);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors(['name', 'type', 'value', 'target_type']);
});

it('fails to create material promotion without target_id', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->postJson('/api/promotion', [
        'name'        => 'Sans cible',
        'type'        => 'percentage',
        'value'       => 10,
        'target_type' => 'material',
    ]);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors('target_id');
});

it('shows a promotion', function () {
    $token     = $this->getAuthToken();
    $promotion = Promotion::factory()->create();

    $response = $this->withToken($token)->getJson("/api/promotion/{$promotion->id}");

    $response->assertOk()
             ->assertJsonPath('id', $promotion->id);
});

it('fails to show nonexistent promotion', function () {
    $token = $this->getAuthToken();

    $this->withToken($token)->getJson('/api/promotion/999')->assertNotFound();
});

it('updates a promotion successfully', function () {
    $token     = $this->getAuthToken();
    $promotion = Promotion::factory()->create(['name' => 'Ancienne promo']);

    $response = $this->withToken($token)->putJson("/api/promotion/{$promotion->id}", [
        'name' => 'Promo mise à jour',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Promo mise à jour');

    $this->assertDatabaseHas('promotions', ['name' => 'Promo mise à jour']);
});

it('deletes a promotion', function () {
    $token     = $this->getAuthToken();
    $promotion = Promotion::factory()->create();

    $response = $this->withToken($token)->deleteJson("/api/promotion/{$promotion->id}");

    $response->assertNoContent();
    $this->assertSoftDeleted('promotions', ['id' => $promotion->id]);
});

it('validates a valid coupon code', function () {
    $token     = $this->getAuthToken();
    $promotion = Promotion::factory()->coupon()->create(['code' => 'VALID10']);

    $response = $this->withToken($token)->postJson('/api/promotion/validate-coupon', [
        'code' => 'VALID10',
    ]);

    $response->assertOk()
             ->assertJsonPath('valid', true)
             ->assertJsonPath('promotion.code', 'VALID10');
});

it('rejects an expired coupon', function () {
    $token = $this->getAuthToken();
    Promotion::factory()->coupon()->expired()->create(['code' => 'EXPIRED']);

    $response = $this->withToken($token)->postJson('/api/promotion/validate-coupon', [
        'code' => 'EXPIRED',
    ]);

    $response->assertUnprocessable()
             ->assertJsonPath('valid', false)
             ->assertJsonPath('error_code', 'COUPON_EXPIRED');
});

it('rejects an inactive coupon', function () {
    $token = $this->getAuthToken();
    Promotion::factory()->coupon()->inactive()->create(['code' => 'DISABLED']);

    $response = $this->withToken($token)->postJson('/api/promotion/validate-coupon', [
        'code' => 'DISABLED',
    ]);

    $response->assertUnprocessable()
             ->assertJsonPath('error_code', 'COUPON_INACTIVE');
});

it('rejects a nonexistent coupon', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->postJson('/api/promotion/validate-coupon', [
        'code' => 'NONEXISTENT',
    ]);

    $response->assertUnprocessable()
             ->assertJsonPath('error_code', 'COUPON_NOT_FOUND');
});

it('validates coupon with material preview', function () {
    $token     = $this->getAuthToken();
    $material  = Material::factory()->create(['price' => 100.00]);
    $promotion = Promotion::factory()->coupon()->percentage(20)->create(['code' => 'PROMO20']);

    $response = $this->withToken($token)->postJson('/api/promotion/validate-coupon', [
        'code'        => 'PROMO20',
        'material_id' => $material->id,
    ]);

    $response->assertOk()
             ->assertJsonPath('valid', true)
             ->assertJsonPath('preview.original_price', 100)
             ->assertJsonPath('preview.discount_amount', 20)
             ->assertJsonPath('preview.final_price', 80);
});

it('returns best promotion for a material', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create(['price' => 200.00]);

    Promotion::factory()->forMaterial($material)->percentage(15)->create(['priority' => 2]);

    $response = $this->withToken($token)->getJson("/api/material/{$material->id}/promotion");

    $response->assertOk()
             ->assertJsonPath('promotion.target_type', 'material')
             ->assertJsonPath('preview.final_price', 170);
});

it('returns null when no promotion applies to a material', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create();

    $response = $this->withToken($token)->getJson("/api/material/{$material->id}/promotion");

    $response->assertOk()
             ->assertJsonPath('promotion', null);
});

it('promotion scope active returns only active and in-date promotions', function () {
    Promotion::factory()->create(['active' => true]);
    Promotion::factory()->inactive()->create();
    Promotion::factory()->expired()->create();

    expect(Promotion::active()->count())->toBe(1);
});

it('promotion status accessor returns correct value', function () {
    $active    = Promotion::factory()->create(['active' => true]);
    $disabled  = Promotion::factory()->inactive()->create();
    $expired   = Promotion::factory()->expired()->create(['active' => true]);
    $scheduled = Promotion::factory()->scheduled()->create(['active' => true]);

    expect($active->status)->toBe('active')
        ->and($disabled->status)->toBe('disabled')
        ->and($expired->status)->toBe('expired')
        ->and($scheduled->status)->toBe('scheduled');
});

it('discount_label accessor formats correctly', function () {
    $pct   = Promotion::factory()->percentage(20)->create();
    $fixed = Promotion::factory()->fixedAmount(15)->create();

    expect($pct->discount_label)->toBe('-20.00%')
        ->and($fixed->discount_label)->toBe('-15.00€');
});
