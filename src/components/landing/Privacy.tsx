import React from "react";
import { ShieldCheck, Database, KeyRound, EyeOff } from "lucide-react";

export function Privacy() {
  const points = [
    {
      icon: <Database className="w-5 h-5 text-emerald-800" />,
      title: "Kepemilikan Data Penuh Milik Anda",
      description:
        "Data tugas, target, dan catatan finansial Anda adalah aset pribadi Anda. Anda dapat mengekspor seluruh data dalam format JSON atau menghapus akun secara permanen kapan saja.",
    },
    {
      icon: <KeyRound className="w-5 h-5 text-emerald-800" />,
      title: "Enkripsi Kata Sandi & Sesi Aman",
      description:
        "Kata sandi di-hash menggunakan algoritma Bcrypt standar industri. Sesi login dikelola melalui cookie HTTP-Only terenkripsi JWT yang tahan terhadap pencurian skrip.",
    },
    {
      icon: <EyeOff className="w-5 h-5 text-emerald-800" />,
      title: "Transparansi Sistem AI",
      description:
        "LifeOS tidak pernah menjual atau mengirimkan catatan keuangan rahasia Anda ke model AI pihak ketiga tanpa izin. Analisis berjalan dengan logika berbasis aturan yang dapat diverifikasi.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-800" />,
      title: "Isolasi Akses Tingkat Server",
      description:
        "Setiap operasi database diverifikasi ketat di sisi server. Administrator platform pun tidak memiliki akses otomatis ke catatan transaksi atau jurnal personal pengguna.",
    },
  ];

  return (
    <section id="privasi" className="py-20 bg-white border-t border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Prinsip Fundamental
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">
            Privasi Bukan Sekadar Fitur Tambahan
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Kami membangun LifeOS dengan keyakinan bahwa tempat Anda mengelola kehidupan pribadi haruslah menjadi ruang teraman yang Anda miliki.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {points.map((p, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-stone-900">{p.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
