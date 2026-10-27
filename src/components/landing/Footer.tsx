import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800 text-xs">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                L
              </div>
              <span className="font-bold text-base text-white tracking-tight">LifeOS</span>
            </div>
            <p className="text-stone-400 max-w-sm leading-relaxed">
              Platform manajemen kehidupan pribadi untuk produktivitas yang tenang, kesadaran finansial yang transparan, dan pertumbuhan kebiasaan yang bermakna.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
              Produk & Fitur
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="#fitur" className="hover:text-white transition-colors">
                  Smart Planner
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-white transition-colors">
                  Habit Tracker
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-white transition-colors">
                  Keuangan & Anggaran
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-white transition-colors">
                  Target & Milestone
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-white transition-colors">
                  AI Insights
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">
              Akun & Kebijakan
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="#privasi" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#privasi" className="hover:text-white transition-colors">
                  Ketentuan Layanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} LifeOS — Personal Life Management. Seluruh hak cipta dilindungi.</p>
          <p>Dibuat dengan standar privasi dan rekayasa perangkat lunak tertinggi.</p>
        </div>
      </div>
    </footer>
  );
}

