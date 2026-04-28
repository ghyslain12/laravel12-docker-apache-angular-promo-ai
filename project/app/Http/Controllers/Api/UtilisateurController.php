<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class UtilisateurController extends Controller
{
    public function index(): JsonResponse
    {
        $users = Cache::remember('users_list', 3600, function () {
            return User::all();
        });

        return response()->json(UserResource::collection($users));
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(new UserResource($user));
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return (new UserResource($user))->response();
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->customer) {
            $user->customer->delete();
        }

        $user->delete();

        return response()->json(null, 204);
    }

    public function ping(): JsonResponse
    {
        return response()->json([
            'status'    => 'success',
            'message'   => 'pong',
            'timestamp' => now()->toDateTimeString(),
        ]);
    }
}
