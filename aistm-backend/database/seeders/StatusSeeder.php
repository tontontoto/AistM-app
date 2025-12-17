<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => '企画中'],
            ['name' => '進行中'],
            ['name' => '完了'],
            ['name' => '保留中'],
        ];

        foreach ($statuses as $status) {
            Status::create($status);
        }
    }
}
