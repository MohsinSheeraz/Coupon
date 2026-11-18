<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OfferRequest;
use App\Models\Coupon;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use RuntimeException;

class OfferController extends Controller
{
    public function index(Request $request): View
    {
        $type = $this->type($request);
        $resource = $this->resource($type);
        $offers = Coupon::query()
            ->where('type', $type)
            ->with('store:id,name')
            ->latest()
            ->orderByDesc('id')
            ->paginate(14);

        return view('admin.offers.index', compact('offers', 'resource', 'type'));
    }

    public function create(Request $request): View
    {
        $resource = $this->resource($this->type($request));
        $stores = Store::query()->orderBy('name')->get(['id', 'name']);
        $offer = null;

        return view('admin.offers.create', compact('offer', 'resource', 'stores'));
    }

    public function store(OfferRequest $request): RedirectResponse
    {
        $type = $this->type($request);
        $attributes = $request->validated();
        $attributes['type'] = $type;
        $attributes['code'] = $type === 'code' ? $attributes['code'] : null;
        $attributes['logo'] = $this->logoFor($request, $attributes, null);
        unset($attributes['logo_url'], $attributes['logo_upload'], $attributes['remove_logo']);

        $offer = Coupon::query()->create($attributes);

        return redirect()
            ->route('admin.'.$this->resource($type).'.index')
            ->with('status', ucfirst($type === 'code' ? 'coupon' : 'deal')." {$offer->title} created successfully.");
    }

    public function edit(Request $request, Coupon $offer): View
    {
        $type = $this->type($request);
        abort_unless($offer->type === $type, 404);

        $resource = $this->resource($type);
        $stores = Store::query()->orderBy('name')->get(['id', 'name']);

        return view('admin.offers.edit', compact('offer', 'resource', 'stores'));
    }

    public function update(OfferRequest $request, Coupon $offer): RedirectResponse
    {
        $type = $this->type($request);
        abort_unless($offer->type === $type, 404);

        $attributes = $request->validated();
        $attributes['code'] = $type === 'code' ? $attributes['code'] : null;
        $attributes['logo'] = $this->logoFor($request, $attributes, $offer);
        unset($attributes['logo_url'], $attributes['logo_upload'], $attributes['remove_logo']);
        $offer->update($attributes);

        return redirect()
            ->route('admin.'.$this->resource($type).'.index')
            ->with('status', ucfirst($type === 'code' ? 'coupon' : 'deal')." {$offer->title} updated successfully.");
    }

    public function destroy(Request $request, Coupon $offer): RedirectResponse
    {
        $type = $this->type($request);
        abort_unless($offer->type === $type, 404);

        $title = $offer->title;
        $offer->delete();

        return redirect()
            ->route('admin.'.$this->resource($type).'.index')
            ->with('status', ucfirst($type === 'code' ? 'coupon' : 'deal')." {$title} deleted.");
    }

    private function type(Request $request): string
    {
        return $request->routeIs('admin.deals.*') ? 'deal' : 'code';
    }

    private function resource(string $type): string
    {
        return $type === 'deal' ? 'deals' : 'coupons';
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function logoFor(OfferRequest $request, array $attributes, ?Coupon $offer): ?string
    {
        if ($request->hasFile('logo_upload')) {
            $path = $request->file('logo_upload')->storePublicly('offer-logos', 'public');

            if (! is_string($path)) {
                throw new RuntimeException('The offer logo could not be saved.');
            }

            return Storage::disk('public')->url($path);
        }

        if ($request->boolean('remove_logo')) {
            return null;
        }

        if (filled($attributes['logo_url'] ?? null)) {
            return $attributes['logo_url'];
        }

        return $offer?->logo;
    }
}
