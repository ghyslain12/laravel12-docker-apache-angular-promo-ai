<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'code'                => $this->code,
            'type'                => $this->type,
            'value'               => $this->value,
            'target_type'         => $this->target_type,
            'target_id'           => $this->target_id,
            'starts_at'           => $this->starts_at,
            'ends_at'             => $this->ends_at,
            'priority'            => $this->priority,
            'active'              => $this->active,
            'status'              => $this->status,
            'discount_label'      => $this->discount_label,  // ex: "-15%" ou "-15€"
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,

            'material' => $this->whenLoaded('material', fn() => [
                'id'          => $this->material->id,
                'designation' => $this->material->designation,
            ]),
        ];
    }
}
