<?php

namespace Database\Seeders;

use App\Actions\Promotion\CalculateDiscountAction;
use App\Actions\Promotion\FindBestPromotionAction;
use App\Models\Customer;
use App\Models\Material;
use App\Models\Promotion;
use App\Models\Sale;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
		// php artisan migrate:fresh --seed 

        $users = User::factory()->count(10)->create([
            'password' => Hash::make('password'),
        ]);

        $customers = collect();
        foreach ($users as $user) {
            $customers->push(Customer::create([
                'surnom'  => fake()->userName(),
                'user_id' => $user->id,
            ]));
        }

        $materials = Material::factory()->count(10)->create();
        $materials->take(3)->each(function (Material $material, int $index) {
            Promotion::factory()
                ->inactive()
                ->forMaterial($material)
                ->percentage(10 + ($index * 5)) // -10%, -15%, -20%
                ->create([
                    'name'     => "Promo sur {$material->designation}",
                    'priority' => 3,
                ]);
        });

        Promotion::factory()
            ->global()
            ->percentage(25)
            ->create([
                'name'     => 'Remise générale -25%',
                'priority' => 2,
                'starts_at' => now(),
                'ends_at' => now()->addMonths(3),
                'active' => true,
            ]);

        Promotion::factory()
            ->coupon()
            ->percentage(20)
            ->create([
                'name'  => 'Coupon bienvenue',
                'code'  => 'WELCOME20',
                'starts_at' => now(),
                'ends_at' => now()->addMonths(3),
                'priority' => 1,
                'active' => true,
            ]);

        Promotion::factory()
            ->inactive()
            ->coupon()
            ->expired()
            ->create([
                'name' => 'Coupon été 2024 (expiré)',
                'code' => 'ETE2024',
            ]);

        Promotion::factory()
            ->global()
            ->inactive()
            ->fixedAmount(15)
            ->create([
                'name' => 'Soldes hiver (désactivée)',
            ]);

        $findPromotion    = app(FindBestPromotionAction::class);
        $calculateDiscount = app(CalculateDiscountAction::class);

        foreach (range(1, 10) as $i) {
            $sale = Sale::create([
                'titre'       => fake()->sentence(3),
                'description' => fake()->optional(0.7)->paragraph(),
                'customer_id' => $customers->random()->id,
            ]);

            Ticket::factory()->count(rand(1, 3))->create([
                'sale_id' => $sale->id,
            ]);

            $selectedMaterials = $materials->random(rand(2, 5));
            $pivotData = [];

            foreach ($selectedMaterials as $material) {
                $promotion = $findPromotion->execute($material);
                $pivotData[$material->id] = $calculateDiscount->execute(
                    (float) $material->price,
                    $promotion
                );
            }

            $sale->materials()->attach($pivotData);
        }

        User::factory()->create([
            'name'     => 'Admin',
            'email'    => 'admin@example.com',
            'password' => Hash::make('admin123'),
        ]);

        User::factory()->create([
            'name'     => 'gigi',
            'email'    => 'gigi@gigi.com',
            'password' => Hash::make('gigi'),
        ]);
    }
}
