<?php

use App\Models\Customer;
use App\Models\User;


it('lists customers successfully', function () {
    $token = $this->getAuthToken();

    Customer::factory()->count(3)->create();

    $response = $this->withToken($token)->getJson('/api/client');

    $response->assertOk()
             ->assertJsonCount(3)
             ->assertJsonStructure([
                 '*' => ['id', 'surnom', 'user_id', 'created_at', 'updated_at'],
             ]);
});

it('fails to list customers without auth', function () {
    Customer::factory()->count(3)->create();

    $response = $this->getJson('/api/client');

    $response->assertUnauthorized();
});

it('creates a new customer', function () {
    $token = $this->getAuthToken();
    $user = User::factory()->create();

    $data = [
        'surnom' => 'ClientTest',
        'user_id' => $user->id,
    ];

    $response = $this->withToken($token)->postJson('/api/client', $data);

    $response->assertCreated()
        ->assertJsonFragment(['surnom' => 'ClientTest'])
        ->assertJsonStructure([
            'data' => ['id', 'surnom', 'user_id', 'created_at', 'updated_at']
        ]);

    $this->assertDatabaseHas('customers', ['surnom' => 'ClientTest']);
});

it('fails to create customer with invalid data', function () {
    $token = $this->getAuthToken();

    $data = [
        'surnom' => '',
        'user_id' => 999,
    ];

    $response = $this->withToken($token)->postJson('/api/client', $data);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors(['surnom', 'user_id']);
});

it('shows a customer successfully', function () {
    $token = $this->getAuthToken();

    $this->customer = Customer::factory()->create();

    $response = $this->withToken($token)->getJson("/api/client/{$this->customer->id}");

    $response->assertOk()
             ->assertJsonFragment([
                 'id' => $this->customer->id,
                 'surnom' => $this->customer->surnom,
                 'user_id' => $this->customer->user_id,
             ])
             ->assertJsonStructure(['id', 'surnom', 'user_id', 'created_at', 'updated_at']);
});

it('fails to show nonexistent customer', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->getJson('/api/client/999');

    $response->assertNotFound();
});

it('updates a customer successfully', function () {
    $token = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $newUser = User::factory()->create();

    $data = [
        'surnom' => 'UpdatedClient',
        'user_id' => $newUser->id,
    ];

    $response = $this->withToken($token)->putJson("/api/client/{$customer->id}", $data);

    $response->assertOk()
        ->assertJsonFragment(['surnom' => 'UpdatedClient'])
        ->assertJsonStructure([
            'data' => ['id', 'surnom', 'user_id', 'created_at', 'updated_at']
        ]);
});


it('fails to update customer with invalid user id', function () {
    $token = $this->getAuthToken();

    $this->customer = Customer::factory()->create();

    $data = [
        'user_id' => 999,
    ];

    $response = $this->withToken($token)->putJson("/api/client/{$this->customer->id}", $data);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors('user_id');
});

it('deletes a customer successfully', function () {
    $token = $this->getAuthToken();

    $this->customer = Customer::factory()->create();

    $response = $this->withToken($token)->deleteJson("/api/client/{$this->customer->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('customers', ['id' => $this->customer->id]);
});

it('fails to delete nonexistent customer', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->deleteJson('/api/client/999');

    $response->assertNotFound();
});

it('clears customer cache when a customer is created', function () {
    $token = $this->getAuthToken();
    Cache::put('customers_list', ['old_data']);

    $response = $this->withToken($token)->postJson('/api/client', [
        'surnom'  => 'Giuseppe',
        'user_id' => User::factory()->create()->id,
    ]);

    $response->assertCreated();
    expect(Cache::has('customers_list'))->toBeFalse();
});

