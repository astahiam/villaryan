import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  type: z.enum(["outbound_click", "inquiry_click"]),
  propertyId: z.string().max(120),
  source: z.string().max(40).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const localId = parsed.data.propertyId.startsWith("local_")
    ? parsed.data.propertyId.slice(6)
    : null;
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: parsed.data.type,
        propertyId: localId,
        source: parsed.data.source,
        meta: { propertyKey: parsed.data.propertyId },
      },
    });
  } catch {
    // Keep the user flow working if analytics storage is down.
  }
  return NextResponse.json({ ok: true });
}
