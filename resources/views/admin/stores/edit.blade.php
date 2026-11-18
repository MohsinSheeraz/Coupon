@extends('layouts.admin')

@section('title', 'Edit Store | Admin Panel | DealzyCoup')

@section('content')
    <h2 class="mb-8 text-3xl font-bold">Edit Store</h2>
    @include('admin.stores._form', ['store' => $store])
@endsection
