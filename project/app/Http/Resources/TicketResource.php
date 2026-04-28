<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "titre" => $this->titre,
            "description" => $this->description,
            "sale_id" => $this->sale_id,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "sale" => new SaleSimpleResource($this->whenLoaded("sale")),
        ];
    }
}
