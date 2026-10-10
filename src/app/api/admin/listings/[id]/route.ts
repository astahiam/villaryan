import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { moderationSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const parsed = moderationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid moderation payload." }, { status: 400 });
  }

  const updated = await prisma.property.update({
    where: { id },
    data: {
      status: parsed.data.status,
      rejectionReason: parsed.data.status === "REJECTED" ? parsed.data.rejectionReason ?? "Rejected" : null,
      publishedAt: parsed.data.status === "APPROVED" ? new Date() : null,
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
