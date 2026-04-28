<?php

use App\Models\User;
use App\Http\Resources\UserResource;

it('formats user resource data correctly', function () {
    $user = User::factory()->make(['id' => 1]);
    $resource = new UserResource($user);

    expect($resource->toArray(request()))->toBe([
        'id' => 1,
        'name' => $user->name,
        'email' => $user->email,
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
    ]);
});
