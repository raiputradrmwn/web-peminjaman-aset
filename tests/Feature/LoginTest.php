<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_login_and_redirect()
    {
        $user = User::factory()->create(['role' => 'superadmin']);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/superadmin/dashboard');
    }

    public function test_admin_can_login_and_redirect()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_employee_can_login_and_redirect()
    {
        $user = User::factory()->create(['role' => 'employee']);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/employee/dashboard');
    }

    public function test_employee_cannot_access_admin_dashboard()
    {
        $user = User::factory()->create(['role' => 'employee']);
        $this->actingAs($user);

        $response = $this->get('/admin/dashboard');

        $response->assertStatus(403); // Forbidden
    }
}
