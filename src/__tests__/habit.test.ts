import { describe, it, expect } from "vitest";
import { calculateHabitStats, isHabitScheduledForDate } from "../lib/habit";

describe("Habit Tracker & Perhitungan Streak", () => {
  const refDate = new Date("2026-10-27T10:00:00.000Z"); // Selasa

  const sampleHabit = {
    id: "h1",
    name: "Minum Air 2L",
    frequency: "DAILY",
    targetType: "NUMERIC",
    targetValue: 2000,
    isArchived: false,
    createdAt: new Date("2026-10-01"),
  };

  it("Menghitung current streak dan best streak dengan benar", () => {
    // Check-in 4 hari berturut-turut hingga hari ini
    const checkIns = [
      { date: "2026-10-24", value: 2000 },
      { date: "2026-10-25", value: 2500 },
      { date: "2026-10-26", value: 2000 },
      { date: "2026-10-27", value: 2000 },
    ];

    const stats = calculateHabitStats(sampleHabit, checkIns, refDate);
    expect(stats.completedToday).toBe(true);
    expect(stats.currentStreak).toBe(4);
    expect(stats.bestStreak).toBe(4);
  });

  it("Mempertahankan streak kemarin jika hari ini belum check-in", () => {
    // Check-in kemarin dan lusa, hari ini belum
    const checkIns = [
      { date: "2026-10-25", value: 2000 },
      { date: "2026-10-26", value: 2000 },
    ];

    const stats = calculateHabitStats(sampleHabit, checkIns, refDate);
    expect(stats.completedToday).toBe(false);
    expect(stats.currentStreak).toBe(2);
  });

  it("Mereset current streak ke 0 jika kemarin terlewat", () => {
    // Check-in 3 hari yang lalu, kemarin dan hari ini kosong
    const checkIns = [{ date: "2026-10-24", value: 2000 }];

    const stats = calculateHabitStats(sampleHabit, checkIns, refDate);
    expect(stats.completedToday).toBe(false);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(1);
  });

  it("Menghormati target numerik (tidak dihitung jika di bawah target)", () => {
    const checkIns = [
      { date: "2026-10-27", value: 1500 }, // target 2000, jadi belum memenuhi
    ];

    const stats = calculateHabitStats(sampleHabit, checkIns, refDate);
    expect(stats.completedToday).toBe(false);
    expect(stats.currentStreak).toBe(0);
  });

  it("Mendukung jadwal hari kerja (WEEKDAYS)", () => {
    const weekdayHabit = {
      ...sampleHabit,
      frequency: "WEEKDAYS",
    };

    const tuesday = new Date("2026-10-27");
    const sunday = new Date("2026-10-25");

    expect(isHabitScheduledForDate(weekdayHabit, tuesday)).toBe(true);
    expect(isHabitScheduledForDate(weekdayHabit, sunday)).toBe(false);
  });
});

