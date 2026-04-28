<?php

use App\Models\Customer;
use App\Models\User;
use App\Models\Sale;

it('creates a customer with a nickname', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create([
        'surnom' => 'Gigi',
        'user_id' => $user->id
    ]);

    expect($customer->surnom)->toBe('Gigi');
    $this->assertDatabaseHas('customers', ['surnom' => 'Gigi']);
});

it('belongs to a user', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    expect($customer->user)->toBeInstanceOf(User::class)
        ->and($customer->user->id)->toBe($user->id);
});

it('has many sales', function () {
    $customer = Customer::factory()->create();
    Sale::factory()->count(3)->create(['customer_id' => $customer->id]);

    expect($customer->sales)->toHaveCount(3);
});

