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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md  p-8 rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              className="mt-1 block w-full rounded-lg border shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <div className="text-red-600 text-sm">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              className="mt-1 block w-full rounded-lg border shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.password && (
              <div className="text-red-600 text-sm">{errors.password}</div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {processing ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
