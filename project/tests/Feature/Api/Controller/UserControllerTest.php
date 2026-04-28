<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    Cache::flush();
});

it('lists users successfully', function () {
    $token = $this->getAuthToken();

    User::factory()->count(3)->create();

    $response = $this->withToken($token)->getJson('/api/utilisateur');
    $response
        ->assertOk()
        ->assertJsonCount(4);
});

it('fails to list users without auth', function () {
    User::factory()->count(3)->create();

    $response = $this->getJson('/api/utilisateur');

    $response->assertUnauthorized();
});

it('creates a new user', function () {
    $token = $this->getAuthToken();

    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
    ];

    $response = $this->withToken($token)->postJson('/api/utilisateur', $data);

    $response->assertCreated()
        ->assertJsonFragment(['name' => 'John Doe', 'email' => 'john@example.com'])
        ->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'created_at', 'updated_at']
        ]);

    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    expect(Hash::check('password123', User::where('email', 'john@example.com')->first()->password))->toBeTrue();
});

it('fails to create user with invalid data', function () {
    $token = $this->getAuthToken();

    $data = [
        'name' => '',
        'email' => 'not-an-email',
        'password' => '123',
    ];

    $response = $this->withToken($token)->postJson('/api/utilisateur', $data);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors(['name', 'email', 'password']);
});

it('shows a user successfully', function () {
    $token = $this->getAuthToken();

    $this->user = User::factory()->create();

    $response = $this->withToken($token)->getJson("/api/utilisateur/{$this->user->id}");

    $response->assertOk()
             ->assertJsonFragment([
                 'id' => $this->user->id,
                 'name' => $this->user->name,
                 'email' => $this->user->email,
             ])
             ->assertJsonStructure(['id', 'name', 'email', 'created_at', 'updated_at']);
});

it('fails to show nonexistent user', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->getJson('/api/utilisateur/999');

    $response->assertNotFound();
});

it('updates a user successfully', function () {
    $token = $this->getAuthToken();
    $user = User::factory()->create();

    $data = [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
        'password' => 'newpassword123',
    ];

    $response = $this->withToken($token)->putJson("/api/utilisateur/{$user->id}", $data);

    $response->assertOk()
        ->assertJsonFragment(['name' => 'Updated Name', 'email' => 'updated@example.com'])
        ->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'created_at', 'updated_at']
        ]);

    expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
});


it('fails to update user with invalid email', function () {
    $token = $this->getAuthToken();

    $this->user = User::factory()->create();

    $data = [
        'email' => 'invalid-email',
    ];

    $response = $this->withToken($token)->putJson("/api/utilisateur/{$this->user->id}", $data);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors('email');
});

it('fails to update user with duplicate email', function () {
    $token = $this->getAuthToken();

    $this->user = User::factory()->create();
    $anotherUser = User::factory()->create(['email' => 'existing@example.com']);

    $data = [
        'email' => 'existing@example.com',
    ];

    $response = $this->withToken($token)->putJson("/api/utilisateur/{$this->user->id}", $data);

    $response->assertUnprocessable()
             ->assertJsonValidationErrors('email');
});

it('deletes a user successfully', function () {
    $token = $this->getAuthToken();

    $this->user = User::factory()->create();

    $response = $this->withToken($token)->deleteJson("/api/utilisateur/{$this->user->id}");

    $response->assertNoContent();

    $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
});

it('fails to delete nonexistent user', function () {
    $token = $this->getAuthToken();

    $response = $this->withToken($token)->deleteJson('/api/utilisateur/999');

    $response->assertNotFound();
});

it('creates a new user and clears cache', function () {
    Cache::spy();
    $token = $this->getAuthToken();

    $data = [
        'name' => 'John Cache',
        'email' => 'cache@example.com',
        'password' => 'password123',
    ];

    $response = $this->withToken($token)->postJson('/api/utilisateur', $data);

    $response->assertCreated();

    Cache::shouldHaveReceived('forget')->with('users_list');
});
