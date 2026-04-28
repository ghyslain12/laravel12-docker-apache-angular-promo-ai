<?php

use App\Models\Material;
use Illuminate\Support\Facades\Cache;


it('lists materials successfully', function () {
    $token = $this->getAuthToken();

    Material::factory()->count(3)->create();

    $response = $this->withToken($token)->getJson('/api/material');
    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJsonStructure([
            '*' => ['id', 'designation', 'price', 'created_at', 'updated_at'],
        ]);
});

it('fails to list materials without auth', function () {
    Material::factory()->count(3)->create();

    $response = $this->getJson('/api/material');

    $response->assertUnauthorized();
});

it('creates a new material', function () {
    $token = $this->getAuthToken();
    $data = ['designation' => 'MaterialTest', 'price' => 49.99];

    $response = $this->withToken($token)->postJson('/api/material', $data);

    $response->assertCreated()
        ->assertJsonFragment(['designation' => 'MaterialTest'])
        ->assertJsonStructure([
            'data' => ['id', 'designation', 'price', 'created_at', 'updated_at']
        ]);

    $this->assertDatabaseHas('materials', ['designation' => 'MaterialTest']);
});

it('fails to create material without price', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->postJson('/api/material', [
        'designation' => 'MaterialSansPrix',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('price');
});

it('fails to create material with invalid data', function () {
    $token = $this->getAuthToken();

    $data = [
        'designation' => '',
        'price'       => -5,
    ];

    $response = $this->withToken($token)->postJson('/api/material', $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['designation', 'price']);
});

it('shows a material successfully', function () {
    $token = $this->getAuthToken();

    $material = Material::factory()->create();

    $response = $this->withToken($token)->getJson("/api/material/{$material->id}");

    $response->assertOk()
        ->assertJsonFragment([
            'id'          => $material->id,
            'designation' => $material->designation,
        ])
        ->assertJsonStructure(['id', 'designation', 'price', 'created_at', 'updated_at']);
});

it('fails to show nonexistent material', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->getJson('/api/material/999');

    $response->assertNotFound();
});

it('updates a material successfully', function () {
    $token  = $this->getAuthToken();
    $material = Material::factory()->create();
    $data   = ['designation' => 'UpdatedMaterial', 'price' => 99.99];

    $response = $this->withToken($token)->putJson("/api/material/{$material->id}", $data);

    $response->assertOk()
        ->assertJsonFragment(['designation' => 'UpdatedMaterial'])
        ->assertJsonStructure([
            'data' => ['id', 'designation', 'price', 'created_at', 'updated_at']
        ]);
});

it('updates only price of a material', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create(['price' => 10.00]);

    $response = $this->withToken($token)->putJson("/api/material/{$material->id}", ['designation' => $material->designation, 'price' => 25.50]);

    $response->assertOk()->assertJsonFragment(['price' => '25.50']);
    $this->assertDatabaseHas('materials', ['id' => $material->id, 'price' => 25.50]);
});

it('deletes a material successfully', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create();

    $response = $this->withToken($token)->deleteJson("/api/material/{$material->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('materials', ['id' => $material->id]);
});

it('fails to delete nonexistent material', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->deleteJson('/api/material/999');

    $response->assertNotFound();
});

it('clears material cache when a material is updated', function () {
    $token    = $this->getAuthToken();
    $material = Material::factory()->create();
    Cache::put('materials_list', [$material]);

    $this->withToken($token)->putJson("/api/material/{$material->id}", [
        'designation' => 'Updated Material',
        'price'       => 15.00,
    ]);

    expect(Cache::has('materials_list'))->toBeFalse();
});

