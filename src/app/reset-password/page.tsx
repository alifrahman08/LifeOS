"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Home,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resetPasswordAction } from "@/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal 8 karakter demi keamanan.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (!token) {
      setError("Token pemulihan tidak ditemukan dalam URL. Minta tautan baru.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await resetPasswordAction(formData);

      if (!res.success) {
        setError(res.message || "Gagal mengatur ulang kata sandi.");
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan internal pada server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2.5">
          <ShieldAlert className="w-8 h-8 text-amber-700 mx-auto" />
          <h2 className="text-sm font-semibold text-amber-900">Token Pemulihan Tidak Ditemukan</h2>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Tautan yang Anda buka tidak memiliki parameter token yang valid atau telah rusak. Silakan ajukan permohonan tautan pemulihan baru.
          </p>
        </div>
        <Link href="/forgot-password" className="block">
          <Button size="md" className="w-full text-xs">
            Minta Tautan Pemulihan Baru
          </Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3.5">
        <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-emerald-950">Kata Sandi Berhasil Diperbarui!</h3>
          <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
            Kata sandi akun LifeOS Anda telah berhasil diganti. Anda sekarang dapat masuk menggunakan kata sandi baru.
          </p>
        </div>
        <Link href="/login" className="block pt-2">
          <Button size="md" className="w-full">
            Masuk Sekarang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Kata Sandi Baru */}
      <div className="w-full space-y-1.5">
        <label className="block text-xs font-medium text-stone-700">
          Kata Sandi Baru
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Minimal 8 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Input Konfirmasi Kata Sandi */}
      <div className="w-full space-y-1.5">
        <label className="block text-xs font-medium text-stone-700">
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Ulangi kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            title={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" size="md" isLoading={isLoading} className="w-full gap-2">
        <Lock className="w-4 h-4" />
        Simpan Kata Sandi Baru
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        {/* Navigation top */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Masuk
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-emerald-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Beranda
          </Link>
        </div>

        {/* Brand header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            L
          </div>
          <span className="font-bold text-base text-stone-900 tracking-tight">LifeOS</span>
        </div>

        <h1 className="text-xl font-bold text-stone-900">Atur Ulang Kata Sandi</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Buat kata sandi baru yang kuat untuk melindungi akun LifeOS Anda.
        </p>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-stone-500">
              Memuat formulir pemulihan...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
