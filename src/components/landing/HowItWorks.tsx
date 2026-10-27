import React from "react";
import { ListFilter, PlayCircle, Award } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <ListFilter className="w-5 h-5 text-emerald-800" />,
      title: "Atur Rencana",
      description:
        "Tentukan prioritas harian, jadwalkan kebiasaan yang ingin dibangun, dan tetapkan batas anggaran bulanan sesuai kapasitas Anda.",
    },
    {
      step: "02",
      icon: <PlayCircle className="w-5 h-5 text-emerald-800" />,
      title: "Jalankan Aktivitas",
      description:
        "Fokus pada satu tugas dalam satu waktu dengan rekomendasi Smart Planner. Catat check-in kebiasaan dan transaksi harian dengan satu ketukan.",
    },
    {
      step: "03",
      icon: <Award className="w-5 h-5 text-emerald-800" />,
      title: "Evaluasi Kemajuan",
      description:
        "Tinjau tren mingguan dan dapatkan saran cerdas yang dapat dijelaskan untuk menyempurnakan ritme hidup Anda di minggu berikutnya.",
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
            Alur Terarah
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">
            Bagaimana LifeOS Bekerja
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Tiga langkah sederhana untuk membangun hari yang lebih tenang, produktif, dan terkontrol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <span className="text-3xl font-black text-emerald-800/20 absolute top-4 right-5 font-mono">
                {s.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-stone-900">{s.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
