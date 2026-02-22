import Link from "next/link";

import { signOutAction } from "../(auth)/actions";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Kimence Beauty
            </Link>
            <nav className="flex items-center gap-4 text-sm opacity-90">
              <Link href="/booking" className="hover:underline">
                Booking
              </Link>
              <Link href="/store" className="hover:underline">
                Store
              </Link>
              <Link href="/routine" className="hover:underline">
                Routine
              </Link>
              {profile?.is_admin && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline opacity-70">
              {profile?.display_name || user.email}
            </span>
            <form action={signOutAction}>
              <button className="rounded-md border border-foreground/15 px-3 py-1.5 hover:bg-foreground/5">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
