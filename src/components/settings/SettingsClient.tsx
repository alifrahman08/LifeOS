"use client";

import React, { useState } from "react";
import {
  Settings,
  Globe,
  Bell,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  updatePreferencesAction,
  exportUserDataAction,
  deleteAccountAction,
} from "@/actions/profile";

interface SettingsClientProps {
  preferences: {
    currency: string;
    timezone: string;
    theme: string;
    notifyEmail: boolean;
    notifyBrowser: boolean;
    notifyHabits: boolean;
    notifyBudget: boolean;
    notifyDeadlines: boolean;
    aiInsightsEnabled: boolean;
  };
}

export function SettingsClient({ preferences: initialPrefs }: SettingsClientProps) {
  const [currency, setCurrency] = useState(initialPrefs.currency || "IDR");
  const [timezone, setTimezone] = useState(initialPrefs.timezone || "Asia/Jakarta");
  const [theme, setTheme] = useState(initialPrefs.theme || "light");
  const [notifyHabits, setNotifyHabits] = useState(initialPrefs.notifyHabits);
  const [notifyBudget, setNotifyBudget] = useState(initialPrefs.notifyBudget);
  const [notifyDeadlines, setNotifyDeadlines] = useState(initialPrefs.notifyDeadlines);
  const [aiEnabled, setAiEnabled] = useState(initialPrefs.aiInsightsEnabled);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    try {
      const res = await updatePreferencesAction({
        currency,
        timezone,
        theme,
        notifyHabits,
        notifyBudget,
        notifyDeadlines,
        aiInsightsEnabled: aiEnabled,
      });

      if (res.success) {
        setSuccessMsg("Preferensi berhasil disimpan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await exportUserDataAction();
      if (res.success && res.data?.exportJson) {
        const blob = new Blob([res.data.exportJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `LifeOS_Export_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteAccountAction(deletePassword);
      if (res.success) {
        window.location.href = "/";
      } else {
        setDeleteError(res.message || "Gagal menghapus akun. Periksa kata sandi Anda.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-800" />
          Pengaturan & Privasi Data
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Sesuaikan zona waktu, preferensi notifikasi, dan kelola kepemilikan data Anda.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {successMsg}
        </div>
      )}

      {/* Preferensi Regional & Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-800" />
            Preferensi Format & Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Mata Uang</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                >
                  <option value="IDR">Rupiah Indonesia (Rp - IDR)</option>
                  <option value="USD">US Dollar ($ - USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Zona Waktu</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                >
                  <option value="Asia/Jakarta">WIB (Asia/Jakarta, UTC+7)</option>
                  <option value="Asia/Makassar">WITA (Asia/Makassar, UTC+8)</option>
                  <option value="Asia/Jayapura">WIT (Asia/Jayapura, UTC+9)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-3">
              <span className="text-xs font-bold text-stone-900 block">Notifikasi Pengingat</span>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDeadlines}
                    onChange={(e) => setNotifyDeadlines(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>Kirim peringatan tugas yang mendekati tenggat waktu</span>
                </label>
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyBudget}
                    onChange={(e) => setNotifyBudget(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>Kirim peringatan jika pengeluaran mendekati ambang batas anggaran</span>
                </label>
                <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyHabits}
                    onChange={(e) => setNotifyHabits(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700"
                  />
                  <span>Pengingat check-in kebiasaan harian</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-900 block">Fitur AI Insights</span>
                <span className="text-[11px] text-stone-500">
                  Aktifkan analisis otomatis dan rekomendasi terarah mingguan.
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <Button type="submit" size="md" isLoading={isLoading}>
                Simpan Preferensi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ekspor Data Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-800" />
            Ekspor Data Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-stone-600 leading-relaxed">
            Unduh salinan lengkap seluruh data tugas, check-in habit, transaksi keuangan, target, dan preferensi akun Anda dalam format JSON terstruktur.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            isLoading={isExporting}
            className="text-xs font-semibold gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Arsip JSON Lengkap
          </Button>
        </CardContent>
      </Card>

      {/* Zona Bahaya: Hapus Akun */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardHeader className="border-b border-rose-100">
          <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Zona Bahaya: Hapus Akun Permanen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          <p className="text-xs text-stone-600 leading-relaxed">
            Menghapus akun akan melenyapkan seluruh data tugas, transaksi keuangan, catatan kebiasaan, dan target Anda secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs"
          >
            Hapus Akun Saya Permanen
          </Button>
        </CardContent>
      </Card>

      {/* Modal Konfirmasi Hapus Akun */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Penghapusan Akun"
        description="Masukkan kata sandi akun Anda untuk memverifikasi penghapusan permanen."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {deleteError}
            </div>
          )}

          <Input
            label="Kata Sandi Akun"
            type="password"
            required
            placeholder="••••••••"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="danger" size="md" isLoading={isDeleting}>
              Hapus Akun Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
