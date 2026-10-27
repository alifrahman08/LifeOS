"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction, demoLoginAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginAction(formData);
      if (res.success) {
        router.push("/app/dashboard");
      } else {
        setError(res.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch {
      setError("Terjadi kesalahan pada sistem. Silakan coba sesaat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const res = await demoLoginAction();
      if (res.success) {
        router.push("/app/dashboard");
      } else {
        setError(res.message || "Gagal mengaktifkan mode demo.");
      }
    } catch {
      setError("Gagal masuk mode demo.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-base">
              L
            </div>
            <span className="font-bold text-lg text-stone-900 tracking-tight">LifeOS</span>
          </Link>
          <h1 className="text-xl font-bold text-stone-900">Selamat Datang Kembali</h1>
          <p className="text-xs text-stone-500 mt-1">
            Masuk ke ruang kerja pribadi Anda untuk melanjutkan hari dengan tenang.
          </p>
        </div>

        {/* Demo Fast Login Button */}
        <div className="mb-6 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Ingin Menjelajah Dulu?
            </span>
          </div>
          <p className="text-[11px] text-emerald-800/80 mb-2.5">
            Coba seluruh fitur dengan data contoh realistis tanpa perlu mendaftar.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoLogin}
            isLoading={isDemoLoading}
            className="w-full bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 text-xs font-semibold"
          >
            Masuk Cepat Mode Demo
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email"
            type="email"
            required
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-stone-700">Kata Sandi</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-emerald-800 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" size="md" isLoading={isLoading} className="w-full mt-2">
            Masuk ke Akun
          </Button>
        </form>

        {/* Register link */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          Belum memiliki akun?{" "}
          <Link href="/register" className="font-semibold text-emerald-800 hover:underline">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
