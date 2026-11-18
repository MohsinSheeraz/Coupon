<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class SettingsController extends Controller
{
    public function edit(): View
    {
        $settings = Setting::current();

        return view('admin.settings.edit', compact('settings'));
    }

    public function update(SettingsRequest $request): RedirectResponse
    {
        $settings = Setting::current();
        $settings->update($request->validated());

        return redirect()
            ->route('admin.settings.edit')
            ->with('status', 'Settings updated successfully.');
    }
}
