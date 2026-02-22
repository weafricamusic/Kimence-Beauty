import Link from "next/link";

import { signUpAction } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm opacity-80">Join Kimence Beauty.</p>
      </div>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={signUpAction} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Display name (optional)</label>
          <input
            name="displayName"
            type="text"
            className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            placeholder="Your name"
            autoComplete="nickname"
          />
        </div>
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <button className="w-full rounded-md bg-foreground px-3 py-2 text-background">
          Sign up
        </button>
      </form>

      <p className="text-sm opacity-80">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
