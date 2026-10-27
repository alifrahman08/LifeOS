import { Navbar } from "@/components/landing/Navbar";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1">
        <div className="pt-12 pb-6 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Fitur Lengkap LifeOS
          </h1>
          <p className="mt-3 text-stone-600 text-sm">
            Eksplorasi mendalam setiap modul yang dirancang untuk mendukung produktivitas dan kesejahteraan Anda.
          </p>
        </div>
        <Features />
      </main>
      <Footer />
    </div>
  );
}
