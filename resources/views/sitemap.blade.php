{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>{{ route('home') }}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>{{ route('coupons.index') }}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>{{ route('deals.index') }}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>{{ route('stores.index') }}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>{{ route('contact') }}</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
@foreach ($categories as $category)
    <url><loc>{{ route('stores.index', ['category' => $category->name]) }}</loc>@if ($category->updated_at)<lastmod>{{ $category->updated_at->toDateString() }}</lastmod>@endif<changefreq>weekly</changefreq><priority>0.7</priority></url>
@endforeach
@foreach ($stores as $store)
    <url><loc>{{ route('stores.show', $store) }}</loc><lastmod>{{ \Illuminate\Support\Carbon::parse($store->offers_max_updated_at ?? $store->updated_at)->toDateString() }}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
@endforeach
</urlset>
