"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDemoAccount = (roleName: string, accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setSelectedDemoRole(roleName);
    setError(null);
  };

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
        if (email === "admin@lifeos.id") {
          router.push("/admin");
        } else {
          router.push("/app/dashboard");
        }
      } else {
        setError(res.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch {
      setError("Terjadi kesalahan pada sistem. Silakan coba sesaat lagi.");
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

        {/* Brand Header */}
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

        {/* PILIH AKUN DEMO CEPAT */}
        <div className="mb-6 space-y-2.5">
          <div className="text-center">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              PILIH AKUN DEMO CEPAT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Akun Pengguna Utama */}
            <button
              type="button"
              onClick={() => handleSelectDemoAccount("USER", "budi@lifeos.id", "LifeOS123!")}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer bg-white group ${
                selectedDemoRole === "USER"
                  ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500"
                  : "border-stone-200 hover:border-emerald-500 hover:bg-stone-50/60"
              }`}
            >
              <div className="font-bold text-xs sm:text-sm text-emerald-900 group-hover:text-emerald-700">
                Pengguna Utama
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
                budi@lifeos.id
              </div>
            </button>

            {/* Akun Administrator */}
            <button
              type="button"
              onClick={() => handleSelectDemoAccount("ADMIN", "admin@lifeos.id", "AdminLifeOS123!")}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer bg-white group ${
                selectedDemoRole === "ADMIN"
                  ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500"
                  : "border-stone-200 hover:border-emerald-500 hover:bg-stone-50/60"
              }`}
            >
              <div className="font-bold text-xs sm:text-sm text-emerald-900 group-hover:text-emerald-700">
                Administrator
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
                admin@lifeos.id
              </div>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Alamat Email"
            type="email"
            required
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSelectedDemoRole(null);
            }}
          />

          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-stone-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-emerald-800 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSelectedDemoRole(null);
                }}
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
