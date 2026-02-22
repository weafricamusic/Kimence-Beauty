import { requireUser } from "@/lib/auth";
import { createRoutineItemAction, toggleRoutineDoneAction } from "./actions";

export default async function RoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const today = new Date().toISOString().slice(0, 10);

  const { data: items } = await supabase
    .from("routine_items")
    .select("id, name, time_of_day, active, created_at")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  const { data: logs } = await supabase
    .from("routine_logs")
    .select("routine_item_id, done")
    .eq("user_id", user.id)
    .eq("log_date", today);

  const doneSet = new Set((logs ?? []).filter((l) => l.done).map((l) => l.routine_item_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Routine</h1>
        <p className="text-sm opacity-80">Track what you do daily.</p>
      </div>

      {error && (
        <div className="rounded-md border border-foreground/15 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-md border border-foreground/15 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Add routine item</h2>
        <form action={createRoutineItemAction} className="grid gap-3 sm:grid-cols-3">
          <input
            name="name"
            className="sm:col-span-2 w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            placeholder="e.g. Cleanser, moisturizer, oil"
            required
          />
          <select
            name="timeOfDay"
            className="w-full rounded-md border border-foreground/15 bg-background px-3 py-2"
            defaultValue="any"
          >
            <option value="any">Any</option>
            <option value="morning">Morning</option>
            <option value="night">Night</option>
          </select>
          <div className="sm:col-span-3 flex justify-end">
            <button className="rounded-md bg-foreground px-4 py-2 text-background">
              Add
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Today ({today})</h2>
        {(items ?? []).length === 0 ? (
          <p className="text-sm opacity-80">No routine items yet.</p>
        ) : (
          <div className="space-y-2">
            {items?.map((item) => {
              const isDone = doneSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-foreground/15 p-3"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm opacity-70">{item.time_of_day}</div>
                  </div>

                  <form action={toggleRoutineDoneAction}>
                    <input type="hidden" name="routineItemId" value={item.id} />
                    <input type="hidden" name="logDate" value={today} />
                    <input type="hidden" name="done" value={String(!isDone)} />
                    <button
                      className={`rounded-md border px-3 py-1.5 text-sm hover:bg-foreground/5 ${
                        isDone ? "border-foreground/30" : "border-foreground/15"
                      }`}
                    >
                      {isDone ? "Done" : "Mark done"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
