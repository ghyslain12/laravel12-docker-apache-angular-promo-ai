<?php

use App\Models\Customer;
use App\Models\User;
use App\Http\Resources\CustomerResource;

it('formats customer resource data correctly', function () {
    $customer = Customer::factory()->make(['id' => 1]);
    $resource = new CustomerResource($customer);

    $data = json_decode($resource->toJson(), true);

    expect($data)->toEqual([
        'id' => 1,
        'surnom' => $customer->surnom,
        'user_id' => $customer->user_id,
        'created_at' => null,
        'updated_at' => null,
    ]);
});

it('includes user when loaded', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    $customer->load('user');

    $resource = new CustomerResource($customer);
    $data = $resource->toArray(request());

    expect($data)->toHaveKey('user');
    expect($data['user']->id)->toBe($user->id);
});
