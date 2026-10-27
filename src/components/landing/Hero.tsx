"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { demoLoginAction } from "@/actions/auth";

export function Hero() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      const res = await demoLoginAction();
      if (res.success) {
        window.location.href = "/app/dashboard";
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-stone-50 via-stone-50 to-stone-100/60">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Sistem Operasi Manajemen Kehidupan Personal Generasi Baru</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
          Atur Hidupmu. <br className="hidden sm:inline" />
          <span className="text-emerald-800">Fokus pada Hal yang Penting.</span>
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Satu ruang untuk merencanakan aktivitas, membangun kebiasaan, mengelola keuangan, dan mencapai target pribadi dengan lebih terarah.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-7">
              Mulai Sekarang Gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDemoClick}
            isLoading={isDemoLoading}
            className="w-full sm:w-auto gap-2 text-base px-6 border-stone-300 text-stone-800 hover:bg-white"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            Lihat Demo Langsung
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-stone-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Tanpa Iklan atau Pelacak</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Privasi & Data Terenkripsi Penuh</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-700" />
            <span>Bantuan AI Cerdas & Transparan</span>
          </div>
        </div>
      </div>
    </section>
  );
}
