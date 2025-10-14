import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const { data, setData, post, processing, errors, reset, transform } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Optional: trim email sebelum kirim
  transform((data) => ({
    ...data,
    email: data.email.trim(),
  }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post("/login", {
      onStart: () => {
        toast.loading("Memproses login...", { id: "login" });
      },
      onSuccess: () => {
        toast.success("Berhasil masuk 🚀", { id: "login" });
        // Kalau mau bersihkan password setelah sukses:
        reset("password");
      },
      onError: (errs) => {
        // Tampilkan error field spesifik jika ada
        const fieldErr =
          errs?.email ||
          errs?.password ||
          "Login gagal. Periksa kembali email / password.";
        toast.error(fieldErr, { id: "login" });
      },
      onFinish: () => {
        // Menutup loading kalau belum tertutup oleh success/error
        toast.dismiss("login");
      },
      preserveScroll: true,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                required
                disabled={processing}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  required
                  disabled={processing}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
