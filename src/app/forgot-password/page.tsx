"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Home,
  Mail,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPasswordResetAction, PasswordResetResultData } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PasswordResetResultData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      const res = await requestPasswordResetAction(formData);

      if (!res.success) {
        setError(res.message || "Gagal memproses permintaan pemulihan kata sandi.");
        return;
      }

      if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan internal pada server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (result?.directLink) {
      navigator.clipboard.writeText(result.directLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
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

        <h1 className="text-xl font-bold text-stone-900">Pemulihan Kata Sandi</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed">
          Masukkan alamat email yang terdaftar pada akun LifeOS Anda. Kami akan memverifikasi dan mengirimkan tautan pengaturan ulang kata sandi.
        </p>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Permintaan Ditolak</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            {result.emailSent ? (
              /* State 1: Email real berhasil dikirim via SMTP */
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-900 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>Email Pemulihan Terkirim</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Tautan pengaturan ulang kata sandi telah berhasil dikirimkan ke alamat email{" "}
                  <strong className="font-semibold text-emerald-950">{result.email}</strong>.
                </p>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200/60 text-[11px] text-stone-600 space-y-1">
                  <p className="font-medium text-stone-800">Catatan Pengiriman:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Periksa kotak masuk (Inbox) atau folder Spam/Promosi Anda.</li>
                    <li>Tautan pemulihan berlaku selama 60 menit.</li>
                  </ul>
                </div>
              </div>
            ) : (
              /* State 2: SMTP belum disetel atau kendala koneksi -> Tampilkan tautan langsung */
              <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <Info className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Tautan Pemulihan Kata Sandi Siap</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Token pemulihan untuk akun <strong>{result.email}</strong> telah berhasil dibuat. Karena server pengiriman email (SMTP) di file <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[11px] font-mono">.env</code> belum diisi kredensial, Anda dapat langsung menggunakan tautan di bawah ini:
                </p>

                {result.directLink && (
                  <div className="space-y-2 pt-1">
                    <Link href={result.directLink} className="block">
                      <Button size="md" className="w-full gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Buka Halaman Atur Ulang Kata Sandi
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-white rounded-lg border border-amber-200 text-[11px] text-stone-600 font-mono truncate select-all">
                        {result.directLink}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="shrink-0 gap-1.5 text-xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Salin
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-white/70 rounded-lg border border-amber-200/60 text-[11px] text-amber-900/80 leading-relaxed">
                  <strong>💡 Cara Mengaktifkan Pengiriman Email Nyata (Gmail SMTP):</strong>
                  <br />
                  Buka file <code className="font-mono bg-white px-1 py-0.5 rounded">.env</code>, isi <code className="font-mono">SMTP_USER</code> dengan alamat Gmail dan <code className="font-mono">SMTP_PASS</code> dengan Google App Password 16 karakter.
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="w-full text-xs"
              >
                Gunakan Email Lain
              </Button>
              <Link href="/login" className="w-full">
                <Button size="md" className="w-full text-xs">
                  Kembali ke Masuk
                </Button>
              </Link>
            </div>
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
              helperText="Pastikan menggunakan alamat email yang Anda gunakan saat mendaftar akun LifeOS."
            />

            <Button type="submit" size="md" isLoading={isLoading} className="w-full gap-2">
              <Mail className="w-4 h-4" />
              Kirim Tautan Pemulihan
            </Button>

            <div className="pt-2 text-center text-xs text-stone-500">
              Ingat kata sandi Anda?{" "}
              <Link href="/login" className="font-semibold text-emerald-800 hover:underline">
                Masuk di sini
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
