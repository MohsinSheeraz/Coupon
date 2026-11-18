<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

#[Signature('admin:sync')]
#[Description('Create or update the single admin account from the environment')]
class SyncAdmin extends Command
{
    public function handle(): int
    {
        $username = config('admin.username');
        $password = config('admin.password');

        if (! is_string($username) || trim($username) === '' || ! is_string($password) || trim($password) === '') {
            $this->error('Set ADMIN_USERNAME and ADMIN_PASSWORD in the local environment first.');

            return self::FAILURE;
        }

        User::query()->updateOrCreate(
            ['email' => $username],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );

        $this->info('Admin account is ready.');

        return self::SUCCESS;
    }
}
