"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setError(null);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-stone-900">Atur Ulang Kata Sandi</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Masukkan kata sandi baru untuk akun LifeOS Anda.
        </p>

        {isSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-900">Kata Sandi Berhasil Diperbarui</h3>
            <p className="text-xs text-emerald-800/80">
              Silakan masuk kembali menggunakan kata sandi baru Anda.
            </p>
            <Link href="/login" className="block pt-2">
              <Button size="sm" className="w-full">
                Masuk Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            <Input
              label="Kata Sandi Baru"
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" size="md" className="w-full">
              Simpan Kata Sandi Baru
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
