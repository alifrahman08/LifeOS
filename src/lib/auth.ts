import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser, UserRole } from "@/types";
import prisma from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lifeos_super_secret_jwt_encryption_key_development_32chars"
);

export const COOKIE_NAME = "lifeos_session";

/**
 * Hash password dengan bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifikasi password dengan hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Buat JWT session token
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifikasi session token JWT
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Dapatkan session pengguna saat ini di Server Component / Server Action
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Wajibkan pengguna masuk (Server-side authorization)
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Wajibkan pengguna role ADMIN (Server-side authorization)
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "ADMIN") {
    throw new Error("FORBIDDEN_NOT_ADMIN");
  }
  return session;
}

/**
 * Simpan session token ke cookie HTTP-only aman
 */
export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

/**
 * Hapus session cookie saat logout
 */
export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Buat token pengaturan ulang kata sandi (berlaku 1 jam)
 */
export async function createPasswordResetToken(user: {
  id: string;
  email: string;
  passwordHash: string;
}): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    hashSig: user.passwordHash.slice(-10),
    purpose: "reset-password",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

/**
 * Verifikasi token pengaturan ulang kata sandi
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ id: string; email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== "reset-password") return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, email: true, name: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) return null;

    // Pastikan hash password cocok dengan saat token dibuat
    if (user.passwordHash.slice(-10) !== payload.hashSig) {
      return null;
    }

    return { id: user.id, email: user.email, name: user.name };
  } catch {
    return null;
  }
}

