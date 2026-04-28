<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 30)->unique()->nullable();
            $table->enum('type', ['percentage', 'fixed_amount']);
            $table->decimal('value', 8, 2); // ex: 15.00 = -15% or -15€
            $table->enum('target_type', ['material', 'all', 'coupon']);
            $table->foreignId('target_id')
                ->nullable()
                ->constrained('materials')
                ->nullOnDelete();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->tinyInteger('priority')->default(0);
            $table->boolean('active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
