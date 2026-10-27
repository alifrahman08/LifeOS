"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  PiggyBank,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatShortDateID } from "@/lib/utils";
import {
  createTransactionAction,
  deleteTransactionAction,
  createSavingsGoalAction,
  addSavingsContributionAction,
} from "@/actions/finance";

interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  type: string;
  date: Date;
  notes: string | null;
  categoryId: string | null;
  category?: { id: string; name: string; color: string; type: string } | null;
  accountId: string | null;
  account?: { id: string; name: string; type: string } | null;
}

interface FinancialAccountItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string | null;
  color: string | null;
}

interface SavingsGoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  icon: string;
}

interface FinanceClientProps {
  initialTransactions: TransactionItem[];
  accounts: FinancialAccountItem[];
  categories: Array<{ id: string; name: string; type: string; color: string }>;
  savingsGoals: SavingsGoalItem[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    savingsRate: number;
  };
}

export function FinanceClient({
  initialTransactions,
  accounts,
  categories,
  savingsGoals: initialSavings,
  summary,
}: FinanceClientProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [savingsList, setSavingsList] = useState<SavingsGoalItem[]>(initialSavings);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txCategory, setTxCategory] = useState("");
  const [txAccount, setTxAccount] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Savings Modal State
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [selectedSavingsId, setSelectedSavingsId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionType, setContributionType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");

  // Create Transaction
  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createTransactionAction({
        title: txTitle,
        amount: Number(txAmount),
        type: txType,
        date: txDate,
        categoryId: txCategory || undefined,
        accountId: txAccount || undefined,
        notes: txNotes,
      });

      if (res.success) {
        setIsTxModalOpen(false);
        window.location.reload();
      } else {
        alert(res.message || "Gagal mencatat transaksi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (id: string) => {
    if (confirm("Hapus transaksi ini dan sesuaikan kembali saldo akun?")) {
      const res = await deleteTransactionAction(id);
      if (res.success) {
        window.location.reload();
      }
    }
  };

  // Add Savings Contribution
  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSavingsId) return;
    setIsSubmitting(true);
    try {
      const res = await addSavingsContributionAction(
        selectedSavingsId,
        Number(contributionAmount),
        contributionType
      );
      if (res.success) {
        setIsSavingsModalOpen(false);
        setContributionAmount("");
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Tanggal,Keterangan,Tipe,Nominal,Kategori,Akun\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${formatShortDateID(t.date)}","${t.title}","${t.type}",${t.amount},"${
            t.category?.name || "-"
          }","${t.account?.name || "-"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LifeOS_Transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" ? true : t.type === typeFilter;
    const matchesCat = categoryFilter === "ALL" ? true : t.categoryId === categoryFilter;
    return matchesSearch && matchesType && matchesCat;
  });

  // Category Expense Chart Data
  const categorySpendingMap = new Map<string, { name: string; value: number; color: string }>();
  transactions
    .filter((t) => t.type === "EXPENSE" && t.category)
    .forEach((t) => {
      const cat = t.category!;
      const existing = categorySpendingMap.get(cat.id);
      if (existing) {
        existing.value += t.amount;
      } else {
        categorySpendingMap.set(cat.id, {
          name: cat.name,
          value: t.amount,
          color: cat.color || "#0d9488",
        });
      }
    });

  const categoryChartData = Array.from(categorySpendingMap.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-800" />
            Keuangan Pribadi
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Pencatatan arus kas presisi berbasis Rupiah dengan rekapitulasi pengeluaran per kategori.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </Button>
          <Button onClick={() => setIsTxModalOpen(true)} className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            Catat Transaksi
          </Button>
        </div>
      </div>

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(summary.totalIncome)}
          subtitle="Bulan Berjalan"
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-700" />}
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(summary.totalExpense)}
          subtitle="Bulan Berjalan"
          icon={<ArrowDownRight className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          title="Arus Kas Bersih"
          value={formatCurrency(summary.netCashFlow)}
          subtitle={summary.netCashFlow >= 0 ? "Surplus Keuangan" : "Defisit"}
          icon={<Wallet className="w-4 h-4 text-emerald-800" />}
        />
        <StatCard
          title="Rasio Tabungan"
          value={`${summary.savingsRate}%`}
          subtitle="Dari total pemasukan"
          icon={<PiggyBank className="w-4 h-4 text-purple-700" />}
        />
      </div>

      {/* Saldo Akun & Target Tabungan (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Akun Keuangan */}
        <Card className="md:col-span-1">
          <CardHeader className="py-3.5">
            <CardTitle className="text-xs font-bold text-stone-900">Dompet & Rekening</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3 rounded-lg border border-stone-200/90 bg-stone-50/50 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-xs text-stone-900 block">{acc.name}</span>
                  <span className="text-[10px] text-stone-400 uppercase font-mono">
                    {acc.type} {acc.accountNumber ? `• ${acc.accountNumber}` : ""}
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Target Tabungan (Savings Goals) */}
        <Card className="md:col-span-2">
          <CardHeader className="py-3.5 flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-stone-900">
              Target Tabungan & Dana Impian
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {savingsList.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">Belum ada target tabungan.</p>
            ) : (
              savingsList.map((sav) => {
                const percent = Math.min(
                  100,
                  Math.round((sav.currentAmount / sav.targetAmount) * 100)
                );
                return (
                  <div
                    key={sav.id}
                    className="p-3.5 rounded-xl border border-stone-200/90 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{sav.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSavingsId(sav.id);
                          setIsSavingsModalOpen(true);
                        }}
                        className="text-[11px] h-7 px-2"
                      >
                        + Setor Tabungan
                      </Button>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500 font-medium">
                      <span>Terkumpul: {formatCurrency(sav.currentAmount)}</span>
                      <span>Target: {formatCurrency(sav.targetAmount)} ({percent}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter & Daftar Transaksi */}
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Tipe:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="INCOME">Pemasukan (+)</option>
              <option value="EXPENSE">Pengeluaran (-)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Transaksi */}
        <div className="bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Rekening</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                        {formatShortDateID(tx.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {tx.title}
                        {tx.notes && (
                          <span className="block text-[11px] text-stone-400 font-normal mt-0.5">
                            {tx.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {tx.category ? (
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-medium text-white"
                            style={{ backgroundColor: tx.category.color }}
                          >
                            {tx.category.name}
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {tx.account?.name || "-"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          tx.type === "INCOME" ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"} {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Catat Transaksi Keuangan"
        description="Simpan pemasukan atau pengeluaran harian dengan kategori terarah."
      >
        <form onSubmit={handleCreateTx} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTxType("EXPENSE")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                txType === "EXPENSE" ? "bg-white text-rose-700 shadow-xs" : "text-stone-500"
              }`}
            >
              Pengeluaran (-)
            </button>
            <button
              type="button"
              onClick={() => setTxType("INCOME")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                txType === "INCOME" ? "bg-white text-emerald-800 shadow-xs" : "text-stone-500"
              }`}
            >
              Pemasukan (+)
            </button>
          </div>

          <Input
            label="Keterangan Transaksi *"
            required
            placeholder="Contoh: Belanja Bulanan Supermarket"
            value={txTitle}
            onChange={(e) => setTxTitle(e.target.value)}
          />

          <Input
            label="Nominal (Rupiah) *"
            type="number"
            required
            placeholder="Contoh: 150000"
            value={txAmount}
            onChange={(e) => setTxAmount(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Transaksi"
              type="date"
              required
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Kategori Transaksi
              </label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
              >
                <option value="">Pilih Kategori...</option>
                {categories
                  .filter((c) => c.type === txType)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Rekening / Sumber Dana
            </label>
            <select
              value={txAccount}
              onChange={(e) => setTxAccount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
            >
              <option value="">Pilih Rekening (Opsional)...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Catatan Tambahan (Opsional)"
            placeholder="Rincian struk atau keperluan..."
            value={txNotes}
            onChange={(e) => setTxNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsTxModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Setoran Tabungan */}
      <Modal
        isOpen={isSavingsModalOpen}
        onClose={() => setIsSavingsModalOpen(false)}
        title="Setor / Tarik Tabungan"
        description="Catat kontribusi menuju target dana impian Anda."
      >
        <form onSubmit={handleAddSavings} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => setContributionType("DEPOSIT")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                contributionType === "DEPOSIT"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-500"
              }`}
            >
              Setoran (+)
            </button>
            <button
              type="button"
              onClick={() => setContributionType("WITHDRAWAL")}
              className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                contributionType === "WITHDRAWAL"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-stone-500"
              }`}
            >
              Penarikan (-)
            </button>
          </div>

          <Input
            label="Nominal (Rupiah) *"
            type="number"
            required
            placeholder="Contoh: 500000"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
          />

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsSavingsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="md" isLoading={isSubmitting}>
              Simpan Setoran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

