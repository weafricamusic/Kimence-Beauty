import Link from "next/link";

import { signInAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Kimence Beauty</h1>
        <p className="text-sm opacity-80">Sign in to continue.</p>
      </div>

      {(error || message) && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm">
          {error ? <span className="text-red-600">{error}</span> : message}
        </div>
      )}

      <form action={signInAction} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button className="w-full rounded-md bg-foreground px-3 py-2 text-background">
          Sign in
        </button>
      </form>

      <p className="text-sm opacity-80">
        New here?{" "}
        <Link href="/signup" className="underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
