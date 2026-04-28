<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Traits\InteractsWithAuth;

uses(TestCase::class, RefreshDatabase::class, InteractsWithAuth::class)->in('Feature');
uses(TestCase::class, RefreshDatabase::class)->in('Unit');




