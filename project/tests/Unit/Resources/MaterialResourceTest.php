<?php

use App\Models\Material;
use App\Http\Resources\MaterialResource;
use App\Models\Sale;

it('formats material resource data correctly', function () {
    $material = Material::factory()->make(['id' => 1]);
    $resource = new MaterialResource($material);

    expect($resource->toArray(request()))->toMatchArray([
        'id' => 1,
        'designation' => $material->designation,
        'price'       => $material->price,
        'created_at' => $material->created_at,
        'updated_at' => $material->updated_at,
    ]);
});

it('includes pivot data when material is loaded through a sale', function () {
    $material = Material::factory()->create(['price' => 50.0]);
    $sale     = Sale::factory()->create();

    $sale->materials()->attach($material->id, [
        'original_price'      => 50.0,
        'discount_amount'     => 5.0,
        'discount_percentage' => 10.0,
        'final_price'         => 45.0,
        'promotion_id'        => null,
    ]);

    $sale->load('materials');
    $materialWithPivot = $sale->materials->first();
    $resource = new MaterialResource($materialWithPivot);
    $data     = $resource->toArray(request());

    expect($data)->toHaveKey('pivot');

    expect($data['pivot'])->toBe([
        'original_price'      => 50,
        'discount_amount'     => 5,
        'discount_percentage' => 10,
        'final_price'         => 45,
        'promotion_id'        => null,
    ]);
});

