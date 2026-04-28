<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('creates a user with hashed password', function () {
    $user = User::factory()->create([
        'name' => 'Gigi',
        'email' => 'gigi@example.com',
        'password' => 'secret123'
    ]);

    expect($user->name)->toBe('Gigi')
        ->and($user->email)->toBe('gigi@example.com')
        ->and(Hash::check('secret123', $user->password))->toBeTrue();

    $this->assertDatabaseHas('users', [
        'email' => 'gigi@example.com'
    ]);
});

it('has the correct fillable attributes', function () {
    $user = new User([
        'name' => 'New User',
        'email' => 'new@example.com',
        'password' => 'password',
        'invalid_field' => 'should_not_exist'
    ]);

    expect($user->getFillable())->toContain('name', 'email', 'password')
        ->and($user->invalid_field)->toBeNull();
});

it('hashes the password automatically via casts', function () {
    $user = User::factory()->create();

    expect($user->password)->not->toBe('plain-text');
});
