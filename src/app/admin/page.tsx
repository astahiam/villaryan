import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ModerationTable } from "@/components/admin/ModerationTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderation" };

export default async function AdminPage() {
  const session = await readSession();
  if (!session) redirect("/admin/login");

  const listings = await prisma.property.findMany({
    where: { source: "LOCAL" },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl">Moderation</h1>
          <p className="mt-2 text-sm text-ink-700">Signed in as {session.email}</p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-sand-300 px-4 py-2 text-sm">Sign out</button>
        </form>
      </div>
      <ModerationTable
        listings={listings.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          category: item.category,
          intent: item.intent,
          locationLabel: item.locationLabel,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
