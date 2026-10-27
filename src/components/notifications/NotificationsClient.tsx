"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Flame,
  Wallet,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateID } from "@/lib/utils";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/actions/notifications";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsReadAction();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteNotificationAction(id);
    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "HABIT":
        return <Flame className="w-4 h-4 text-amber-600" />;
      case "BUDGET":
        return <Wallet className="w-4 h-4 text-amber-700" />;
      case "GOAL":
        return <Target className="w-4 h-4 text-purple-700" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-800" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-800" />
            Pusat Notifikasi & Pengingat
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Pemberitahuan tenggat waktu, pengingat kebiasaan harian, dan peringatan anggaran.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs">
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 text-xs font-semibold">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            filter === "ALL"
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            filter === "UNREAD"
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* List Notifikasi */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
            <Bell className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-800">Tidak ada notifikasi</h3>
            <p className="text-xs text-stone-500 mt-1">
              {filter === "UNREAD"
                ? "Semua notifikasi telah Anda baca."
                : "Belum ada pemberitahuan baru di akun Anda."}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all flex items-start justify-between gap-4 ${
                !item.isRead ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-stone-200"
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-xl bg-white border border-stone-200 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                    <span>{formatDateID(item.createdAt)}</span>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => !item.isRead && handleMarkRead(item.id)}
                        className="font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        Buka data terkait <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="p-1.5 text-stone-400 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Tandai dibaca"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus notifikasi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

