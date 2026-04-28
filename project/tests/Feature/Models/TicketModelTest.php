<?php

use App\Models\Ticket;
use App\Models\Sale;

it('creates a ticket with title and description', function () {
    $sale = Sale::factory()->create();

    $ticket = Ticket::factory()->create([
        'titre' => 'Fix Bug',
        'description' => 'Fixing API error',
        'sale_id' => $sale->id
    ]);

    expect($ticket->titre)->toBe('Fix Bug');
    $this->assertDatabaseHas('tickets', ['titre' => 'Fix Bug']);
});


it('belongs to a sale', function () {
    $sale = Sale::factory()->create();
    $ticket = Ticket::factory()->create(['sale_id' => $sale->id]);

    expect($ticket->sale)->toBeInstanceOf(Sale::class)
        ->and($ticket->sale->id)->toBe($sale->id);
});

