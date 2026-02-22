"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

export async function createServiceAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);
  const priceMwk = Number(formData.get("priceMwk") ?? 0);

  if (!name || !Number.isFinite(durationMinutes) || !Number.isFinite(priceMwk)) {
    redirect("/admin?error=Invalid%20service%20data");
  }

  const priceCents = Math.round(priceMwk * 100);

  if (priceCents < 0) {
    redirect("/admin?error=Invalid%20service%20price");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("services").insert({
    name,
    duration_minutes: durationMinutes,
    price_cents: priceCents,
    active: true,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
}

export async function toggleServiceActiveAction(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  const { supabase } = await requireAdmin();
  await supabase.from("services").update({ active }).eq("id", serviceId);
  revalidatePath("/admin");
}

export async function updateServicePriceAction(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const priceMwk = Number(formData.get("priceMwk") ?? NaN);

  if (!serviceId || !Number.isFinite(priceMwk) || priceMwk < 0) {
    redirect("/admin?error=Invalid%20service%20price");
  }

  const priceCents = Math.round(priceMwk * 100);

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("services")
    .update({ price_cents: Math.trunc(priceCents) })
    .eq("id", serviceId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const priceMwk = Number(formData.get("priceMwk") ?? 0);

  if (!name || !Number.isFinite(priceMwk)) {
    redirect("/admin?error=Invalid%20product%20data");
  }

  const priceCents = Math.round(priceMwk * 100);

  if (priceCents < 0) {
    redirect("/admin?error=Invalid%20product%20price");
  }

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("products").insert({
    name,
    price_cents: priceCents,
    active: true,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
}

export async function toggleProductActiveAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  const { supabase } = await requireAdmin();
  await supabase.from("products").update({ active }).eq("id", productId);
  revalidatePath("/admin");
}

export async function updateProductPriceAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const priceMwk = Number(formData.get("priceMwk") ?? NaN);

  if (!productId || !Number.isFinite(priceMwk) || priceMwk < 0) {
    redirect("/admin?error=Invalid%20product%20price");
  }

  const priceCents = Math.round(priceMwk * 100);

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({ price_cents: Math.trunc(priceCents) })
    .eq("id", productId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
}

export async function deletePostAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");

  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/admin");
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "requested");

  const { supabase } = await requireAdmin();
  await supabase.from("bookings").update({ status }).eq("id", bookingId);
  revalidatePath("/admin");
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "requested");

  const { supabase } = await requireAdmin();
  await supabase.from("order_requests").update({ status }).eq("id", orderId);
  revalidatePath("/admin");
}
