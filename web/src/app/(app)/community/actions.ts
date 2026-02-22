"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export async function createPostAction(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    redirect("/community");
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
  });

  if (error) {
    redirect(`/community?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/community");
}

export async function toggleLikeAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) {
    redirect("/community");
  }

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
}

export async function createCommentAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!postId || !content) {
    redirect(`/community/${postId}`);
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) {
    redirect(`/community/${postId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/community/${postId}`);
}
