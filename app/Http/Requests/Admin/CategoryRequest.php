<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:60'],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'image_upload' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'store_ids' => ['nullable', 'array'],
            'store_ids.*' => ['integer', 'distinct', Rule::exists('stores', 'id')],
            'status' => ['sometimes', Rule::in(['active', 'archived'])],
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('name')) {
                    return;
                }

                $name = trim($this->string('name')->toString());
                $key = Category::keyFor($name);

                if ($key === '') {
                    $validator->errors()->add('name', 'Enter a category name containing letters or numbers.');

                    return;
                }

                $existingCategory = Category::query()->where('key', $key);
                $category = $this->route('category');

                if ($category instanceof Category) {
                    $existingCategory->whereKeyNot($category->getKey());
                }

                if ($existingCategory->exists()) {
                    $validator->errors()->add('name', 'A category with this name already exists.');
                }

                $hasCurrentImage = $category instanceof Category && filled($category->image);
                $hasReplacementImage = $this->hasFile('image_upload') || filled($this->input('image_url'));

                if (! $hasCurrentImage && ! $hasReplacementImage && ! $this->boolean('remove_image')) {
                    $validator->errors()->add('image_url', 'A category image URL or upload is required.');
                }
            },
        ];
    }
}
