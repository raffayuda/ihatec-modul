<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Siti Nurhayati',
            'email' => 'manager@example.com',
            'role' => 'manager PD',
        ]);

        User::factory()->create([
            'name' => 'Rina Apriyani',
            'email' => 'staf@example.com',
            'role' => 'Staf PD',
        ]);

        User::factory()->create([
            'name' => 'Andi Pratama',
            'email' => 'user@example.com',
            'role' => 'User',
        ]);
    }
}
