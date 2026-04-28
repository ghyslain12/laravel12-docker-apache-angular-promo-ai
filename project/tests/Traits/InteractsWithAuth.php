<?php

namespace Tests\Traits;

use App\Models\User;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

trait InteractsWithAuth
{
    protected function getAuthToken(string $email = 'admin@admin.com', string $password = 'password'): string
    {
        User::factory()->create([
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        $request = Request::create('/api/login', 'POST', [
            'email' => $email,
            'password' => $password,
        ]);

        $controller = new AuthController();
        $response = $controller->login($request);
        $data = json_decode($response->getContent(), true);

        if (!isset($data['token'])) {
            throw new \Exception("Erreur de login : " . ($data['error'] ?? 'Inconnu'));
        }

        return $data['token'];
    }
}

