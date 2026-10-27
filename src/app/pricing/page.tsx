import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1">
        <div className="pt-12 pb-6 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Pilihan Paket Fleksibel
          </h1>
          <p className="mt-3 text-stone-600 text-sm">
            Mulai gratis selamanya untuk kebutuhan personal Anda, atau tingkatkan ke Pro untuk fitur lanjutan.
          </p>
        </div>
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

