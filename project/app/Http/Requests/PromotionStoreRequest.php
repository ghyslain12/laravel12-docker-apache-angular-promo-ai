<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromotionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:150'],
            'code' => [
                'nullable', 'string', 'max:30',
                Rule::unique('promotions', 'code')->whereNull('deleted_at'),
            ],
            'type' => ['required', Rule::in(['percentage', 'fixed_amount'])],
            'value' => [
                'required', 'numeric', 'min:0.01',
                function ($attribute, $value, $fail) {
                    if ($this->input('type') === 'percentage' && $value > 100) {
                        $fail('La valeur ne peut pas dépasser 100 pour un pourcentage.');
                    }
                },
            ],
            'target_type' => ['required', Rule::in(['material', 'all', 'coupon'])],
            'target_id' => [
                Rule::requiredIf(fn () => $this->input('target_type') === 'material'),
                'nullable',
                'exists:materials,id',
            ],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:100'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
