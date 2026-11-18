@extends('layouts.admin')

@section('title', 'New '.($resource === 'coupons' ? 'Coupon' : 'Deal').' | Admin Panel | DealzyCoup')

@section('content')
    <div class="animate-fadeIn space-y-8">
        <header class="border-b border-[#e5e9df] pb-5">
            <p class="text-sm font-semibold uppercase text-teal-700">Catalog</p>
            <h2 class="mt-1 text-3xl font-bold">New {{ $resource === 'coupons' ? 'Coupon' : 'Deal' }}</h2>
        </header>
        @include('admin.offers._form')
    </div>
@endsection
