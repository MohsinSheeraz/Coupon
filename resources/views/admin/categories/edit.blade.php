@extends('layouts.admin')

@section('title', 'Edit Category | Admin Panel | DealzyCoup')

@section('content')
    <h2 class="mb-8 text-3xl font-bold">Edit Category</h2>
    @include('admin.categories._form', ['selectedStoreIds' => $category->stores->modelKeys()])
@endsection
