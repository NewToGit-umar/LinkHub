import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "../../services/api";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d, days) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

function formatDateKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function Calendar() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDatePosts, setSelectedDatePosts] = useState(null);

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const r = await postsAPI.list();
      return r.data.posts;
    },
    staleTime: 0,
  });

  // Filter out cancelled posts
  const posts = useMemo(() => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return rawPosts.filter((post) => {
      if (post.status === "cancelled") {
        // Hide all cancelled posts without timestamp or older than 30 minutes
        if (!post.cancelledAt) return false;
        return new Date(post.cancelledAt) > thirtyMinutesAgo;
      }
      return true;
    });
  }, [rawPosts]);

  const scheduledByDate = useMemo(() => {
    const map = {};
    for (const p of posts) {
      if (!p.scheduledAt) continue;
      const dt = new Date(p.scheduledAt);
      const key = formatDateKey(dt);
      map[key] = map[key] || [];
      map[key].push(p);
    }
    return map;
  }, [posts]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  );
  const startWeekday = monthStart.getDay(); // 0..6

  // build an array of 42 cells (6 weeks)
  const cells = [];
  const firstCellDate = addDays(monthStart, -startWeekday);
  for (let i = 0; i < 42; i++) {
    cells.push(addDays(firstCellDate, i));
  }

  const prevMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Scheduled Posts</h1>
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="px-3 py-1 border rounded">
            ◀
          </button>
          <div className="font-medium">
            {cursor.toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button onClick={nextMonth} className="px-3 py-1 border rounded">
            ▶
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-medium text-sm">
              {d}
            </div>
          ))}

          {cells.map((cell) => {
            const key = formatDateKey(cell);
            const posts = scheduledByDate[key] || [];
            const isCurrentMonth = cell.getMonth() === cursor.getMonth();
            return (
              <div
                key={key}
                className={`min-h-[90px] p-2 border rounded ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                } cursor-pointer`}
                onClick={() => setSelectedDatePosts({ date: key, posts })}
              >
                <div className="text-xs text-gray-500">{cell.getDate()}</div>
                {posts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {posts.slice(0, 3).map((p) => (
                      <div
                        key={p._id}
                        className="text-xs p-1 bg-blue-50 rounded text-blue-700"
                      >
                        {p.content.slice(0, 60)}
                        {p.content.length > 60 ? "…" : ""}
                      </div>
                    ))}
                    {posts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{posts.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedDatePosts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Scheduled for {selectedDatePosts.date}
              </h3>
              <button
                onClick={() => setSelectedDatePosts(null)}
                className="text-gray-500"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-auto">
              {selectedDatePosts.posts.length === 0 && (
                <div className="text-gray-600">
                  No scheduled posts for this date.
                </div>
              )}
              {selectedDatePosts.posts.map((p) => (
                <div key={p._id} className="p-3 border rounded bg-white">
                  <div className="text-sm text-gray-800 mb-1">{p.content}</div>
                  <div className="text-xs text-gray-500">
                    Platforms: {p.platforms.join(", ")}
                  </div>
                  <div className="text-xs text-gray-400">
                    Status: {p.status}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedDatePosts(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
