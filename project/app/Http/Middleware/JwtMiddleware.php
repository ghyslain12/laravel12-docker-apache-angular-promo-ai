<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token non fourni'], 401);
        }

        try {
            $key = config('jwt.secret');

            if (!$key) {
                return response()->json(['error' => 'Configuration serveur manquante (JWT_SECRET)'], 500);
            }

            $decoded = JWT::decode($token, new Key($key, 'HS256'));

            $request->attributes->add(['user_data' => (array) $decoded]);

        } catch (Exception $e) {
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
        }

        return $next($request);
    }
}
