<?php

use App\Models\Ticket;
use App\Models\Sale;
use Illuminate\Support\Facades\Cache;

function createTicket(array $attributes = []) {
    $sale = Sale::factory()->create();
    return Ticket::factory()->create(array_merge(['sale_id' => $sale->id], $attributes));
}

it('lists tickets successfully', function () {
    $token = $this->getAuthToken();
    createTicket();
    createTicket();

    $response = $this->withToken($token)->getJson('/api/ticket');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'titre', 'description', 'created_at', 'updated_at']
        ]);
});

it('fails to list tickets without auth', function () {
    $response = $this->getJson('/api/ticket');
    $response->assertUnauthorized();
});

it('creates a new ticket', function () {
    $token = $this->getAuthToken();
    $sale = Sale::factory()->create();

    $data = [
        'titre' => 'TicketTest',
        'description' => 'DescriptionTest',
        'sale_id' => $sale->id,
    ];

    $response = $this->withToken($token)->postJson('/api/ticket', $data);

    $response->assertCreated()
        ->assertJsonFragment(['titre' => 'TicketTest'])
        ->assertJsonStructure(['data' => ['id', 'titre', 'description', 'created_at', 'updated_at']]);

    $this->assertDatabaseHas('tickets', ['titre' => 'TicketTest']);
});

it('shows a ticket successfully', function () {
    $token = $this->getAuthToken();
    $ticket = createTicket();

    $response = $this->withToken($token)->getJson("/api/ticket/{$ticket->id}");

    $response->assertOk()
        ->assertJsonFragment(['id' => $ticket->id])
        ->assertJsonStructure(['id', 'titre', 'description', 'created_at', 'updated_at']);
});

it('updates a ticket successfully', function () {
    $token = $this->getAuthToken();
    $ticket = createTicket();
    $newSale = Sale::factory()->create();

    $data = [
        'titre' => 'UpdatedTicket',
        'description' => 'UpdatedDescription',
        'sale_id' => $newSale->id,
    ];

    $response = $this->withToken($token)->putJson("/api/ticket/{$ticket->id}", $data);

    $response->assertOk()
        ->assertJsonFragment(['titre' => 'UpdatedTicket'])
        ->assertJsonStructure(['data' => ['id', 'titre', 'description', 'created_at', 'updated_at']]);
});

it('deletes a ticket successfully', function () {
    $token = $this->getAuthToken();
    $ticket = createTicket();

    $response = $this->withToken($token)->deleteJson("/api/ticket/{$ticket->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('tickets', ['id' => $ticket->id]);
});

it('clears ticket cache when a ticket is created', function () {
    $token = $this->getAuthToken();
    Cache::put('tickets_list', ['old_data']);
    $sale = Sale::factory()->create();

    $response = $this->withToken($token)->postJson('/api/ticket', [
        'titre'       => 'Support',
        'description' => 'Desc',
        'sale_id'     => $sale->id,
    ]);

    $response->assertCreated();
    expect(Cache::has('tickets_list'))->toBeFalse();
});
