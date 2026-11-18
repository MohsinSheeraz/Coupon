@extends('layouts.admin')

@section('title', 'New Category | Admin Panel | DealzyCoup')

@section('content')
    <h2 class="mb-8 text-3xl font-bold">New Category</h2>
    @include('admin.categories._form', ['category' => null, 'selectedStoreIds' => []])
@endsection
