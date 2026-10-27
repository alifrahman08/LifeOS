"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Masuk
        </Link>

        <h1 className="text-xl font-bold text-stone-900">Pemulihan Kata Sandi</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Masukkan alamat email yang terdaftar. Kami akan mengirimkan instruksi pengaturan ulang kata sandi.
        </p>

        {isSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-900">Tautan Pemulihan Terkirim</h3>
            <p className="text-xs text-emerald-800/80">
              Jika alamat email terdaftar, instruksi telah dikirimkan ke <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alamat Email Terdaftar"
              type="email"
              required
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="md" isLoading={isLoading} className="w-full">
              Kirim Tautan Pemulihan
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

