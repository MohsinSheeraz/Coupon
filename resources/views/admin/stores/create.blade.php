@extends('layouts.admin')

@section('title', 'Add Store | Admin Panel | DealzyCoup')

@section('content')
    <h2 class="mb-8 text-3xl font-bold">Add New Store</h2>
    @include('admin.stores._form', ['store' => null])
@endsection
