<?php

namespace App\Console\Commands;

use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ImportMongo extends Command
{
    protected $signature = 'import:mongo
        {--path= : Folder with the exported JSON files (default: storage/app/mongo-export)}
        {--site= : Live site address used to download category images, e.g. https://example.com}
        {--fresh : Empty the tables before importing}';

    protected $description = 'Import the DealzyCoup MongoDB export (stores, coupons, categories, settings) into MySQL';

    public function handle(): int
    {
        ini_set('memory_limit', '1G');

        $path = rtrim($this->option('path') ?: storage_path('app/mongo-export'), '\\/');
        $site = $this->option('site') ? rtrim($this->option('site'), '/') : null;

        try {
            $stores = $this->readJson($path, 'stores');
            $coupons = $this->readJson($path, 'coupons');
            $categories = $this->readJson($path, 'categories');
            $settings = $this->readJson($path, 'settings');
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info(sprintf(
            'Read %d stores, %d coupons/deals, %d categories, %d settings row(s).',
            count($stores), count($coupons), count($categories), count($settings)
        ));

        $hasData = DB::table('stores')->exists() || DB::table('coupons')->exists() || DB::table('categories')->exists();
        if ($hasData && ! $this->option('fresh')) {
            $this->error('The tables already contain data. Run again with --fresh to empty them first.');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            Schema::disableForeignKeyConstraints();
            foreach (['category_store', 'coupons', 'categories', 'stores', 'settings'] as $table) {
                DB::table($table)->truncate();
            }
            Schema::enableForeignKeyConstraints();
            $this->line('Tables emptied.');
        }

        // Category images that live in GridFS on the live site are downloaded from it.
        $imagesFetched = 0;
        $imagesMissing = [];
        foreach ($categories as $c) {
            if (isset($c['image']) && preg_match('#^/api/category-images/([a-f\d]{24})$#i', $c['image'], $m)) {
                if ($this->fetchCategoryImage($m[1], $site)) {
                    $imagesFetched++;
                } else {
                    $imagesMissing[] = $c['name'] ?? $m[1];
                }
            }
        }

        $categoryIds = [];
        $storeIds = [];
        $couponCount = 0;
        $skipped = 0;

        DB::transaction(function () use ($categories, $stores, $coupons, $settings, &$categoryIds, &$storeIds, &$couponCount, &$skipped) {
            foreach ($categories as $c) {
                $name = trim((string) ($c['name'] ?? ''));
                if ($name === '') {
                    continue;
                }
                $key = Category::keyFor($name);
                $categoryIds[$key] = DB::table('categories')->insertGetId([
                    'name' => $name,
                    'key' => $key,
                    'image' => $this->blankToNull($c['image'] ?? null),
                    'status' => ($c['status'] ?? 'active') === 'archived' ? 'archived' : 'active',
                    'created_at' => $this->date($c['createdAt'] ?? null),
                    'updated_at' => $this->date($c['updatedAt'] ?? null),
                ]);
            }

            foreach ($stores as $s) {
                $storeId = DB::table('stores')->insertGetId([
                    'name' => (string) ($s['name'] ?? ''),
                    'slug' => (string) ($s['slug'] ?? ''),
                    'logo' => $this->blankToNull($s['logo'] ?? null),
                    'website' => $this->blankToNull($s['website'] ?? null),
                    'affiliate_link' => $this->blankToNull($s['affiliateLink'] ?? null),
                    'created_at' => $this->date($s['createdAt'] ?? null),
                    'updated_at' => $this->date($s['updatedAt'] ?? null),
                ]);
                $storeIds[$this->oid($s['_id'] ?? null)] = $storeId;

                $names = is_array($s['categories'] ?? null) ? $s['categories'] : [];
                $legacy = $s['category'] ?? null;
                if (is_string($legacy)) {
                    $names[] = $legacy;
                } elseif (is_array($legacy)) {
                    $names = array_merge($names, $legacy);
                }

                $attach = [];
                foreach ($names as $n) {
                    if (! is_string($n) || trim($n) === '') {
                        continue;
                    }
                    $key = Category::keyFor($n);
                    if ($key === '') {
                        continue;
                    }
                    if (! isset($categoryIds[$key])) {
                        $categoryIds[$key] = DB::table('categories')->insertGetId([
                            'name' => trim($n),
                            'key' => $key,
                            'image' => null,
                            'status' => 'active',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                    $attach[$categoryIds[$key]] = true;
                }
                foreach (array_keys($attach) as $categoryId) {
                    DB::table('category_store')->insert(['category_id' => $categoryId, 'store_id' => $storeId]);
                }
            }

            $batch = [];
            foreach ($coupons as $c) {
                $storeId = $storeIds[$this->oid($c['storeId'] ?? null)] ?? null;
                if (! $storeId) {
                    $skipped++;
                    $this->warn('Skipped "'.($c['title'] ?? '?').'": its store was not found.');

                    continue;
                }
                $batch[] = [
                    'store_id' => $storeId,
                    'type' => ($c['type'] ?? 'code') === 'deal' ? 'deal' : 'code',
                    'title' => (string) ($c['title'] ?? ''),
                    'code' => $this->blankToNull($c['code'] ?? null),
                    'affiliate_link' => $this->blankToNull($c['affiliateLink'] ?? null),
                    'description' => $this->blankToNull($c['description'] ?? null),
                    'expiry_date' => $this->blankToNull($c['expiryDate'] ?? null),
                    'used_count' => (int) ($c['usedCount'] ?? 0),
                    'logo' => $this->blankToNull($c['logo'] ?? null),
                    'created_at' => $this->date($c['createdAt'] ?? null),
                    'updated_at' => $this->date($c['updatedAt'] ?? null),
                ];
                $couponCount++;

                if (count($batch) >= 5) {
                    DB::table('coupons')->insert($batch);
                    $batch = [];
                }
            }
            if ($batch) {
                DB::table('coupons')->insert($batch);
            }

            if ($s = ($settings[0] ?? null)) {
                DB::table('settings')->insert([
                    'site_name' => (string) ($s['siteName'] ?? 'DealzyCoup'),
                    'site_description' => $this->blankToNull($s['siteDescription'] ?? null),
                    'contact_email' => $this->blankToNull($s['contactEmail'] ?? null),
                    'social_links' => json_encode($s['socialLinks'] ?? []),
                    'meta_tags' => json_encode($s['metaTags'] ?? []),
                    'created_at' => $this->date($s['updatedAt'] ?? null),
                    'updated_at' => $this->date($s['updatedAt'] ?? null),
                ]);
            }
        });

        $this->newLine();
        $this->info('Import finished.');
        $this->table(['Table', 'Rows'], [
            ['stores', DB::table('stores')->count()],
            ['categories', DB::table('categories')->count()],
            ['category_store', DB::table('category_store')->count()],
            ['coupons (codes + deals)', DB::table('coupons')->count()],
            ['settings', DB::table('settings')->count()],
        ]);
        $this->line("Category images downloaded: {$imagesFetched}");
        if ($skipped) {
            $this->warn("Coupons skipped: {$skipped}");
        }
        if ($imagesMissing) {
            $this->warn('Images NOT downloaded for: '.implode(', ', $imagesMissing));
            $this->warn('Run the command again with --fresh --site=https://your-live-site to fetch them.');
        }

        return self::SUCCESS;
    }

    private function readJson(string $path, string $name): array
    {
        $matches = glob($path.DIRECTORY_SEPARATOR.'*'.$name.'*.json') ?: [];
        if (! $matches) {
            throw new RuntimeException("Could not find a *{$name}*.json file in {$path}");
        }
        $data = json_decode(file_get_contents($matches[0]), true);
        if (! is_array($data)) {
            throw new RuntimeException("{$matches[0]} is not valid JSON");
        }

        return $data;
    }

    private function oid(mixed $value): ?string
    {
        if (is_array($value)) {
            return $value['$oid'] ?? null;
        }

        return is_string($value) ? $value : null;
    }

    private function date(mixed $value): string
    {
        $raw = is_array($value) ? ($value['$date'] ?? null) : $value;
        if (is_array($raw)) {
            $raw = $raw['$numberLong'] ?? null;
        }
        if ($raw === null || $raw === '') {
            return now()->format('Y-m-d H:i:s');
        }
        if (is_numeric($raw)) {
            return Carbon::createFromTimestampMs((int) $raw)->utc()->format('Y-m-d H:i:s');
        }

        return Carbon::parse($raw)->utc()->format('Y-m-d H:i:s');
    }

    private function blankToNull(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? $value : null;
    }

    private function fetchCategoryImage(string $id, ?string $site): bool
    {
        if (! $site) {
            return false;
        }

        try {
            $response = Http::timeout(30)->get("{$site}/api/category-images/{$id}");
            if (! $response->successful()) {
                return false;
            }
            $mime = strtolower(trim(explode(';', (string) $response->header('Content-Type'))[0]));
            $ext = match ($mime) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
                default => null,
            };
            if (! $ext) {
                return false;
            }
            Storage::disk('local')->put("category-images/{$id}.{$ext}", $response->body());

            return true;
        } catch (Throwable) {
            return false;
        }
    }
}