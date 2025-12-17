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
            ['name' => '低'],
            ['name' => '中'],
            ['name' => '高'],
            ['name' => '緊急'],
        ];

        foreach ($priorities as $priority) {
            Priority::create($priority);
        }
    }
}
