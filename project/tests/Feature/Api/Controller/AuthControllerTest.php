<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;



beforeEach(function () {
    config(['jwt.secret' => 'zm4ZkgOBEW5BTG3oyuYfzIlioTreEjbUCdrETAZqAGE=']);
    $this->artisan('config:clear');
});

it('logs in user and returns jwt token', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
             ->assertJsonStructure(['token']);

    $token = $response->json('token');
    $decoded = JWT::decode($token, new Key(config('jwt.secret'), 'HS256'));

    expect($decoded->iss)->toEqual('votre_domaine');
    expect($decoded->sub)->toEqual($user->id);
    expect($decoded->exp > time())->toBeTrue();

    [$headerEncoded] = explode('.', $token);
    $header = json_decode(base64_decode($headerEncoded));
    expect($header->alg)->toEqual('HS256');
});

it('fails to login with invalid email', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'wrong@example.com',
        'password' => 'password123',
    ]);

    $response->assertUnauthorized()
             ->assertJson(['error' => 'Identifiants invalides']);
});

it('fails to login with invalid password', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertUnauthorized()
             ->assertJson(['error' => 'Identifiants invalides']);
});

it('fails to login with missing credentials', function () {
    $response = $this->postJson('/api/login', []);

    $response->assertBadRequest()
             ->assertJson(['error' => 'Email et mot de passe requis']);
});

it('fails to login without jwt secret', function () {
    // Vide la clé JWT via config
    config(['jwt.secret' => null]);

    User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertInternalServerError()
             ->assertJsonFragment(['error' => 'Configuration JWT invalide']);
});

it('returns token with correct expiration', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $token = $response->json('token');
    $decoded = JWT::decode($token, new Key(config('jwt.secret'), 'HS256'));

    expect($decoded->exp)->toEqualWithDelta(time() + 3600, 5);
});
