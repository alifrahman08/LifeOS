"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  CheckCircle2,
  AlertCircle,
  Activity,
  Plus,
  Trash2,
  Megaphone,
  FileText,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { formatDateID } from "@/lib/utils";
import { toggleUserStatusAction, createAnnouncementAction, deleteAnnouncementAction } from "@/actions/admin";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  _count: {
    tasks: number;
    habits: number;
    transactions: number;
  };
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
}

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: Date;
  user?: { email: string } | null;
}

interface AdminClientProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTasks: number;
    totalHabits: number;
    totalTransactions: number;
  };
  users: UserItem[];
  announcements: AnnouncementItem[];
  auditLogs: AuditLogItem[];
}

export function AdminClient({
  stats,
  users: initialUsers,
  announcements: initialAnnouncements,
  auditLogs,
}: AdminClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [tab, setTab] = useState<"users" | "announcements" | "audit">("users");

  // Announcement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<"INFO" | "UPDATE" | "ALERT">("INFO");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleUser = async (userId: string) => {
    const res = await toggleUserStatusAction(userId);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
      );
    } else {
      alert(res.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createAnnouncementAction({
        title: annTitle,
        content: annContent,
        type: annType,
      });

      if (res.success && res.data) {
        setAnnouncements((prev) => [res.data as AnnouncementItem, ...prev]);
        setIsModalOpen(false);
        setAnnTitle("");
        setAnnContent("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Hapus pengumuman ini?")) {
      const res = await deleteAnnouncementAction(id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Ruang Kerja LifeOS
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-700" />
            Panel Administrasi & Pengawasan Platform
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Monitoring kesehatan operasional dan pengelolaan status akun secara terotorisasi.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Terbitkan Pengumuman
        </Button>
      </div>

      {/* Stats Agregat */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Akun Pengguna"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} akun aktif`}
          icon={<Users className="w-4 h-4 text-purple-700" />}
        />
        <StatCard
          title="Tugas Agregat"
          value={stats.totalTasks}
          subtitle="Dibuat di platform"
          icon={<Activity className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Kebiasaan Terlacak"
          value={stats.totalHabits}
          subtitle="Konsistensi harian"
          icon={<CheckCircle2 className="w-4 h-4 text-sky-700" />}
        />
        <StatCard
          title="Transaksi Dicatat"
          value={stats.totalTransactions}
          subtitle="Data privat terenkripsi"
          icon={<Lock className="w-4 h-4 text-stone-700" />}
        />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setTab("users")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            tab === "users" ? "bg-purple-100 text-purple-900" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Pengelolaan Pengguna ({users.length})
        </button>
        <button
          onClick={() => setTab("announcements")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            tab === "announcements" ? "bg-purple-100 text-purple-900" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Pengumuman Sistem ({announcements.length})
        </button>
        <button
          onClick={() => setTab("audit")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            tab === "audit" ? "bg-purple-100 text-purple-900" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          Audit Log Keamanan ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {tab === "users" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Aktivitas Agregat</th>
                  <th className="py-3 px-4">Terdaftar</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block">{u.name}</span>
                      <span className="text-[11px] text-stone-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isActive ? "success" : "danger"}>
                        {u.isActive ? "Aktif" : "Dinonaktifkan"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-stone-600">
                      {u._count.tasks} tugas • {u._count.habits} habit • {u._count.transactions} transaksi
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {formatDateID(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant={u.isActive ? "danger" : "outline"}
                        onClick={() => handleToggleUser(u.id)}
                        className="text-[11px] h-7 px-2"
                      >
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: ANNOUNCEMENTS */}
      {tab === "announcements" && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info">{ann.type}</Badge>
                  <span className="text-xs text-stone-400 font-medium">
                    {formatDateID(ann.createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900">{ann.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{ann.content}</p>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(ann.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Hapus pengumuman"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {tab === "audit" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">Rincian Terenkripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-900">{log.action}</td>
                    <td className="py-2.5 px-4 text-stone-600">{log.entity}</td>
                    <td className="py-2.5 px-4 text-stone-500 truncate max-w-xs">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Terbitkan Pengumuman */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Pengumuman Platform"
        description="Pemberitahuan ini akan tampil di dashboard seluruh pengguna LifeOS."
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Judul Pengumuman *"
            required
            placeholder="Contoh: Pembaruan Sistem LifeOS v2.4"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">Tipe Informasi</label>
            <select
              value={annType}
              onChange={(e) => setAnnType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
            >
              <option value="INFO">Informasi Umum (INFO)</option>
              <option value="UPDATE">Pembaruan Fitur (UPDATE)</option>
              <option value="ALERT">Pemberitahuan Penting (ALERT)</option>
            </select>
          </div>

          <Textarea
            label="Isi Pengumuman *"
            required
            placeholder="Tuliskan pesan yang ingin disampaikan..."
            value={annContent}
            onChange={(e) => setAnnContent(e.target.value)}
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Terbitkan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

