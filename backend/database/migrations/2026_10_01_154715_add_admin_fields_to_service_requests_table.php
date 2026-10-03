<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
              // Admin can store cancellation reason
            $table->text('cancellation_reason')
                ->nullable()
                ->after('status');

            // Admin internal notes
            $table->text('admin_notes')
                ->nullable()
                ->after('cancellation_reason');

            // Issue/complaint classification
            $table->string('issue_classification')
                ->nullable()
                ->after('admin_notes');

            // none / open / investigating / resolved
            $table->string('issue_status')
                ->default('none')
                ->after('issue_classification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            //
        });
    }
};
