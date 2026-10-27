import { AIInsightRecommendation } from "@/types";
import { formatCurrency } from "./utils";

export interface AIContextData {
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    urgent: number;
    highPriorityTitles: string[];
  };
  habits: {
    total: number;
    completedToday: number;
    averageConsistency: number; // percentage
    strugglingHabitNames: string[];
  };
  finance: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    budgetWarningCategories: string[];
    topExpenseCategory?: string;
  };
  goals: {
    activeCount: number;
    completedCount: number;
    nearDeadlineTitles: string[];
  };
}

/**
 * Generator Insight & Rekomendasi Berbasis Aturan (Transparan, Selalu Tersedia, 100% Offline)
 */
export function generateRuleBasedInsights(context: AIContextData): AIInsightRecommendation[] {
  const recommendations: AIInsightRecommendation[] = [];

  // 1. Analisis Beban Tugas & Keterlambatan
  if (context.tasks.overdue > 0) {
    recommendations.push({
      id: "overdue-warning",
      title: `${context.tasks.overdue} Tugas Terlambat Perlu Perhatian`,
      summary: `Terdapat tugas yang telah melewati tenggat waktu. Selesaikan atau jadwalkan ulang untuk menjaga fokus mental Anda.`,
      category: "OVERLOAD",
      facts: [
        `Tugas terlambat: ${context.tasks.overdue}`,
        `Tugas mendesak saat ini: ${context.tasks.urgent}`,
        `Tugas prioritas utama: ${context.tasks.highPriorityTitles.slice(0, 2).join(", ") || "Belum ada"}`,
      ],
      recommendation:
        "Terapkan strategi 'Time-boxing' 25 menit untuk menyelesaikan tugas dengan prioritas tertinggi hari ini.",
      actionText: "Buka Smart Planner",
      actionUrl: "/app/planner",
    });
  } else if (context.tasks.urgent > 3) {
    recommendations.push({
      id: "workload-heavy",
      title: "Beban Kerja Hari Ini Sangat Padat",
      summary: `Anda memiliki ${context.tasks.urgent} tugas mendesak. Mengurangi perpindahan konteks akan meningkatkan efektivitas.`,
      category: "OVERLOAD",
      facts: [`${context.tasks.urgent} tugas berstatus mendesak aktif`],
      recommendation: "Pilih maksimal 3 tugas terpenting untuk diselesaikan sebelum jam 14:00.",
      actionText: "Atur Prioritas",
      actionUrl: "/app/planner",
    });
  }

  // 2. Analisis Keuangan & Anggaran
  if (context.finance.budgetWarningCategories.length > 0) {
    recommendations.push({
      id: "budget-alert",
      title: `Peringatan Anggaran: ${context.finance.budgetWarningCategories.join(", ")}`,
      summary: `Pengeluaran pada kategori ini telah mendekati atau melebihi batas anggaran yang Anda tetapkan.`,
      category: "FINANCE",
      facts: [
        `Kategori berisiko: ${context.finance.budgetWarningCategories.join(", ")}`,
        `Total pengeluaran bulan ini: ${formatCurrency(context.finance.totalExpense)}`,
        `Arus kas bersih: ${formatCurrency(context.finance.netCashFlow)}`,
      ],
      recommendation:
        "Tunda pengeluaran diskresioner pada kategori ini hingga periode anggaran berikutnya dimulai.",
      actionText: "Periksa Anggaran",
      actionUrl: "/app/budgets",
    });
  } else if (context.finance.netCashFlow > 0) {
    recommendations.push({
      id: "healthy-cashflow",
      title: "Arus Kas Bulanan Berada dalam Kondisi Positif",
      summary: `Pemasukan Anda melebihi pengeluaran dengan surplus ${formatCurrency(context.finance.netCashFlow)}.`,
      category: "FINANCE",
      facts: [
        `Surplus kas: ${formatCurrency(context.finance.netCashFlow)}`,
        `Total pemasukan: ${formatCurrency(context.finance.totalIncome)}`,
      ],
      recommendation: "Alokasikan sebagian surplus ini ke target tabungan atau dana darurat Anda.",
      actionText: "Alokasikan Tabungan",
      actionUrl: "/app/finance",
    });
  }

  // 3. Analisis Kebiasaan (Habits)
  if (context.habits.strugglingHabitNames.length > 0) {
    recommendations.push({
      id: "habit-consistency",
      title: `Perkuat Konsistensi Kebiasaan: ${context.habits.strugglingHabitNames.slice(0, 2).join(", ")}`,
      summary: `Kebiasaan ini memiliki tingkat check-in di bawah 50% dalam seminggu terakhir.`,
      category: "HABIT",
      facts: [
        `Konsistensi rata-rata kebiasaan: ${context.habits.averageConsistency}%`,
        `Kebiasaan perlu perhatian: ${context.habits.strugglingHabitNames.join(", ")}`,
      ],
      recommendation:
        "Gunakan teknik 'Habit Stacking': tautkan kebiasaan baru tepat setelah kebiasaan rutin yang sudah otomatis Anda lakukan setiap hari.",
      actionText: "Buka Habit Tracker",
      actionUrl: "/app/habits",
    });
  } else if (context.habits.total > 0 && context.habits.averageConsistency >= 80) {
    recommendations.push({
      id: "habit-momentum",
      title: "Momentum Kebiasaan Sangat Baik",
      summary: `Tingkat konsistensi kebiasaan Anda mencapai ${context.habits.averageConsistency}%. Pertahankan ritme ini.`,
      category: "HABIT",
      facts: [`Konsistensi 30 hari: ${context.habits.averageConsistency}%`],
      recommendation: "Pertahankan rutinitas stabil ini untuk membentuk kebiasaan jangka panjang yang permanen.",
      actionText: "Lihat Rekap Habit",
      actionUrl: "/app/habits",
    });
  }

  // 4. Analisis Target (Goals)
  if (context.goals.nearDeadlineTitles.length > 0) {
    recommendations.push({
      id: "goal-milestone",
      title: `Tenggat Waktu Target Mendekat: ${context.goals.nearDeadlineTitles[0]}`,
      summary: `Target ini memiliki tanggal jatuh tempo dalam 30 hari ke depan. Pastikan rencana aksi sudah terbagi menjadi subtugas harian.`,
      category: "GOAL",
      facts: [`Target aktif: ${context.goals.activeCount}`, `Target mendekati deadline: ${context.goals.nearDeadlineTitles.join(", ")}`],
      recommendation: "Pecah target menjadi 2-3 milestone kecil yang dapat diselesaikan minggu ini.",
      actionText: "Evaluasi Target",
      actionUrl: "/app/goals",
    });
  }

  // Fallback umum jika belum banyak data
  if (recommendations.length === 0) {
    recommendations.push({
      id: "welcome-focus",
      title: "Rencanakan Hari Ini dengan Tenang",
      summary: "LifeOS siap membantu Anda mengelola hari dengan fokus dan kejelasan.",
      category: "FOCUS",
      facts: ["Belum ada peringatan kritis pada akun Anda."],
      recommendation: "Mulai hari dengan mencatat 3 tugas utama dan menyelesaikan check-in kebiasaan pagi Anda.",
      actionText: "Mulai Rencana Hari Ini",
      actionUrl: "/app/planner",
    });
  }

  return recommendations;
}

/**
 * Panggilan AI Opsional (Gemini / LLM Provider)
 * Jika AI_API_KEY tidak ada atau gagal, otomatis menggunakan generator rule-based.
 */
export async function getAIRecommendations(context: AIContextData): Promise<{
  source: "AI" | "RULE_BASED";
  recommendations: AIInsightRecommendation[];
  explanation: string;
}> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      source: "RULE_BASED",
      recommendations: generateRuleBasedInsights(context),
      explanation:
        "Analisis dihasilkan secara otomatis oleh sistem logika LifeOS berdasarkan data faktual Anda (tanpa pengiriman data ke pihak ketiga).",
    };
  }

  try {
    // Abstraksi Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.AI_MODEL || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Anda adalah asisten LifeOS pribadi yang bijak, tenang, dan praktis.
Berdasarkan data berikut:
${JSON.stringify(context, null, 2)}

Berikan 3 rekomendasi actionable dalam format JSON Array sesuai skema ini:
[
  {
    "id": "string-unik",
    "title": "Judul singkat",
    "summary": "Ringkasan situasi",
    "category": "OVERLOAD" | "FINANCE" | "HABIT" | "GOAL" | "FOCUS",
    "facts": ["fakta 1", "fakta 2"],
    "recommendation": "Saran langkah praktis",
    "actionText": "Teks tombol aksi",
    "actionUrl": "URL rute (/app/planner, /app/finance, /app/habits, dsb)"
  }
]
Hanya keluarkan JSON valid tanpa backticks markdown tambahan.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Format respons AI tidak valid");

    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: AIInsightRecommendation[] = JSON.parse(cleanedText);

    return {
      source: "AI",
      recommendations: parsed,
      explanation: "Analisis dihasilkan oleh kecerdasan buatan terenkripsi berdasarkan parameter terukur Anda.",
    };
  } catch (error) {
    console.warn("AI Provider call failed, falling back to rule-based insights:", error);
    return {
      source: "RULE_BASED",
      recommendations: generateRuleBasedInsights(context),
      explanation:
        "Sistem menggunakan analisis berbasis aturan terpercaya karena integrasi AI eksternal sedang offline.",
    };
  }
}
