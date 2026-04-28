<?php

use App\Models\Ticket;
use App\Models\Sale;
use App\Http\Resources\TicketResource;

it('formats ticket resource and includes simple sale when loaded', function () {
    $sale = Sale::factory()->create();
    $ticket = Ticket::factory()->create(['sale_id' => $sale->id]);
    $ticket->load('sale');

    $resource = new TicketResource($ticket);
    $data = $resource->toArray(request());

    expect($data['sale'])->not->toBeNull();
    expect($data['sale']->id)->toBe($sale->id);
});
