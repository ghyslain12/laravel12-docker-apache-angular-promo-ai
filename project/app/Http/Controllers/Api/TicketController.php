<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TicketStoreRequest;
use App\Http\Requests\TicketUpdateRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TicketController extends Controller
{
    public function index(): JsonResponse
    {
        $tickets = Cache::remember('tickets_list', 3600, function () {
            return Ticket::with('sale')->get();
        });

        return response()->json(TicketResource::collection($tickets));
    }

    public function store(TicketStoreRequest $request): JsonResponse
    {
        $ticket = Ticket::create($request->validated());

        return (new TicketResource($ticket->load(['sale'])))->response()->setStatusCode(201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        return response()->json(new TicketResource($ticket->load(['sale'])));
    }

    public function update(TicketUpdateRequest $request, Ticket $ticket): JsonResponse
    {
        $ticket->update($request->validated());

        return (new TicketResource($ticket->load(['sale'])))->response();
    }

    public function destroy(Ticket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json(null, 204);
    }
}
