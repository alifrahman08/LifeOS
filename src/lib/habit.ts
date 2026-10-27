import { format, subDays, parseISO, isSameDay } from "date-fns";
import { HabitStats } from "@/types";

export interface HabitData {
  id: string;
  name: string;
  frequency: string; // DAILY, WEEKDAYS, WEEKENDS, CUSTOM
  customDays?: string | null;
  targetType: string;
  targetValue?: number | null;
  isArchived: boolean;
  createdAt: Date | string;
}

export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  value: number;
}

/**
 * Menghitung streak saat ini, streak terbaik, dan persentase keberhasilan habit
 */
export function calculateHabitStats(
  habit: HabitData,
  checkIns: CheckInRecord[],
  referenceDate: Date = new Date()
): HabitStats {
  const checkInDateSet = new Set(
    checkIns
      .filter((c) => {
        if (habit.targetType === "NUMERIC" && habit.targetValue) {
          return c.value >= habit.targetValue;
        }
        return c.value > 0;
      })
      .map((c) => c.date)
  );

  const todayStr = format(referenceDate, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(referenceDate, 1), "yyyy-MM-dd");

  const completedToday = checkInDateSet.has(todayStr);

  const todayRecord = checkIns.find((c) => c.date === todayStr);
  const todayValue = todayRecord ? todayRecord.value : 0;

  // 1. Hitung Current Streak
  let currentStreak = 0;
  // Mulai periksa dari hari ini jika sudah check-in, atau kemarin jika belum hari ini
  let checkDate = completedToday ? referenceDate : subDays(referenceDate, 1);

  // Jika kemarin juga tidak check-in (dan hari ini belum), streak saat ini = 0
  if (!completedToday && !checkInDateSet.has(yesterdayStr)) {
    currentStreak = 0;
  } else {
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      // Periksa apakah habit terjadwal pada hari ini
      if (isHabitScheduledForDate(habit, checkDate)) {
        if (checkInDateSet.has(dateStr)) {
          currentStreak++;
        } else {
          // Putus rantai streak
          break;
        }
      }
      checkDate = subDays(checkDate, 1);
      // Batasi pencarian hingga 365 hari ke belakang
      if (currentStreak >= 365) break;
    }
  }

  // 2. Hitung Best Streak sepanjang masa
  const sortedDates = Array.from(checkInDateSet).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const d = parseISO(dateStr);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        // Cek apakah hari di antaranya bukan jadwal habit
        let unbroken = true;
        for (let i = 1; i < diffDays; i++) {
          const intermediateDate = new Date(lastDate.getTime() + i * 24 * 3600 * 1000);
          if (isHabitScheduledForDate(habit, intermediateDate)) {
            unbroken = false;
            break;
          }
        }
        if (unbroken) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
    }
    lastDate = d;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  // 3. Hitung Tingkat Penyelesaian 30 Hari Terakhir
  let scheduledDaysLast30 = 0;
  let completedDaysLast30 = 0;

  for (let i = 0; i < 30; i++) {
    const d = subDays(referenceDate, i);
    if (isHabitScheduledForDate(habit, d)) {
      scheduledDaysLast30++;
      const dStr = format(d, "yyyy-MM-dd");
      if (checkInDateSet.has(dStr)) {
        completedDaysLast30++;
      }
    }
  }

  const completionRate =
    scheduledDaysLast30 > 0 ? Math.round((completedDaysLast30 / scheduledDaysLast30) * 100) : 0;

  return {
    currentStreak,
    bestStreak,
    totalCheckIns: checkIns.length,
    completionRate,
    completedToday,
    todayValue,
  };
}

/**
 * Memeriksa apakah habit dijadwalkan pada hari tertentu
 */
export function isHabitScheduledForDate(habit: HabitData, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

  switch (habit.frequency) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "WEEKENDS":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "CUSTOM":
      if (!habit.customDays) return true;
      try {
        const days: number[] = JSON.parse(habit.customDays);
        return days.includes(dayOfWeek);
      } catch {
        return true;
      }
    default:
      return true;
  }
}
