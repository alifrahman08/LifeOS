import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding data LifeOS...");

  // 1. Bersihkan data lama jika ada
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.savingsContribution.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.financialAccount.deleteMany();
  await prisma.transactionCategory.deleteMany();
  await prisma.goalMilestone.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.taskSubtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskCategory.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.habitCheckIn.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.announcement.deleteMany();

  const passwordHash = await bcrypt.hash("LifeOS123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminLifeOS123!", 10);
  const demoPasswordHash = await bcrypt.hash("Demo1234!", 10);

  // 2. Buat Pengguna Utama: Budi Santoso
  const user = await prisma.user.create({
    data: {
      email: "budi@lifeos.id",
      name: "Budi Santoso",
      passwordHash: passwordHash,
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "Product Engineer & penggiat gaya hidup mindful. Berfokus pada pertumbuhan berkelanjutan.",
          phone: "081234567890",
          occupation: "Senior Product Engineer",
          location: "Jakarta, Indonesia",
          onboardingCompleted: true,
        },
      },
      preferences: {
        create: {
          currency: "IDR",
          timezone: "Asia/Jakarta",
          firstDayOfWeek: 1, // Senin
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24h",
          theme: "light",
          notifyEmail: true,
          notifyBrowser: true,
          notifyHabits: true,
          notifyBudget: true,
          notifyDeadlines: true,
          aiInsightsEnabled: true,
        },
      },
    },
  });

  // 3. Buat Pengguna Admin
  await prisma.user.create({
    data: {
      email: "admin@lifeos.id",
      name: "Administrator LifeOS",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      profile: {
        create: {
          bio: "Platform Administrator LifeOS. Mengelola operasional dan kestabilan sistem.",
          occupation: "System Operations",
          location: "Jakarta, Indonesia",
          onboardingCompleted: true,
        },
      },
      preferences: {
        create: {
          theme: "light",
          timezone: "Asia/Jakarta",
        },
      },
    },
  });

  // 4. Buat Pengguna Demo
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@lifeos.id",
      name: "Pengguna Demo LifeOS",
      passwordHash: demoPasswordHash,
      role: "DEMO",
      profile: {
        create: {
          bio: "Akun demonstrasi interaktif LifeOS.",
          occupation: "LifeOS Explorer",
          onboardingCompleted: true,
        },
      },
      preferences: {
        create: {
          theme: "light",
          timezone: "Asia/Jakarta",
        },
      },
    },
  });

  console.log("✅ Pengguna berhasil dibuat: budi@lifeos.id, admin@lifeos.id, demo@lifeos.id");

  // Siapkan data untuk Budi Santoso dan Demo User
  for (const targetUser of [user, demoUser]) {
    const userId = targetUser.id;

    // A. Kategori Tugas
    const catWork = await prisma.taskCategory.create({
      data: { userId, name: "Pekerjaan", color: "#2563eb" },
    });
    const catPersonal = await prisma.taskCategory.create({
      data: { userId, name: "Pribadi", color: "#0d9488" },
    });
    const catHealth = await prisma.taskCategory.create({
      data: { userId, name: "Kesehatan", color: "#16a34a" },
    });

    // B. Target & Milestone
    const goal1 = await prisma.goal.create({
      data: {
        userId,
        title: "Kumpulkan Dana Darurat 6 Bulan",
        description: "Menyiapkan dana darurat sebesar Rp 30.000.000 untuk keamanan finansial jangka panjang.",
        category: "FINANCE",
        targetType: "NUMERIC",
        targetValue: 30000000,
        currentValue: 18500000,
        unit: "Rp",
        status: "ACTIVE",
        isAutoCalculated: true,
        autoSource: "SAVINGS",
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 bulan lagi
        milestones: {
          create: [
            { title: "Mencapai Rp 10.000.000", isCompleted: true, completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), order: 1 },
            { title: "Mencapai Rp 20.000.000", isCompleted: false, order: 2 },
            { title: "Target Penuh Rp 30.000.000", isCompleted: false, order: 3 },
          ],
        },
      },
    });

    const goal2 = await prisma.goal.create({
      data: {
        userId,
        title: "Sertifikasi Professional Architect",
        description: "Lulus ujian sertifikasi arsitektur cloud tingkat lanjutan.",
        category: "CAREER",
        targetType: "MILESTONE",
        targetValue: 3,
        currentValue: 1,
        unit: "Modul",
        status: "ACTIVE",
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        milestones: {
          create: [
            { title: "Selesaikan Modul 1-4 & Latihan Soal", isCompleted: true, completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), order: 1 },
            { title: "Simulasi Ujian Tryout Skor > 85%", isCompleted: false, order: 2 },
            { title: "Jadwalkan dan Lulus Ujian Resmi", isCompleted: false, order: 3 },
          ],
        },
      },
    });

    // C. Tugas-tugas Realistis
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Tugas 1: Terlambat (Overdue)
    await prisma.task.create({
      data: {
        userId,
        title: "Kirim Laporan Retrospektif Sprint Q4",
        description: "Rangkum capaian velocity, hambatan, dan perbaikan proses tim ke stakeholder.",
        dueDate: yesterday,
        dueTime: "17:00",
        priority: "HIGH",
        status: "IN_PROGRESS",
        categoryId: catWork.id,
        estimatedDuration: 45,
        subtasks: {
          create: [
            { title: "Ekspor metrik Jira & GitHub PR", isCompleted: true, order: 1 },
            { title: "Tulis ringkasan eksekutif 1 halaman", isCompleted: false, order: 2 },
          ],
        },
      },
    });

    // Tugas 2: Hari ini (Mendesak)
    await prisma.task.create({
      data: {
        userId,
        title: "Review Kontrak Kerja Sama Vendor Cloud",
        description: "Periksa klausul SLA 99.9% dan ketentuan proteksi data ISO 27001.",
        dueDate: today,
        dueTime: "14:00",
        priority: "URGENT",
        status: "IN_PROGRESS",
        categoryId: catWork.id,
        goalId: goal2.id,
        estimatedDuration: 60,
      },
    });

    // Tugas 3: Hari ini (Selesai)
    await prisma.task.create({
      data: {
        userId,
        title: "Daily Standup & Sync Progres Tim",
        description: "Penyelarasan blocker arsitektur database.",
        dueDate: today,
        dueTime: "09:30",
        priority: "MEDIUM",
        status: "COMPLETED",
        completedAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        categoryId: catWork.id,
        estimatedDuration: 30,
        actualDuration: 25,
      },
    });

    // Tugas 4: Besok
    await prisma.task.create({
      data: {
        userId,
        title: "Konsultasi Rencana Finansial Akhir Tahun",
        description: "Evaluasi instrumen investasi reksadana dan portofolio obligasi negara.",
        dueDate: tomorrow,
        dueTime: "16:00",
        priority: "HIGH",
        status: "PLANNED",
        categoryId: catPersonal.id,
        goalId: goal1.id,
        estimatedDuration: 45,
      },
    });

    // Tugas 5: Minggu depan
    await prisma.task.create({
      data: {
        userId,
        title: "Pemeriksaan Kesehatan Rutin (Medical Checkup)",
        description: "Pemeriksaan darah lengkap dan evaluasi kondisi fisik tahunan.",
        dueDate: nextWeek,
        dueTime: "08:00",
        priority: "MEDIUM",
        status: "PLANNED",
        categoryId: catHealth.id,
        estimatedDuration: 90,
      },
    });

    // D. Acara Kalender
    await prisma.calendarEvent.create({
      data: {
        userId,
        title: "Sprint Planning & Prioritas Tim",
        description: "Perencanaan modul LifeOS sprint 12.",
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00
        endTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30
        category: "WORK",
      },
    });

    await prisma.calendarEvent.create({
      data: {
        userId,
        title: "Sesi Fokus: Deep Work Arsitektur",
        description: "Blok waktu tanpa distraksi untuk penyelesaian sistem caching.",
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14:00
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 16:00
        category: "WORK",
      },
    });

    await prisma.calendarEvent.create({
      data: {
        userId,
        title: "Olahraga Pagi & Jogging 5KM",
        description: "Rute taman kota.",
        startTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000),
        endTime: new Date(tomorrow.getTime() + 7 * 60 * 60 * 1000),
        category: "HEALTH",
      },
    });

    // E. Habit Tracker & Check-in Riwayat 14 Hari
    const habitWater = await prisma.habit.create({
      data: {
        userId,
        name: "Minum Air 2.500 ml",
        description: "Menjaga hidrasi harian untuk konsentrasi optimal.",
        category: "HEALTH",
        frequency: "DAILY",
        targetType: "NUMERIC",
        targetValue: 2500,
        unit: "ml",
        color: "#0284c7",
        icon: "droplet",
      },
    });

    const habitReading = await prisma.habit.create({
      data: {
        userId,
        name: "Membaca Buku 20 Menit",
        description: "Membaca buku pengembangan diri atau teknologi.",
        category: "LEARNING",
        frequency: "DAILY",
        targetType: "NUMERIC",
        targetValue: 20,
        unit: "menit",
        color: "#7c3aed",
        icon: "book-open",
      },
    });

    const habitWorkout = await prisma.habit.create({
      data: {
        userId,
        name: "Olahraga Fisik 30 Menit",
        description: "Latihan beban atau kardio.",
        category: "HEALTH",
        frequency: "WEEKDAYS",
        targetType: "BOOLEAN",
        targetValue: 1,
        color: "#16a34a",
        icon: "activity",
      },
    });

    // Buat check-in historis 14 hari terakhir untuk membentuk streak
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];

      // Water: check-in konsisten 14 hari
      await prisma.habitCheckIn.create({
        data: {
          habitId: habitWater.id,
          userId,
          date: dateStr,
          value: 2500,
        },
      });

      // Reading: 12 hari check-in (absen di hari ke-5)
      if (i !== 5) {
        await prisma.habitCheckIn.create({
          data: {
            habitId: habitReading.id,
            userId,
            date: dateStr,
            value: 25,
          },
        });
      }

      // Workout: hanya di hari kerja
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && i !== 2) {
        await prisma.habitCheckIn.create({
          data: {
            habitId: habitWorkout.id,
            userId,
            date: dateStr,
            value: 1,
          },
        });
      }
    }

    // F. Akun Keuangan & Kategori
    const accBca = await prisma.financialAccount.create({
      data: {
        userId,
        name: "Bank BCA Payroll",
        type: "BANK",
        balance: 18500000,
        accountNumber: "8820192831",
        color: "#1e40af",
      },
    });

    const accGopay = await prisma.financialAccount.create({
      data: {
        userId,
        name: "GoPay / E-Wallet",
        type: "E_WALLET",
        balance: 750000,
        accountNumber: "081234567890",
        color: "#059669",
      },
    });

    const accCash = await prisma.financialAccount.create({
      data: {
        userId,
        name: "Dompet Tunai (Cash)",
        type: "CASH",
        balance: 350000,
        color: "#d97706",
      },
    });

    // Kategori Transaksi
    const catGaji = await prisma.transactionCategory.create({
      data: { userId, name: "Gaji & Kompensasi", type: "INCOME", color: "#16a34a", icon: "wallet", isDefault: true },
    });
    const catBonus = await prisma.transactionCategory.create({
      data: { userId, name: "Bonus & Freelance", type: "INCOME", color: "#0d9488", icon: "trending-up", isDefault: true },
    });
    const catMakan = await prisma.transactionCategory.create({
      data: { userId, name: "Makanan & Minuman", type: "EXPENSE", color: "#f97316", icon: "coffee", isDefault: true },
    });
    const catTransport = await prisma.transactionCategory.create({
      data: { userId, name: "Transportasi", type: "EXPENSE", color: "#3b82f6", icon: "car", isDefault: true },
    });
    const catUtilitas = await prisma.transactionCategory.create({
      data: { userId, name: "Tempat Tinggal & Utilitas", type: "EXPENSE", color: "#8b5cf6", icon: "home", isDefault: true },
    });
    const catBelanja = await prisma.transactionCategory.create({
      data: { userId, name: "Belanja Kebutuhan", type: "EXPENSE", color: "#ec4899", icon: "shopping-bag", isDefault: true },
    });
    const catKesehatan = await prisma.transactionCategory.create({
      data: { userId, name: "Kesehatan & Kebugaran", type: "EXPENSE", color: "#14b8a6", icon: "heart", isDefault: true },
    });
    const catHiburan = await prisma.transactionCategory.create({
      data: { userId, name: "Hiburan & Rekreasi", type: "EXPENSE", color: "#eab308", icon: "film", isDefault: true },
    });

    // Anggaran Bulanan Bulan Berjalan
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    await prisma.budget.create({
      data: {
        userId,
        categoryId: catMakan.id,
        month: currentMonth,
        year: currentYear,
        amount: 3500000,
        warningThreshold: 80,
      },
    });

    await prisma.budget.create({
      data: {
        userId,
        categoryId: catTransport.id,
        month: currentMonth,
        year: currentYear,
        amount: 1200000,
        warningThreshold: 80,
      },
    });

    await prisma.budget.create({
      data: {
        userId,
        categoryId: catHiburan.id,
        month: currentMonth,
        year: currentYear,
        amount: 800000,
        warningThreshold: 75,
      },
    });

    // Transaksi Bulan Berjalan
    // Pemasukan
    await prisma.transaction.create({
      data: {
        userId,
        title: "Gaji Bulanan Oktober 2026",
        amount: 22000000,
        type: "INCOME",
        date: new Date(today.getFullYear(), today.getMonth(), 1),
        categoryId: catGaji.id,
        accountId: accBca.id,
        notes: "Gaji pokok & tunjangan kinerja.",
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Proyek Konsultasi Arsitektur",
        amount: 4500000,
        type: "INCOME",
        date: new Date(today.getFullYear(), today.getMonth(), 12),
        categoryId: catBonus.id,
        accountId: accBca.id,
        notes: "Honor advisory tech stack.",
      },
    });

    // Pengeluaran
    await prisma.transaction.create({
      data: {
        userId,
        title: "Sewa Apartemen & Maintenance Bulanan",
        amount: 4500000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 2),
        categoryId: catUtilitas.id,
        accountId: accBca.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Belanja Bulanan Supermarket",
        amount: 1450000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 5),
        categoryId: catMakan.id,
        accountId: accBca.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Bahan Makanan Segar & Buah",
        amount: 680000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 14),
        categoryId: catMakan.id,
        accountId: accGopay.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Makan Siang & Kopi Mingguan",
        amount: 420000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 20),
        categoryId: catMakan.id,
        accountId: accGopay.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Bensin Mobil & Saldo E-Toll",
        amount: 650000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 8),
        categoryId: catTransport.id,
        accountId: accBca.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Langganan Gym & Kelas Yoga",
        amount: 600000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 3),
        categoryId: catKesehatan.id,
        accountId: accBca.id,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        title: "Buku & Kursus Pemrograman",
        amount: 350000,
        type: "EXPENSE",
        date: new Date(today.getFullYear(), today.getMonth(), 10),
        categoryId: catBelanja.id,
        accountId: accGopay.id,
      },
    });

    // G. Target Tabungan (Savings Goals)
    const savings1 = await prisma.savingsGoal.create({
      data: {
        userId,
        name: "Dana Liburan Jepang Akhir Tahun",
        targetAmount: 20000000,
        currentAmount: 14500000,
        targetDate: new Date(today.getFullYear(), 11, 20),
        color: "#0d9488",
        icon: "plane",
        contributions: {
          create: [
            { amount: 5000000, type: "DEPOSIT", date: new Date(today.getFullYear(), today.getMonth() - 2, 5), notes: "Setoran awal" },
            { amount: 5000000, type: "DEPOSIT", date: new Date(today.getFullYear(), today.getMonth() - 1, 5), notes: "Setoran bulan lalu" },
            { amount: 4500000, type: "DEPOSIT", date: new Date(today.getFullYear(), today.getMonth(), 5), notes: "Setoran bulan ini" },
          ],
        },
      },
    });

    // H. Notifikasi Realistis
    await prisma.notification.create({
      data: {
        userId,
        title: "Tenggat Waktu Tugas Terlewati",
        message: "Tugas 'Kirim Laporan Retrospektif Sprint Q4' telah melewati tenggat waktu kemarin.",
        type: "TASK",
        link: "/app/planner",
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Konsistensi Kebiasaan 14 Hari!",
        message: "Selamat! Anda mempertahankan kebiasaan 'Minum Air 2.500 ml' selama 14 hari berturut-turut.",
        type: "HABIT",
        link: "/app/habits",
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Peringatan Batas Anggaran",
        message: "Pengeluaran 'Makanan & Minuman' telah mencapai 73% dari batas anggaran bulanan.",
        type: "BUDGET",
        link: "/app/budgets",
        isRead: true,
      },
    });

    // I. AI Insights Awal
    await prisma.aIInsight.create({
      data: {
        userId,
        title: "Peluang Optimasi Pengeluaran Makanan",
        summary: "Pengeluaran makan di luar dan kopi takeaway meningkat 18% minggu ini dibandingkan minggu lalu.",
        type: "FINANCE",
        sourceData: JSON.stringify({ category: "Makanan & Minuman", increasePercent: 18 }),
        isHelpful: true,
      },
    });

    await prisma.aIInsight.create({
      data: {
        userId,
        title: "Pertahankan Momentum Membaca",
        summary: "Konsistensi membaca buku Anda sangat baik (12 dari 14 hari). Rata-rata 25 menit per sesi.",
        type: "HABIT",
        sourceData: JSON.stringify({ habit: "Membaca Buku", daysCompleted: 12, totalDays: 14 }),
        isHelpful: true,
      },
    });
  }

  // Pengumuman Sistem
  await prisma.announcement.create({
    data: {
      title: "Selamat Datang di LifeOS v2.4",
      content: "Platform manajemen kehidupan terpadu Anda kini hadir dengan Smart Planner, Habit Tracker, dan Analisis Keuangan bertenaga kecerdasan terarah.",
      type: "INFO",
      isActive: true,
    },
  });

  console.log("🎉 Seeding data LifeOS selesai secara sempurna!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
