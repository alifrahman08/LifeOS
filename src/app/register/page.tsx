"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await registerAction(formData);
      if (res.success) {
        router.push("/app/dashboard");
      } else {
        setError(res.message || "Pendaftaran gagal. Periksa kembali informasi Anda.");
      }
    } catch {
      setError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        {/* Tombol Kembali ke Beranda */}
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-base">
              L
            </div>
            <span className="font-bold text-lg text-stone-900 tracking-tight">LifeOS</span>
          </Link>
          <h1 className="text-xl font-bold text-stone-900">Mulai Perjalanan Anda</h1>
          <p className="text-xs text-stone-500 mt-1">
            Buat akun untuk mengatur rencana, kebiasaan, dan keuangan Anda.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            type="text"
            required
            placeholder="Contoh: Budi Santoso"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Alamat Email"
            type="email"
            required
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="w-full space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">
              Kata Sandi (Minimal 8 karakter)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="w-full space-y-1.5">
            <label className="block text-xs font-medium text-stone-700">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
              />
            </div>
          </div>

          <Button type="submit" size="md" isLoading={isLoading} className="w-full mt-2">
            Buat Akun Saya
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-semibold text-emerald-800 hover:underline">
            Masuk sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
