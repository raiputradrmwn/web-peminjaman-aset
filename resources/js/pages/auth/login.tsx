// import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
// import InputError from '@/components/input-error';
// import TextLink from '@/components/text-link';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import AuthLayout from '@/layouts/auth-layout';
// import { register } from '@/routes';
// import { request } from '@/routes/password';
// import { Form, Head } from '@inertiajs/react';
// import { LoaderCircle } from 'lucide-react';

// interface LoginProps {
//     status?: string;
//     canResetPassword: boolean;
// }

// export default function Login({ status, canResetPassword }: LoginProps) {
//     return (
//         <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
//             <Head title="Log in" />

//             <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
//                 {({ processing, errors }) => (
//                     <>
//                         <div className="grid gap-6">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email address</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     name="email"
//                                     required
//                                     autoFocus
//                                     tabIndex={1}
//                                     autoComplete="email"
//                                     placeholder="email@example.com"
//                                 />
//                                 <InputError message={errors.email} />
//                             </div>

//                             <div className="grid gap-2">
//                                 <div className="flex items-center">
//                                     <Label htmlFor="password">Password</Label>
//                                     {canResetPassword && (
//                                         <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
//                                             Forgot password?
//                                         </TextLink>
//                                     )}
//                                 </div>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     name="password"
//                                     required
//                                     tabIndex={2}
//                                     autoComplete="current-password"
//                                     placeholder="Password"
//                                 />
//                                 <InputError message={errors.password} />
//                             </div>

//                             <div className="flex items-center space-x-3">
//                                 <Checkbox id="remember" name="remember" tabIndex={3} />
//                                 <Label htmlFor="remember">Remember me</Label>
//                             </div>

//                             <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
//                                 {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
//                                 Log in
//                             </Button>
//                         </div>

//                         <div className="text-center text-sm text-muted-foreground">
//                             Don't have an account?{' '}
//                             <TextLink href={register()} tabIndex={5}>
//                                 Sign up
//                             </TextLink>
//                         </div>
//                     </>
//                 )}
//             </Form>

//             {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
//         </AuthLayout>
//     );
// }

import React from "react";
import { useForm } from "@inertiajs/react";

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block">Password</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
              className="mr-2"
            />
            <span>Remember me</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded"
          >
            {processing ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
