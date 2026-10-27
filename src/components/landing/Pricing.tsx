import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Pricing() {
  return (
    <section id="harga" className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
            Investasi pada Diri Sendiri
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">
            Transparan, Tanpa Biaya Tersembunyi
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Akses seluruh modul inti manajemen kehidupan tanpa kartu kredit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Tier 1: Personal (Free) */}
          <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                LifeOS Personal
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-stone-900">Rp 0</span>
                <span className="text-xs text-stone-500">/ selamanya</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">
                Cocok untuk individu yang ingin mulai menata hari, kebiasaan, dan anggaran harian secara terarah.
              </p>

              <div className="mt-6 pt-6 border-t border-stone-100 space-y-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Smart Planner & manajemen tugas tak terbatas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Pelacakan hingga 10 kebiasaan aktif dengan streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Pencatatan keuangan & anggaran bulanan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Target pribadi & pelacak milestone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>AI Insight berbasis aturan transparan</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link href="/register" className="w-full block">
                <Button variant="outline" size="md" className="w-full">
                  Mulai Gratis Sekarang
                </Button>
              </Link>
            </div>
          </div>

          {/* Tier 2: LifeOS Supporter / Pro */}
          <div className="p-8 rounded-2xl bg-white border-2 border-emerald-800 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider">
              Pilihan Favorit
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                LifeOS Pro & Supporter
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-stone-900">Rp 49.000</span>
                <span className="text-xs text-stone-500">/ bulan</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">
                Untuk profesional dan pengguna tingkat lanjut yang membutuhkan integrasi penuh dan sinkronisasi lanjutan.
              </p>

              <div className="mt-6 pt-6 border-t border-stone-100 space-y-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Semua fitur LifeOS Personal tanpa batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kebiasaan aktif tanpa batas & analisis tahunan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Multi-rekening keuangan & pelacakan investasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Analisis mendalam AI dengan model LLM canggih</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Ekspor laporan lengkap CSV & PDF prioritas</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link href="/register" className="w-full block">
                <Button size="md" className="w-full gap-2">
                  Coba 14 Hari Gratis
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

