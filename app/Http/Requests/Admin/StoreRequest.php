<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $store = $this->route('store');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'alpha_dash:ascii',
                'max:255',
                Rule::unique('stores', 'slug')->ignore($store),
            ],
            'website' => ['nullable', 'url:http,https', 'max:2048'],
            'affiliate_link' => ['nullable', 'url:http,https', 'max:2048'],
            'logo_url' => ['nullable', 'url:http,https', 'max:2048'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'distinct', Rule::exists('categories', 'id')],
            'remove_logo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo.image' => 'The store logo must be a valid image.',
            'logo.max' => 'The store logo may not be larger than 2 MB.',
            'category_ids.*.exists' => 'One or more selected categories no longer exist.',
        ];
    }
}
