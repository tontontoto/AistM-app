<?php

namespace Database\Seeders;

use App\Models\Priority;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priorities = [
            '低',
            '中',
            '高',
            '緊急',
        ];

        foreach ($priorities as $name) {
            Priority::firstOrCreate(['name' => $name]);
        }
    }
}
