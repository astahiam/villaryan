"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!response.ok) {
      setError("Sign-in failed.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl">Editor sign-in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-sand-200 bg-white p-6">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        <button className="rounded-full bg-forest-800 px-4 py-2 text-sm text-white">Sign in</button>
      </form>
    </div>
  );
}
