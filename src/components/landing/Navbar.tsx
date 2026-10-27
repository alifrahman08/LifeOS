"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-emerald-900 transition-colors">
            L
          </div>
          <span className="font-bold text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
            LifeOS
            <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              v2.4
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <Link href="#fitur" className="hover:text-stone-950 transition-colors">
            Fitur
          </Link>
          <Link href="#cara-kerja" className="hover:text-stone-950 transition-colors">
            Cara Kerja
          </Link>
          <Link href="#privasi" className="hover:text-stone-950 transition-colors">
            Privasi & Keamanan
          </Link>
          <Link href="#harga" className="hover:text-stone-950 transition-colors">
            Harga
          </Link>
          <Link href="#faq" className="hover:text-stone-950 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="gap-1.5">
              Mulai Sekarang
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-stone-600 hover:text-stone-900"
          aria-label="Buka navigasi"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 py-5 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-stone-700">
            <Link href="#fitur" onClick={() => setIsOpen(false)} className="py-1">
              Fitur
            </Link>
            <Link href="#cara-kerja" onClick={() => setIsOpen(false)} className="py-1">
              Cara Kerja
            </Link>
            <Link href="#privasi" onClick={() => setIsOpen(false)} className="py-1">
              Privasi & Keamanan
            </Link>
            <Link href="#harga" onClick={() => setIsOpen(false)} className="py-1">
              Harga
            </Link>
            <Link href="#faq" onClick={() => setIsOpen(false)} className="py-1">
              FAQ
            </Link>
          </nav>
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" size="md" className="w-full">
                  Masuk
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button size="md" className="w-full">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

