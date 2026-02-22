"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export async function createRoutineItemAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const timeOfDay = String(formData.get("timeOfDay") ?? "any");

  if (!name) {
    redirect("/routine?error=Missing%20routine%20name");
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("routine_items").insert({
    user_id: user.id,
    name,
    time_of_day: timeOfDay,
    active: true,
  });

  if (error) {
    redirect(`/routine?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/routine");
}

export async function toggleRoutineDoneAction(formData: FormData) {
  const routineItemId = String(formData.get("routineItemId") ?? "");
  const logDate = String(formData.get("logDate") ?? "");
  const nextDone = String(formData.get("done") ?? "") === "true";

  if (!routineItemId || !logDate) {
    redirect("/routine");
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("routine_logs").upsert(
    {
      user_id: user.id,
      routine_item_id: routineItemId,
      log_date: logDate,
      done: nextDone,
    },
    { onConflict: "user_id,routine_item_id,log_date" },
  );

  if (error) {
    redirect(`/routine?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/routine");
}
