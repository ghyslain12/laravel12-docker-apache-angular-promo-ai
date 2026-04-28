<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'surnom'  => 'required|string|max:255',
            'user_id' => 'required|exists:users,id',
        ];
    }
}
