"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) {
    redirect("/store");
  }

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const nextQty = (existing?.quantity ?? 0) + 1;

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: user.id,
      product_id: productId,
      quantity: nextQty,
    },
    { onConflict: "user_id,product_id" },
  );

  if (error) {
    redirect(`/store?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/store");
}

export async function updateCartQtyAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);

  const { supabase, user } = await requireUser();

  if (!productId) {
    redirect("/store");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    revalidatePath("/store");
    return;
  }

  await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", user.id)
    .eq("product_id", productId);

  revalidatePath("/store");
}

export async function requestOrderAction(formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();

  const { supabase, user } = await requireUser();

  const { data: cart } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", user.id);

  if (!cart || cart.length === 0) {
    redirect("/store?error=Cart%20is%20empty");
  }

  const { data: order, error: orderError } = await supabase
    .from("order_requests")
    .insert({ user_id: user.id, note: note || null, status: "requested" })
    .select("id")
    .single();

  if (orderError) {
    redirect(`/store?error=${encodeURIComponent(orderError.message)}`);
  }

  const items = cart.map((c) => ({
    order_request_id: order.id,
    product_id: c.product_id,
    quantity: c.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_request_items")
    .insert(items);

  if (itemsError) {
    redirect(`/store?error=${encodeURIComponent(itemsError.message)}`);
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/store");
  redirect("/store?message=Order%20request%20sent");
}
