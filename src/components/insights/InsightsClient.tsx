"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AIInsightRecommendation } from "@/types";

interface InsightsClientProps {
  initialInsights: AIInsightRecommendation[];
  source: "AI" | "RULE_BASED";
  explanation: string;
  summaryData: {
    tasksCompleted: number;
    tasksOverdue: number;
    habitConsistency: number;
    totalExpense: number;
    totalIncome: number;
    activeGoals: number;
  };
}

export function InsightsClient({
  initialInsights,
  source,
  explanation,
  summaryData,
}: InsightsClientProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});

  // Interactive Q&A State
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([
    {
      q: "Apa pencapaian saya minggu ini?",
      a: `Minggu ini Anda telah menyelesaikan ${summaryData.tasksCompleted} tugas penting dan menjaga konsistensi kebiasaan di angka ${summaryData.habitConsistency}%. Pertahankan fokus pada tugas-tugas prioritas utama!`,
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleFeedback = (id: string, isHelpful: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: true }));
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    const q = question.trim();
    setQuestion("");

    setTimeout(() => {
      let answer = "";
      const lower = q.toLowerCase();

      if (lower.includes("anggaran") || lower.includes("keuangan") || lower.includes("pengeluaran")) {
        answer = `Total pengeluaran Anda bulan ini tercatat Rp ${new Intl.NumberFormat(
          "id-ID"
        ).format(summaryData.totalExpense)} dibandingkan pemasukan Rp ${new Intl.NumberFormat(
          "id-ID"
        ).format(summaryData.totalIncome)}. Arus kas Anda berada dalam kondisi ${
          summaryData.totalIncome > summaryData.totalExpense ? "surplus yang sehat" : "perlu perhatian"
        }.`;
      } else if (lower.includes("prioritas") || lower.includes("besok") || lower.includes("tugas")) {
        answer = `Fokus utama Anda saat ini: terdapat ${
          summaryData.tasksOverdue > 0
            ? `${summaryData.tasksOverdue} tugas terlambat yang perlu diselesaikan terlebih dahulu`
            : "semua tugas dalam jadwal aman"
        }. Terapkan alokasi waktu pagi untuk pekerjaan dengan bobot usaha tertinggi.`;
      } else if (lower.includes("kebiasaan") || lower.includes("habit")) {
        answer = `Tingkat konsistensi kebiasaan Anda berada di angka ${summaryData.habitConsistency}%. Kebiasaan minum air dan membaca buku menunjukkan stabilitas streak yang sangat baik.`;
      } else {
        answer = `Berdasarkan data aktivitas Anda, fokuskan energi pada 3 tugas terpenting dan jaga konsistensi kebiasaan harian Anda. LifeOS mendeteksi ritme kerja Anda tetap teratur dan stabil.`;
      }

      setQaHistory((prev) => [...prev, { q, a: answer }]);
      setIsAsking(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-700" />
            AI Insights & Rekomendasi Terarah
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Analisis cerdas berdasarkan pola tugas, konsistensi habit, dan alokasi anggaran Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={source === "AI" ? "success" : "info"}>
            {source === "AI" ? "Bertenaga Model AI" : "Logika Berbasis Aturan (100% Offline)"}
          </Badge>
        </div>
      </div>

      {/* Transparansi & Privasi Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 space-y-1">
          <h4 className="font-bold">Privasi Terjamin & Rekomendasi yang Dapat Dijelaskan</h4>
          <p className="text-emerald-900/80 leading-relaxed">{explanation}</p>
        </div>
      </div>

      {/* Grid Rekomendasi Terarah */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          Rekomendasi Terkini untuk Anda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {insight.category}
                  </Badge>
                  {feedbackGiven[insight.id] ? (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terima kasih atas masukannya
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-stone-400">
                      <span className="text-[10px] mr-1">Bermanfaat?</span>
                      <button
                        onClick={() => handleFeedback(insight.id, true)}
                        className="p-1 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        title="Ya, bermanfaat"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(insight.id, false)}
                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Kurang relevan"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-stone-900">{insight.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{insight.summary}</p>
                </div>

                {/* Fakta yang Mendasari Saran */}
                {insight.facts && insight.facts.length > 0 && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Fakta Terukur yang Mendasari:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-stone-600 space-y-0.5">
                      {insight.facts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/60 text-xs text-emerald-950">
                  <strong className="block text-emerald-900 mb-0.5">Langkah Praktis:</strong>
                  {insight.recommendation}
                </div>
              </div>

              {insight.actionUrl && (
                <div className="pt-2 border-t border-stone-100">
                  <Link
                    href={insight.actionUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    {insight.actionText || "Terapkan Sekarang"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Tanya Jawab Berbasis Data (Interactive Data Q&A) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-800" />
              Tanya Asisten LifeOS Berbasis Data
            </CardTitle>
            <p className="text-xs text-stone-500 mt-0.5">
              Ajukan pertanyaan mengenai pencapaian mingguan, penggunaan anggaran, atau saran prioritas.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Riwayat Q&A */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {qaHistory.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-100 text-stone-900 font-semibold w-fit max-w-[85%]">
                  👤 {item.q}
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-emerald-950 w-fit max-w-[90%] leading-relaxed">
                  💡 {item.a}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setQuestion("Apa pencapaian saya minggu ini?")}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Apa pencapaian saya minggu ini?
            </button>
            <button
              onClick={() => setQuestion("Bagaimana kondisi anggaran pengeluaran saya?")}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Bagaimana kondisi anggaran pengeluaran saya?
            </button>
            <button
              onClick={() => setQuestion("Apa yang sebaiknya saya prioritaskan besok?")}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              Apa yang sebaiknya saya prioritaskan besok?
            </button>
          </div>

          {/* Form Input Pertanyaan */}
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="Tanyakan sesuatu mengenai data aktivitas Anda..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <Button type="submit" size="sm" isLoading={isAsking} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Tanya
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
