import React from "react";
import {
  CalendarClock,
  Repeat,
  Wallet,
  Target,
  LineChart,
  BrainCircuit,
  Lock,
  Smartphone,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <CalendarClock className="w-5 h-5 text-emerald-800" />,
      title: "Perencanaan Harian & Smart Planner",
      description:
        "Atur tugas dengan algoritma prioritas cerdas dan transparan berdasarkan deadline, durasi, dan tingkat kepentingan nyata tanpa kebingungan.",
    },
    {
      icon: <Repeat className="w-5 h-5 text-sky-800" />,
      title: "Habit Tracker Berkelanjutan",
      description:
        "Lacak konsistensi harian, hitung streak terbaik secara akurat, dan perkuat kebiasaan baik dengan target fleksibel (kuantitas atau selesai).",
    },
    {
      icon: <Wallet className="w-5 h-5 text-amber-800" />,
      title: "Keuangan Pribadi & Anggaran",
      description:
        "Kelola arus kas bulanan berbasis mata uang Rupiah, pantau pengeluaran per kategori, dan dapatkan peringatan otomatis sebelum anggaran terlewati.",
    },
    {
      icon: <Target className="w-5 h-5 text-purple-800" />,
      title: "Target & Milestone Terintegrasi",
      description:
        "Pecah impian besar menjadi langkah-langkah terukur. Progres target diperbarui secara otomatis dari tugas dan kontribusi tabungan riil.",
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-emerald-700" />,
      title: "AI Insights Terarah & Terpercaya",
      description:
        "Sistem analisis logis yang memberikan rekomendasi actionable berdasarkan pola aktivitas Anda, selalu tersedia dengan fallback berbasis aturan.",
    },
    {
      icon: <LineChart className="w-5 h-5 text-indigo-800" />,
      title: "Laporan & Analitik Menyeluruh",
      description:
        "Evaluasi produktivitas mingguan, tren keuangan antarbulan, dan rasio pencapaian target dalam grafik visual yang bersih dan mudah dipahami.",
    },
  ];

  return (
    <section id="fitur" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Ekosistem Lengkap
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Semua yang Anda Butuhkan untuk Menata Hidup
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Tidak perlu lagi berpindah antar aplikasi terpisah. LifeOS menyatukan produktivitas, kebiasaan, dan keuangan dalam satu harmoni.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-emerald-300 hover:bg-white transition-all shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">{item.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

