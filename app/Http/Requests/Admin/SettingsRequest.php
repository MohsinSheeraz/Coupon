<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:255'],
            'site_description' => ['required', 'string', 'max:2000'],
            'contact_email' => ['required', 'email', 'max:254'],
            'social_links' => ['required', 'array:facebook,twitter,instagram,pinterest'],
            'social_links.facebook' => ['nullable', 'url:http,https', 'max:2048'],
            'social_links.twitter' => ['nullable', 'url:http,https', 'max:2048'],
            'social_links.instagram' => ['nullable', 'url:http,https', 'max:2048'],
            'social_links.pinterest' => ['nullable', 'url:http,https', 'max:2048'],
            'meta_tags' => ['required', 'array:title,description,keywords'],
            'meta_tags.title' => ['required', 'string', 'max:255'],
            'meta_tags.description' => ['required', 'string', 'max:500'],
            'meta_tags.keywords' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'social_links.*.url' => 'Each social media link must be a valid HTTP or HTTPS URL.',
        ];
    }
}
