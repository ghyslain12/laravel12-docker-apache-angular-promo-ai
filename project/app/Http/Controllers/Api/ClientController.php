<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerStoreRequest;
use App\Http\Requests\CustomerUpdateRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Cache::remember('customers_list', 3600, function () {
            return Customer::with('user')->get();
        });

        return response()->json(CustomerResource::collection($customers));
    }

    public function store(CustomerStoreRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        return (new CustomerResource($customer->load(['user'])))->response()->setStatusCode(201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json(new CustomerResource($customer->load(['user'])));
    }

    public function update(CustomerUpdateRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return (new CustomerResource($customer->load(['user'])))->response();
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(null, 204);
    }
}
