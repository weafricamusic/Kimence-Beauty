import {
  createProductAction,
  createServiceAction,
  deletePostAction,
  toggleProductActiveAction,
  toggleServiceActiveAction,
  updateProductPriceAction,
  updateServicePriceAction,
  updateBookingStatusAction,
  updateOrderStatusAction,
} from "./actions";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents, active")
    .order("name", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents, active")
    .order("name", { ascending: true });

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, content, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, starts_at, status, note, user_id, service:services(name)")
    .order("starts_at", { ascending: false })
    .limit(20);

  const { data: orders } = await supabase
    .from("order_requests")
    .select("id, created_at, status, note, user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm opacity-80">Manage content, services, and products.</p>
      </div>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-foreground/15 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Services</h2>
          <form action={createServiceAction} className="grid gap-2 sm:grid-cols-4">
            <input
              name="name"
              placeholder="Service name"
              className="sm:col-span-2 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
              required
            />
            <input
              name="durationMinutes"
              type="number"
              placeholder="Min"
              className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
              required
            />
            <input
              name="priceMwk"
              type="number"
              min={0}
              step="0.01"
              placeholder="Price (MWK)"
              className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
              required
            />
            <div className="sm:col-span-4 flex justify-end">
              <button className="rounded-md bg-foreground px-4 py-2 text-background">
                Add service
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {(services ?? []).length === 0 ? (
              <p className="text-sm opacity-80">No services.</p>
            ) : (
              services?.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-md border border-foreground/15 p-3"
                >
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm opacity-70">
                      {s.duration_minutes} min • {formatMoney(s.price_cents)} • {s.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <form action={updateServicePriceAction} className="flex items-center gap-2">
                      <input type="hidden" name="serviceId" value={s.id} />
                      <input
                        name="priceMwk"
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-28 rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
                        defaultValue={s.price_cents / 100}
                        aria-label="Service price (MWK)"
                      />
                      <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                        Update price
                      </button>
                    </form>

                    <form action={toggleServiceActiveAction}>
                      <input type="hidden" name="serviceId" value={s.id} />
                      <input type="hidden" name="active" value={String(!s.active)} />
                      <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                        {s.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-md border border-foreground/15 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <form action={createProductAction} className="grid gap-2 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Product name"
              className="sm:col-span-2 w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
              required
            />
            <input
              name="priceMwk"
              type="number"
              min={0}
              step="0.01"
              placeholder="Price (MWK)"
              className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm"
              required
            />
            <div className="sm:col-span-3 flex justify-end">
              <button className="rounded-md bg-foreground px-4 py-2 text-background">
                Add product
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {(products ?? []).length === 0 ? (
              <p className="text-sm opacity-80">No products.</p>
            ) : (
              products?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-foreground/15 p-3"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm opacity-70">
                      {formatMoney(p.price_cents)} • {p.active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <form action={updateProductPriceAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={p.id} />
                      <input
                        name="priceMwk"
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-28 rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
                        defaultValue={p.price_cents / 100}
                        aria-label="Product price (MWK)"
                      />
                      <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                        Update price
                      </button>
                    </form>

                    <form action={toggleProductActiveAction}>
                      <input type="hidden" name="productId" value={p.id} />
                      <input type="hidden" name="active" value={String(!p.active)} />
                      <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                        {p.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-foreground/15 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Moderation (recent posts)</h2>
          {(recentPosts ?? []).length === 0 ? (
            <p className="text-sm opacity-80">No posts.</p>
          ) : (
            <div className="space-y-2">
              {recentPosts?.map((p) => (
                <div key={p.id} className="rounded-md border border-foreground/15 p-3 space-y-2">
                  <div className="text-xs opacity-70">
                    {new Date(p.created_at).toLocaleString()} • {p.user_id.slice(0, 8)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{p.content}</p>
                  <form action={deletePostAction}>
                    <input type="hidden" name="postId" value={p.id} />
                    <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-md border border-foreground/15 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Bookings</h2>
          {(bookings ?? []).length === 0 ? (
            <p className="text-sm opacity-80">No bookings.</p>
          ) : (
            <div className="space-y-2">
              {bookings?.map((b) => (
                <div key={b.id} className="rounded-md border border-foreground/15 p-3">
                  <div className="font-medium text-sm">
                    {b.service?.[0]?.name ?? "Service"} • {new Date(b.starts_at).toLocaleString()}
                  </div>
                  <div className="text-xs opacity-70">User: {b.user_id.slice(0, 8)}</div>
                  {b.note && <div className="text-sm opacity-80">{b.note}</div>}

                  <form action={updateBookingStatusAction} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="bookingId" value={b.id} />
                    <select
                      name="status"
                      defaultValue={b.status}
                      className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
                    >
                      <option value="requested">requested</option>
                      <option value="confirmed">confirmed</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                      Update
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <h2 className="text-lg font-semibold">Orders</h2>
        {(orders ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No order requests.</p>
        ) : (
          <div className="space-y-2">
            {orders?.map((o) => (
              <div key={o.id} className="rounded-md border border-foreground/15 p-3">
                <div className="font-medium text-sm">
                  {new Date(o.created_at).toLocaleString()} • {o.user_id.slice(0, 8)}
                </div>
                <div className="text-xs opacity-70">Status: {o.status}</div>
                {o.note && <div className="text-sm opacity-80">{o.note}</div>}

                <form action={updateOrderStatusAction} className="mt-2 flex items-center gap-2">
                  <input type="hidden" name="orderId" value={o.id} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
                  >
                    <option value="requested">requested</option>
                    <option value="processing">processing</option>
                    <option value="fulfilled">fulfilled</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
