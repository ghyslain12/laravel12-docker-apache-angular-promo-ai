<?php

use App\Http\Middleware\JwtMiddleware;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/test-middleware', function () {
        return response()->json(['message' => 'success']);
    })->middleware(JwtMiddleware::class);
});

it('returns 401 if no token is provided', function () {
    $response = $this->getJson('/test-middleware');

    $response->assertStatus(401)
        ->assertJson(['error' => 'Token non fourni']);
});

it('returns 401 if token is invalid', function () {
    $response = $this->withToken('invalid-token')->getJson('/test-middleware');

    $response->assertStatus(401)
        ->assertJson(['error' => 'Token invalide ou expiré']);
});

it('allows access if token is valid', function () {
    $payload = [
        'iss' => 'votre_domaine',
        'sub' => 1,
        'iat' => time(),
        'exp' => time() + 3600
    ];

    $secret = env('JWT_SECRET');
    $token = JWT::encode($payload, $secret, 'HS256');

    $response = $this->withToken($token)->getJson('/test-middleware');

    $response->assertOk()
        ->assertJson(['message' => 'success']);
});
