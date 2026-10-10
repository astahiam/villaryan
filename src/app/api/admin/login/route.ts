import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`admin-login:${clientKey(request)}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }
  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  const token = await createSession({ sub: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
