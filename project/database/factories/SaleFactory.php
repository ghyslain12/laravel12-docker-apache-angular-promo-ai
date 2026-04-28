<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Customer;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'titre' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'customer_id' => Customer::factory(),
            //'ticket_id' => null, // Optionnel, peut être défini via une relation
            //'sale_id' => null, // Optionnel, semble être une référence récursive ou une erreur
            //'material_id' => null, // Optionnel, peut être défini via une relation
        ];
    }
}
