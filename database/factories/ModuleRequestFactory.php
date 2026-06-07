<?php

namespace Database\Factories;

use App\Models\ModuleRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ModuleRequest>
 */
class ModuleRequestFactory extends Factory
{
    protected $model = ModuleRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $counter = 0;
        $counter++;
        $year = now()->year;

        return [
            'request_number' => "PMD-{$year}-".str_pad($counter, 4, '0', STR_PAD_LEFT),
            'type' => $this->faker->randomElement(['Modul Baru', 'Revisi Modul', 'Kebutuhan Khusus']),
            'title' => $this->faker->sentence(4),
            'applicant_id' => User::factory(),
            'unit' => $this->faker->randomElement(['IT & Digital', 'Keuangan', 'Operasional', 'Pengembangan SDM']),
            'description' => $this->faker->paragraph(),
            'deadline' => $this->faker->dateTimeBetween('now', '+30 days'),
            'status' => 'Baru',
            'priority' => $this->faker->randomElement(['High', 'Medium', 'Low']),
            'related_module_id' => null,
            'reject_reason' => null,
            'processed_by' => null,
            'processed_at' => null,
        ];
    }

    /**
     * Set status to Menunggu Approval.
     */
    public function waitingApproval(): static
    {
        return $this->state(fn () => ['status' => 'Menunggu Approval']);
    }

    /**
     * Set status to Selesai.
     */
    public function selesai(): static
    {
        return $this->state(fn () => ['status' => 'Selesai', 'processed_at' => now()]);
    }

    /**
     * Set status to Ditolak.
     */
    public function ditolak(): static
    {
        return $this->state(fn () => [
            'status' => 'Ditolak',
            'reject_reason' => 'Format tidak sesuai standar.',
            'processed_at' => now(),
        ]);
    }
}
