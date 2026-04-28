<?php

namespace Database\Factories;

use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Promotion>
 */
class PromotionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $targetType = $this->faker->randomElement(['material', 'all', 'coupon']);

        return [
            'name'               => $this->faker->words(3, true),
            'code'               => null,
            'type'               => $this->faker->randomElement(['percentage', 'fixed_amount']),
            'value'              => $this->faker->randomElement([5, 10, 15, 20, 25, 50]),
            'target_type'        => $targetType,
            'target_id'          => null,
            'starts_at'          => null,
            'ends_at'            => null,
            'priority'           => $this->faker->numberBetween(0, 5),
            'active'             => true,
        ];
    }

    public function forMaterial(Material $material): static
    {
        return $this->state([
            'target_type' => 'material',
            'target_id'   => $material->id,
            'code'        => null,
        ]);
    }

    public function global(): static
    {
        return $this->state([
            'target_type' => 'all',
            'target_id'   => null,
            'code'        => null,
        ]);
    }

    public function coupon(): static
    {
        return $this->state([
            'target_type'  => 'coupon',
            'target_id'    => null,
            'code'         => strtoupper(Str::random(8)),
            'ends_at'      => $this->faker->dateTimeBetween('+1 week', '+6 months'),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['active' => false]);
    }

    public function expired(): static
    {
        return $this->state([
            'starts_at' => $this->faker->dateTimeBetween('-3 months', '-2 months'),
            'ends_at'   => $this->faker->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }

    public function scheduled(): static
    {
        return $this->state([
            'starts_at' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
            'ends_at'   => $this->faker->dateTimeBetween('+2 months', '+6 months'),
        ]);
    }

    public function percentage(float $value = 15): static
    {
        return $this->state([
            'type'  => 'percentage',
            'value' => $value,
        ]);
    }

    public function fixedAmount(float $value = 10): static
    {
        return $this->state([
            'type'  => 'fixed_amount',
            'value' => $value,
        ]);
    }
}
