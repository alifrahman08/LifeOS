"use client";

import React, { useState } from "react";
import { User, Mail, Briefcase, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateProfileAction } from "@/actions/profile";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    profile: {
      bio: string | null;
      phone: string | null;
      occupation: string | null;
      location: string | null;
    } | null;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.profile?.bio || "");
  const [phone, setPhone] = useState(user.profile?.phone || "");
  const [occupation, setOccupation] = useState(user.profile?.occupation || "");
  const [location, setLocation] = useState(user.profile?.location || "");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    try {
      const res = await updateProfileAction({
        name,
        bio,
        phone,
        occupation,
        location,
      });

      if (res.success) {
        setSuccessMsg("Informasi profil Anda berhasil diperbarui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-800" />
          Profil Pengguna
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Kelola informasi identitas akun pribadi dan peran Anda di LifeOS.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {successMsg}
        </div>
      )}

      {/* Overview Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">{name}</h3>
              <Badge variant="outline" className="font-mono text-[10px]">
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              {user.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Informasi Data Diri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pekerjaan / Bidang"
                placeholder="Contoh: Senior Product Engineer"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
              <Input
                label="Lokasi / Kota"
                placeholder="Contoh: Jakarta, Indonesia"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Input
              label="Nomor Telepon (Opsional)"
              placeholder="0812..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Textarea
              label="Bio Singkat & Visi Pribadi"
              placeholder="Tuliskan ringkasan singkat mengenai fokus hidup Anda..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <Button type="submit" size="md" isLoading={isLoading}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
