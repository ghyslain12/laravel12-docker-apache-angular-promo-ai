<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (empty($credentials['email']) || empty($credentials['password'])) {
            return response()->json(['error' => 'Email et mot de passe requis'], 400);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !password_verify($credentials['password'], $user->password)) {
            return response()->json(['error' => 'Identifiants invalides'], 401);
        }

        $secret = config('jwt.secret', env('JWT_SECRET')); // Utilise config avec env comme fallback
        if (is_null($secret) || $secret === '') {
            return response()->json(['error' => 'Configuration JWT invalide'], 500);
        }

        try {
            if (strlen(trim($secret)) === 0) {
                throw new \Exception('Clé JWT vide');
            }
            $token = JWT::encode([
                'iss' => 'votre_domaine',
                'sub' => $user->id,
                'iat' => time(),
                'exp' => time() + 3600
            ], $secret, 'HS256');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la génération du token: ' . $e->getMessage()], 500);
        }

        return response()->json(['token' => $token]);
    }
}