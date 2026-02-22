import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { createCommentAction, toggleLikeAction } from "../actions";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { postId } = await params;
  const { error } = await searchParams;

  const { supabase, user } = await requireUser();

  const { data: post } = await supabase
    .from("posts")
    .select("id, content, created_at, user_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post) {
    return (
      <div className="space-y-4">
        <Link href="/community" className="underline">
          ← Back
        </Link>
        <p>Post not found.</p>
      </div>
    );
  }

  const { data: likes } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <Link href="/community" className="underline">
        ← Back to Community
      </Link>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-md border border-foreground/15 p-4 space-y-3">
        <div className="text-sm opacity-70">
          {new Date(post.created_at).toLocaleString()} • {post.user_id.slice(0, 8)}
        </div>
        <p className="whitespace-pre-wrap">{post.content}</p>
        <form action={toggleLikeAction}>
          <input type="hidden" name="postId" value={post.id} />
          <button className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm hover:bg-foreground/5">
            {likes ? "Unlike" : "Like"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Comments</h2>

        <form action={createCommentAction} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <textarea
            name="content"
            className="min-h-20 w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            placeholder="Write a comment"
            required
          />
          <div className="flex justify-end">
            <button className="rounded-md bg-foreground px-4 py-2 text-background">
              Comment
            </button>
          </div>
        </form>

        {(comments ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No comments yet.</p>
        ) : (
          <div className="space-y-2">
            {comments?.map((comment) => (
              <div
                key={comment.id}
                className="rounded-md border border-foreground/15 p-3"
              >
                <div className="text-xs opacity-70">
                  {new Date(comment.created_at).toLocaleString()} • {comment.user_id.slice(0, 8)}
                </div>
                <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
