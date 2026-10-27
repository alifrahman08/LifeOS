"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apa perbedaan LifeOS dengan aplikasi to-do list atau pencatat keuangan biasa?",
      a: "Sebagian besar aplikasi bekerja secara terisolasi: Anda memiliki satu aplikasi untuk to-do list, satu untuk habit, dan satu lagi untuk spreadsheet keuangan. LifeOS menyatukan semuanya dalam satu sistem operasi yang saling terhubung: menyelesaikan tugas otomatis memperbarui progres target, check-in kebiasaan mempengaruhi evaluasi fokus, dan transaksi belanja terhubung langsung dengan batas anggaran bulanan.",
    },
    {
      q: "Bagaimana cara kerja Smart Planner dalam menentukan prioritas?",
      a: "Smart Planner menggunakan algoritma transparan yang memperhitungkan sisa waktu deadline, tingkat urgensi yang Anda tetapkan, keterkaitan dengan target aktif, dan estimasi waktu kerja. Anda dapat melihat alasan di balik setiap prioritas dan tetap memiliki kendali penuh untuk mengubah urutan secara manual kapan saja.",
    },
    {
      q: "Apakah data keuangan saya aman dan terjaga kerahasiaannya?",
      a: "Sangat aman. LifeOS tidak pernah menjual data Anda ke pihak ketiga. Catatan transaksi Anda dienkripsi dan hanya dapat diakses melalui akun Anda yang terotentikasi. Anda juga dapat mengekspor atau menghapus seluruh catatan Anda kapan saja secara permanen.",
    },
    {
      q: "Apakah fitur AI tetap berfungsi jika saya tidak memasukkan API Key?",
      a: "Ya! LifeOS memiliki mesin rekomendasi berbasis aturan (rule-based engine) bawaan yang bekerja 100% secara lokal tanpa memerlukan API key eksternal. Sistem tetap dapat menganalisis beban kerja, konsistensi habit, dan ambang batas anggaran Anda secara akurat.",
    },
    {
      q: "Apakah LifeOS dapat digunakan di perangkat ponsel (mobile)?",
      a: "Ya. Antarmuka LifeOS dibangun dengan prinsip mobile-first yang sepenuhnya responsif, dilengkapi navigasi bawah yang nyaman digunakan pada layar sentuh ponsel pintar.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-t border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Pertanyaan Umum
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">
            Semua yang Perlu Anda Ketahui
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-stone-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 bg-stone-50/50 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

