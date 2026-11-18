<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isDeal = $this->routeIs('admin.deals.*');

        return [
            'title' => ['required', 'string', 'max:500'],
            'store_id' => ['required', 'integer', Rule::exists('stores', 'id')],
            'code' => $isDeal ? ['prohibited'] : ['required', 'string', 'max:255'],
            'affiliate_link' => ['required', 'url:http,https', 'max:2048'],
            'expiry_date' => ['required', 'date_format:Y-m-d'],
            'description' => ['nullable', 'string', 'max:5000'],
            'logo_url' => ['nullable', 'url:http,https', 'max:2048'],
            'logo_upload' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'store_id.exists' => 'The selected store no longer exists.',
            'code.prohibited' => 'Deals cannot have a coupon code.',
            'logo_upload.image' => 'The offer logo must be a valid image.',
            'logo_upload.max' => 'The offer logo may not be larger than 2 MB.',
        ];
    }
}
