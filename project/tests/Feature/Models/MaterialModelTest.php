<?php

use App\Models\Material;
use App\Models\Sale;

it('creates a material with a designation', function () {
    $material = Material::factory()->create([
        'designation' => 'Monitor LG 27',
        'price' => 299.99
    ]);

    expect($material->designation)->toBe('Monitor LG 27');

    $this->assertDatabaseHas('materials', [
        'designation' => 'Monitor LG 27',
        'price'       => 299.99,
    ]);
});

it('has a many-to-many relationship with sales', function () {
    $material = Material::factory()->create();
    $sale = Sale::factory()->create();

    $material->sales()->attach($sale);

    expect($material->sales)
        ->toHaveCount(1)
        ->and($material->sales->first()->id)->toBe($sale->id);

    $this->assertDatabaseHas('material_sale', [
        'material_id' => $material->id,
        'sale_id' => $sale->id,
    ]);
});
