<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@gmail.com',
            ],
            [
                'name' => 'System Admin',
                'phone' => '9876543210',
                'password' => Hash::make('admin123'),
                'address' => 'Ahmedabad, Gujarat',
                'role' => 'admin',
                'status' => 'active',
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}