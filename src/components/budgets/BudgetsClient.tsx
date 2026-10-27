"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { createBudgetAction, deleteBudgetAction } from "@/actions/finance";

interface BudgetUsageItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  warningThreshold: number;
  isWarning: boolean;
  isExceeded: boolean;
}

interface BudgetsClientProps {
  initialBudgets: BudgetUsageItem[];
  categories: Array<{ id: string; name: string }>;
  month: number;
  year: number;
}

export function BudgetsClient({
  initialBudgets,
  categories,
  month,
  year,
}: BudgetsClientProps) {
  const [budgets, setBudgets] = useState<BudgetUsageItem[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formThreshold, setFormThreshold] = useState("80");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBudget = budgets.reduce((acc, b) => acc + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory) {
      alert("Pilih kategori pengeluaran.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createBudgetAction({
        categoryId: formCategory,
        amount: Number(formAmount),
        month,
        year,
        warningThreshold: Number(formThreshold),
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert(res.message || "Gagal menyimpan anggaran.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Hapus batasan anggaran untuk kategori ini?")) {
      const res = await deleteBudgetAction(id);
      if (res.success) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
    }
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-amber-700" />
            Anggaran Bulanan ({monthNames[month - 1]} {year})
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Kendalikan pengeluaran dengan batas anggaran terarah dan peringatan ambang batas otomatis.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Atur Anggaran Kategori
        </Button>
      </div>

      {/* Ringkasan Keseluruhan Anggaran */}
      <Card className="bg-gradient-to-b from-white to-stone-50/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Total Alokasi Anggaran Bulan Ini
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-sm text-stone-500">
                  dari batas {formatCurrency(totalBudget)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="p-3 bg-white rounded-xl border text-center">
                <span className="text-stone-400 block text-[10px]">Sisa Anggaran</span>
                <span className="text-emerald-700 font-bold text-sm">
                  {formatCurrency(totalRemaining)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border text-center">
                <span className="text-stone-400 block text-[10px]">Tingkat Penggunaan</span>
                <span className="text-stone-900 font-bold text-sm">{overallPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <ProgressBar
              value={overallPercentage}
              color={
                overallPercentage >= 100
                  ? "danger"
                  : overallPercentage >= 80
                  ? "warning"
                  : "primary"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid Anggaran Per Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center bg-white rounded-xl border border-stone-200">
            <PieIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-stone-800">Belum ada anggaran yang diatur</h3>
            <p className="text-xs text-stone-500 mt-1">
              Atur batas anggaran untuk kategori seperti Makanan & Minuman, Transportasi, atau Hiburan.
            </p>
          </div>
        ) : (
          budgets.map((b) => (
            <Card
              key={b.id}
              className={`p-5 transition-all ${
                b.isExceeded
                  ? "border-rose-300 bg-rose-50/20"
                  : b.isWarning
                  ? "border-amber-300 bg-amber-50/20"
                  : "hover:border-stone-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: b.categoryColor }}
                  />
                  <h3 className="text-sm font-bold text-stone-900">{b.categoryName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {b.isExceeded ? (
                    <Badge variant="danger">Melebihi Anggaran</Badge>
                  ) : b.isWarning ? (
                    <Badge variant="warning">Mendekati Batas</Badge>
                  ) : (
                    <Badge variant="success">Aman</Badge>
                  )}
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Hapus anggaran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    Terpakai: {formatCurrency(b.spentAmount)}
                  </span>
                  <span className="text-stone-500 font-medium">
                    Batas: {formatCurrency(b.budgetAmount)} ({b.usagePercentage}%)
                  </span>
                </div>

                <ProgressBar
                  value={b.usagePercentage}
                  color={b.isExceeded ? "danger" : b.isWarning ? "warning" : "primary"}
                />

                <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                  <span>
                    Sisa: <strong>{formatCurrency(b.remainingAmount)}</strong>
                  </span>
                  <span>Ambang Peringatan: {b.warningThreshold}%</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Atur Anggaran */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Atur Anggaran Kategori"
        description="Tentukan batas pengeluaran maksimum bulanan untuk kategori tertentu."
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Pilih Kategori Pengeluaran *
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              required
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

          <Input
            label="Batas Anggaran Bulanan (Rupiah) *"
            type="number"
            required
            placeholder="Contoh: 3500000"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
          />

          <Input
            label="Ambang Batas Peringatan (%)"
            type="number"
            placeholder="80"
            value={formThreshold}
            onChange={(e) => setFormThreshold(e.target.value)}
            helperText="Notifikasi akan dikirim otomatis saat pengeluaran mencapai persentase ini."
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Anggaran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

