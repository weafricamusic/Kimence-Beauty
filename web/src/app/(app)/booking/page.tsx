import { requireUser } from "@/lib/auth";
import { createBookingAction } from "./actions";
import { formatMoney } from "@/lib/money";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents, active")
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: myBookings } = await supabase
    .from("bookings")
    .select("id, starts_at, status, note, service:services(name)")
    .eq("user_id", user.id)
    .order("starts_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Booking</h1>
        <p className="text-sm opacity-80">Request an appointment.</p>
      </div>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-md border border-foreground/15 p-4 space-y-4">
        <h2 className="text-lg font-semibold">New booking</h2>

        {(services ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No services available yet.</p>
        ) : (
          <form action={createBookingAction} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Service</label>
              <select
                name="serviceId"
                className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
                required
              >
                {services?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} • {s.duration_minutes} min • {formatMoney(s.price_cents)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm">Date & time</label>
              <input
                name="startsAt"
                type="datetime-local"
                required
                className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm">Note (optional)</label>
              <textarea
                name="note"
                className="min-h-20 w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
                placeholder="Any details for the stylist?"
              />
            </div>

            <div className="flex justify-end">
              <button className="rounded-md bg-foreground px-4 py-2 text-background">
                Request booking
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My recent bookings</h2>
        {(myBookings ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {myBookings?.map((b) => (
              <div
                key={b.id}
                className="rounded-md border border-foreground/15 p-3"
              >
                <div className="text-sm font-medium">
                  {b.service?.[0]?.name ?? "Service"} • {new Date(b.starts_at).toLocaleString()}
                </div>
                <div className="text-xs opacity-70">Status: {b.status}</div>
                {b.note && <div className="text-sm opacity-80">{b.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
