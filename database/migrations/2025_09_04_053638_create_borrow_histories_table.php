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
        Schema::create('borrow_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrow_id')->constrained('borrows')->onDelete('cascade');
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->enum('old_status', ['pending', 'approved', 'rejected', 'returned'])->nullable();
            $table->enum('new_status', ['pending', 'approved', 'rejected', 'returned']);
            $table->text('notes')->nullable();
            $table->timestamp('changed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrow_histories');
    }
};
