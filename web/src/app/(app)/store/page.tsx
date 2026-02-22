import { requireUser } from "@/lib/auth";
import { addToCartAction, requestOrderAction, updateCartQtyAction } from "./actions";
import { formatMoney } from "@/lib/money";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_cents, active")
    .eq("active", true)
    .order("name", { ascending: true });

  const { data: cart } = await supabase
    .from("cart_items")
    .select("product_id, quantity, product:products(id, name, price_cents)")
    .eq("user_id", user.id);

  const cartTotalCents = (cart ?? []).reduce((sum, row) => {
    const price = row.product?.[0]?.price_cents ?? 0;
    return sum + price * row.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Store</h1>
        <p className="text-sm opacity-80">Add products to cart and request an order (no payments yet).</p>
      </div>

      {(error || message) && (
        <div
          className={`rounded-md border border-foreground/15 px-4 py-3 text-sm ${error ? "text-red-600" : ""}`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Products</h2>
          {(products ?? []).length === 0 ? (
            <p className="text-sm opacity-80">No products yet.</p>
          ) : (
            <div className="space-y-2">
              {products?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-foreground/15 p-3"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm opacity-70">{formatMoney(p.price_cents)}</div>
                  </div>
                  <form action={addToCartAction}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                      Add
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Cart</h2>
          {(cart ?? []).length === 0 ? (
            <p className="text-sm opacity-80">Your cart is empty.</p>
          ) : (
            <div className="space-y-2">
              {cart?.map((row) => (
                <div
                  key={row.product_id}
                  className="flex items-center justify-between rounded-md border border-foreground/15 p-3"
                >
                  <div>
                    <div className="font-medium">{row.product?.[0]?.name ?? "Product"}</div>
                    <div className="text-sm opacity-70">
                      {formatMoney((row.product?.[0]?.price_cents ?? 0) * row.quantity)}
                    </div>
                  </div>
                  <form action={updateCartQtyAction} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={row.product_id} />
                    <input
                      name="quantity"
                      type="number"
                      min={0}
                      className="w-20 rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
                      defaultValue={row.quantity}
                    />
                    <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                      Update
                    </button>
                  </form>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="opacity-70">Total</span>
                <span className="font-medium">{formatMoney(cartTotalCents)}</span>
              </div>

              <form action={requestOrderAction} className="space-y-2 pt-2">
                <textarea
                  name="note"
                  className="min-h-20 w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
                  placeholder="Order note (delivery details, etc.)"
                />
                <button className="w-full rounded-md bg-foreground px-4 py-2 text-background">
                  Request order
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
