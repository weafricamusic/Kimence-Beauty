import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { createPostAction, toggleLikeAction } from "./actions";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: likes } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", user.id);

  const likedSet = new Set((likes ?? []).map((l) => l.post_id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Community</h1>
          <p className="text-sm opacity-80">Share tips, looks, and routines.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form action={createPostAction} className="space-y-3">
        <textarea
          name="content"
          className="min-h-24 w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
          placeholder="What are you sharing today?"
          required
        />
        <div className="flex justify-end">
          <button className="rounded-md bg-foreground px-4 py-2 text-background">
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {(posts ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No posts yet.</p>
        ) : (
          posts?.map((post) => (
            <div
              key={post.id}
              className="rounded-md border border-foreground/15 p-4 space-y-3"
            >
              <div className="text-sm opacity-70">
                {new Date(post.created_at).toLocaleString()} • {post.user_id.slice(0, 8)}
              </div>
              <p className="whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <form action={toggleLikeAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
                      {likedSet.has(post.id) ? "Unlike" : "Like"}
                    </button>
                  </form>
                  <Link
                    href={`/community/${post.id}`}
                    className="text-sm underline opacity-80"
                  >
                    Comments
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
