"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export async function createBookingAction(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const startsAtLocal = String(formData.get("startsAt") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!serviceId || !startsAtLocal) {
    redirect("/booking?error=Missing%20service%20or%20time");
  }

  const startsAt = new Date(startsAtLocal);
  if (Number.isNaN(startsAt.getTime())) {
    redirect("/booking?error=Invalid%20date%20time");
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    service_id: serviceId,
    starts_at: startsAt.toISOString(),
    note: note || null,
    status: "requested",
  });

  if (error) {
    redirect(`/booking?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/booking");
}
