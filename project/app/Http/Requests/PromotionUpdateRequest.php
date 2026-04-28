<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromotionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $promoId = $this->route('promotion')?->id;

        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:150'],
            'code' => [
                'sometimes', 'nullable', 'string', 'max:30',
                Rule::unique('promotions', 'code')
                    ->ignore($promoId)
                    ->whereNull('deleted_at'),
            ],
            'type' => ['sometimes', Rule::in(['percentage', 'fixed_amount'])],
            'value' => ['sometimes', 'numeric', 'min:0.01'],
            'target_type' => ['sometimes', Rule::in(['material', 'all', 'coupon'])],
            'target_id' => ['nullable', 'exists:materials,id'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:100'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
