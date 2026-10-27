import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeOS — Platform Manajemen Kehidupan Pribadi",
  description:
    "Satu ruang untuk merencanakan aktivitas, membangun kebiasaan, mengelola keuangan, dan mencapai target pribadi dengan lebih terarah.",
  keywords: [
    "LifeOS",
    "Smart Planner",
    "Habit Tracker",
    "Keuangan Pribadi",
    "Manajemen Waktu",
    "Target Pribadi",
    "Produktivitas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col font-sans">{children}</body>
    </html>
  );
}

