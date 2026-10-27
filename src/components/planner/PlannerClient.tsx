"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Filter,
  Search,
  CheckSquare,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Tag,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDateID, formatShortDateID } from "@/lib/utils";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  toggleTaskCompleteAction,
  toggleSubtaskAction,
  createSubtaskAction,
} from "@/actions/tasks";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  dueTime: string | null;
  priority: string;
  status: string;
  estimatedDuration: number | null;
  actualDuration: number | null;
  categoryId: string | null;
  category?: { id: string; name: string; color: string } | null;
  goalId: string | null;
  goal?: { id: string; title: string } | null;
  subtasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    order: number;
  }>;
  priorityInfo: {
    score: number;
    level: string;
    reason: string;
    isOverdue: boolean;
    daysUntilDue: number | null;
  };
}

interface PlannerClientProps {
  initialTasks: TaskItem[];
  categories: Array<{ id: string; name: string; color: string }>;
  goals: Array<{ id: string; title: string }>;
}

export function PlannerClient({ initialTasks, categories, goals }: PlannerClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"smart" | "date" | "priority">("smart");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDueTime, setFormDueTime] = useState("");
  const [formPriority, setFormPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [formCategory, setFormCategory] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string) => {
    const res = await toggleTaskCompleteAction(taskId);
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
              }
            : t
        )
      );
    }
  };

  // Toggle Subtask
  const handleToggleSubtask = async (subtaskId: string, taskId: string) => {
    const res = await toggleSubtaskAction(subtaskId);
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
              ),
            };
          }
          return t;
        })
      );
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      const res = await deleteTaskAction(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    }
  };

  // Create Task Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createTaskAction({
        title: formTitle,
        description: formDesc,
        dueDate: formDueDate || undefined,
        dueTime: formDueTime || undefined,
        priority: formPriority,
        categoryId: formCategory || undefined,
        goalId: formGoal || undefined,
        estimatedDuration: formDuration ? Number(formDuration) : undefined,
      });

      if (res.success && res.data) {
        setIsCreateOpen(false);
        // Refresh page to load fully calculated task with relations
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        filterStatus === "ALL"
          ? true
          : filterStatus === "ACTIVE"
          ? task.status !== "COMPLETED" && task.status !== "CANCELLED"
          : task.status === filterStatus;

      const matchesCategory =
        filterCategory === "ALL" ? true : task.categoryId === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "smart") {
        return b.priorityInfo.score - a.priorityInfo.score;
      }
      if (sortBy === "date") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Priority
      const pWeights = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority as keyof typeof pWeights] || 0) - (pWeights[a.priority as keyof typeof pWeights] || 0);
    });

  const overdueCount = tasks.filter((t) => t.priorityInfo.isOverdue && t.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            Smart Planner
            {overdueCount > 0 && (
              <Badge variant="danger" className="text-xs">
                {overdueCount} Terlambat
              </Badge>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manajemen tugas terstruktur dengan algoritma prioritas transparan dan pelacak subtugas.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Tugas Baru
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif (Belum Selesai)</option>
            <option value="COMPLETED">Selesai</option>
            <option value="INBOX">Inbox</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Urutan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none"
          >
            <option value="smart">Prioritas Cerdas (Smart)</option>
            <option value="date">Tenggat Waktu</option>
            <option value="priority">Tingkat Urgensi</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
            <CheckSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-800">Tidak ada tugas ditemukan</h3>
            <p className="text-xs text-stone-500 mt-1">
              Cobalah ubah filter pencarian atau tambahkan tugas baru untuk mulai merencanakan.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                task.status === "COMPLETED"
                  ? "border-stone-200 bg-stone-50/60 opacity-60"
                  : task.priorityInfo.isOverdue
                  ? "border-rose-300 bg-rose-50/30 shadow-xs"
                  : "border-stone-200/90 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    task.status === "COMPLETED"
                      ? "bg-emerald-700 border-emerald-700 text-white"
                      : "border-stone-300 bg-white hover:border-emerald-600"
                  }`}
                >
                  {task.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-2 flex-1">
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        task.status === "COMPLETED" ? "line-through text-stone-400" : "text-stone-900"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {task.dueDate && (
                      <span
                        className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                          task.priorityInfo.isOverdue
                            ? "bg-rose-100 text-rose-800 font-bold"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {task.dueTime ? `${task.dueTime} • ` : ""}
                        {formatShortDateID(task.dueDate)}
                      </span>
                    )}

                    {task.estimatedDuration && (
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        ⏱ {task.estimatedDuration} Menit
                      </span>
                    )}

                    {task.category && (
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: task.category.color }}
                      >
                        {task.category.name}
                      </span>
                    )}

                    {task.goal && (
                      <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Target className="w-3 h-3" />
                        {task.goal.title}
                      </span>
                    )}

                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-200/50">
                      Smart: {task.priorityInfo.reason}
                    </span>
                  </div>

                  {/* Subtasks Checklist */}
                  {task.subtasks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100 space-y-1.5">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                        Subtugas ({task.subtasks.filter((st) => st.isCompleted).length} / {task.subtasks.length}):
                      </span>
                      <div className="space-y-1">
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => handleToggleSubtask(st.id, task.id)}
                            className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:text-stone-950"
                          >
                            <input
                              type="checkbox"
                              checked={st.isCompleted}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-0"
                            />
                            <span className={st.isCompleted ? "line-through text-stone-400" : ""}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons & Priority Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <Badge
                  variant={
                    task.priorityInfo.level === "URGENT"
                      ? "danger"
                      : task.priorityInfo.level === "HIGH"
                      ? "warning"
                      : "default"
                  }
                >
                  {task.priorityInfo.level}
                </Badge>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus tugas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Tugas Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Tugas Baru"
        description="Tambahkan tugas ke Smart Planner dengan deadline dan estimasi durasi."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Judul Tugas *"
            required
            placeholder="Contoh: Buat Laporan Sprint"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <Textarea
            label="Deskripsi / Catatan Tambahan"
            placeholder="Rincian yang perlu diingat..."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tenggat Waktu (Deadline)"
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
            />
            <Input
              label="Jam (Opsional)"
              type="time"
              value={formDueTime}
              onChange={(e) => setFormDueTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Prioritas Manual
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="LOW">Rendah (Low)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HIGH">Tinggi (High)</option>
                <option value="URGENT">Mendesak (Urgent)</option>
              </select>
            </div>

            <Input
              label="Estimasi Durasi (Menit)"
              type="number"
              placeholder="Contoh: 45"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Kategori Tugas
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Tautkan Target (Opsional)
              </label>
              <select
                value={formGoal}
                onChange={(e) => setFormGoal(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="">Tidak ada target</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

