import { describe, it, expect } from "vitest";
import { calculateTaskPriority, getFocusTasksToday } from "../lib/priority";

describe("Algoritma Prioritas Cerdas (Smart Planner Priority)", () => {
  const baseDate = new Date("2026-10-27T00:00:00.000Z");

  it("Memberikan prioritas URGENT dan mendeteksi tugas terlambat", () => {
    const overdueTask = {
      id: "1",
      title: "Laporan Terlambat",
      dueDate: new Date("2026-10-25T00:00:00.000Z"),
      manualPriority: "HIGH" as const,
      status: "IN_PROGRESS",
    };

    const result = calculateTaskPriority(overdueTask, baseDate);
    expect(result.isOverdue).toBe(true);
    expect(result.daysUntilDue).toBe(-2);
    expect(result.level).toBe("URGENT");
    expect(result.reason).toContain("Terlambat 2 hari");
    expect(result.score).toBeGreaterThanOrEqual(65);
  });

  it("Mendeteksi tugas jatuh tempo hari ini", () => {
    const todayTask = {
      id: "2",
      title: "Review Sprint Hari Ini",
      dueDate: new Date("2026-10-27T00:00:00.000Z"),
      manualPriority: "MEDIUM" as const,
      status: "IN_PROGRESS",
    };

    const result = calculateTaskPriority(todayTask, baseDate);
    expect(result.isOverdue).toBe(false);
    expect(result.daysUntilDue).toBe(0);
    expect(result.reason).toContain("Jatuh tempo hari ini");
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it("Memberikan skor 0 untuk tugas yang sudah selesai", () => {
    const completedTask = {
      id: "3",
      title: "Tugas yang Sudah Selesai",
      dueDate: new Date("2026-10-20T00:00:00.000Z"),
      manualPriority: "URGENT" as const,
      status: "COMPLETED",
    };

    const result = calculateTaskPriority(completedTask, baseDate);
    expect(result.score).toBe(0);
    expect(result.reason).toBe("Tugas telah diselesaikan");
  });

  it("Memberikan dorongan quick win untuk tugas ringkas yang mendekati deadline", () => {
    const quickTask = {
      id: "4",
      title: "Kirim Email Konfirmasi",
      dueDate: new Date("2026-10-28T00:00:00.000Z"),
      manualPriority: "MEDIUM" as const,
      status: "PLANNED",
      estimatedDuration: 15, // 15 menit
    };

    const result = calculateTaskPriority(quickTask, baseDate);
    expect(result.reason).toContain("Quick win (≤ 30 menit)");
  });

  it("Mengurutkan tugas fokus hari ini berdasarkan skor tertinggi", () => {
    const tasks = [
      {
        id: "a",
        title: "Tugas Santai Bulan Depan",
        dueDate: new Date("2026-11-20T00:00:00.000Z"),
        manualPriority: "LOW" as const,
        status: "PLANNED",
      },
      {
        id: "b",
        title: "Tugas Terlambat Kemarin",
        dueDate: new Date("2026-10-26T00:00:00.000Z"),
        manualPriority: "HIGH" as const,
        status: "IN_PROGRESS",
      },
      {
        id: "c",
        title: "Tugas Jatuh Tempo Hari Ini",
        dueDate: new Date("2026-10-27T00:00:00.000Z"),
        manualPriority: "URGENT" as const,
        status: "IN_PROGRESS",
      },
    ];

    const focusList = getFocusTasksToday(tasks, baseDate);
    expect(focusList.length).toBe(3);
    // 'c' (score 70) dan 'b' (score 65) berada di atas 'a' (score 7)
    expect(focusList[0].id).toBe("c");
    expect(focusList[1].id).toBe("b");
    expect(focusList[2].id).toBe("a");
  });
});
