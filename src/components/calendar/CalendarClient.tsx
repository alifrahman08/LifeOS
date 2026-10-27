"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { createCalendarEventAction, deleteCalendarEventAction } from "@/actions/calendar";
import { formatDateID } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location: string | null;
  category: string;
  taskId: string | null;
  goalId: string | null;
}

interface CalendarClientProps {
  initialEvents: EventItem[];
  tasksWithDates: Array<{
    id: string;
    title: string;
    dueDate: Date;
    dueTime: string | null;
    status: string;
  }>;
}

export function CalendarClient({ initialEvents, tasksWithDates }: CalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:00");
  const [formCategory, setFormCategory] = useState("GENERAL");
  const [formLocation, setFormLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Month grid calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Senin
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const start = new Date(`${formDate}T${formStartTime}:00`);
    const end = new Date(`${formDate}T${formEndTime}:00`);

    try {
      const res = await createCalendarEventAction({
        title: formTitle,
        description: formDesc,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        category: formCategory,
        location: formLocation,
      });

      if (res.success && res.data) {
        setEvents((prev) => [...prev, res.data as EventItem]);
        setIsModalOpen(false);
        setFormTitle("");
        setFormDesc("");
        setFeedback(res.message || "Agenda berhasil dibuat.");
      } else {
        alert(res.message || "Gagal membuat agenda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Hapus agenda ini dari kalender?")) {
      const res = await deleteCalendarEventAction(eventId);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    }
  };

  // Events & Tasks for the selected date
  const eventsOnSelectedDate = events.filter((e) =>
    isSameDay(new Date(e.startTime), selectedDate)
  );

  const tasksOnSelectedDate = tasksWithDates.filter((t) =>
    isSameDay(new Date(t.dueDate), selectedDate)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-800" />
            Kalender & Penjadwalan
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Kelola jadwal, pertemuan, dan sinkronisasi tugas harian dalam satu kalender terpadu.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Agenda
        </Button>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
          {feedback}
        </div>
      )}

      {/* Main Grid: Calendar Month View + Selected Day Agenda Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns - Month Grid */}
        <Card className="lg:col-span-2">
          {/* Calendar Navigation */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: localeId })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
              >
                Hari Ini
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels (Senin - Minggu) */}
          <div className="grid grid-cols-7 border-b border-stone-200 text-center text-xs font-semibold text-stone-500 py-2.5 bg-stone-50/50">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span className="text-emerald-700">Sab</span>
            <span className="text-rose-600">Min</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 text-xs">
            {days.map((day, idx) => {
              const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day));
              const dayTasks = tasksWithDates.filter((t) => isSameDay(new Date(t.dueDate), day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[90px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                    !isCurrentMonthDay ? "bg-stone-50/40 text-stone-300" : "bg-white text-stone-800"
                  } ${isSelected ? "ring-2 ring-emerald-700 ring-inset bg-emerald-50/20" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isToday ? "bg-emerald-800 text-white" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {(dayEvents.length > 0 || dayTasks.length > 0) && (
                      <span className="text-[10px] font-bold text-stone-400">
                        {dayEvents.length + dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium"
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-medium"
                      >
                        ✓ {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: 1 Column - Agenda Detail for Selected Date */}
        <Card className="h-fit">
          <CardHeader className="py-3.5">
            <div>
              <CardTitle className="text-xs font-bold text-stone-900">
                Agenda {formatDateID(selectedDate)}
              </CardTitle>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {eventsOnSelectedDate.length} agenda • {tasksOnSelectedDate.length} tugas jatuh tempo
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* List Agenda Acara */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Acara & Pertemuan
              </span>
              {eventsOnSelectedDate.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">Tidak ada acara pada tanggal ini.</p>
              ) : (
                eventsOnSelectedDate.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs space-y-1 flex items-start justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900">{e.title}</h4>
                      <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(e.startTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(e.endTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {e.location && (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {e.location}
                        </p>
                      )}
                      {e.description && (
                        <p className="text-[11px] text-stone-600 mt-1">{e.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Hapus agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* List Tugas pada Tanggal Tersebut */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Tugas Terjadwal (Smart Planner)
              </span>
              {tasksOnSelectedDate.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">Tidak ada tugas jatuh tempo.</p>
              ) : (
                tasksOnSelectedDate.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-200/60 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-stone-900 block">{t.title}</span>
                      {t.dueTime && (
                        <span className="text-[11px] text-sky-800 font-mono">Pukul {t.dueTime}</span>
                      )}
                    </div>
                    <Badge variant={t.status === "COMPLETED" ? "success" : "default"}>
                      {t.status === "COMPLETED" ? "Selesai" : "Belum Selesai"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Tambah Agenda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Agenda Kalender"
        description="Jadwalkan pertemuan atau sesi fokus dengan deteksi konflik waktu."
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Judul Agenda *"
            required
            placeholder="Contoh: Diskusi Arsitektur Tim"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Deskripsi / Catatan"
            placeholder="Agenda yang akan dibahas..."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          <Input
            label="Tanggal Agenda"
            type="date"
            required
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Waktu Mulai"
              type="time"
              required
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
            />
            <Input
              label="Waktu Selesai"
              type="time"
              required
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">Kategori</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="GENERAL">Umum</option>
                <option value="WORK">Pekerjaan</option>
                <option value="PERSONAL">Pribadi</option>
                <option value="HEALTH">Kesehatan</option>
                <option value="STUDY">Belajar</option>
              </select>
            </div>
            <Input
              label="Lokasi / Ruang Virtual"
              placeholder="Google Meet / Ruang 301"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Agenda
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
