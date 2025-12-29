import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsAPI } from "../../services/api";
import PostComposer from "../../components/PostComposer";

export default function Posts() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const r = await postsAPI.list();
      return r.data.posts;
    },
    staleTime: 0,
  });

  const posts = data || [];
  const qc = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: (id) => postsAPI.publish(id),
    onSuccess: () => qc.invalidateQueries(["posts"]),
  });
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <button onClick={() => setOpen(true)} className="btn-primary">
          New Post
        </button>
      </div>

      {isLoading ? (
        <div>Loading posts…</div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 && (
            <div className="text-gray-600">No posts yet.</div>
          )}
          {posts.map((p) => (
            <div key={p._id} className="p-4 border rounded bg-white">
              <div className="text-sm text-gray-700 mb-2">{p.content}</div>
              <div className="text-xs text-gray-500">
                Platforms: {p.platforms.join(", ")}
              </div>
              <button
                onClick={() => setSelected(p)}
                className="px-3 py-1 border rounded text-sm"
              >
                Details
              </button>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-400">Status: {p.status}</div>
                <div className="space-x-2">
                  {p.status !== "queued" &&
                    p.status !== "publishing" &&
                    p.status !== "published" && (
                      <button
                        onClick={() => publishMutation.mutate(p._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Queue
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PostComposer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
{
  selected && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Post Details</h3>
          <button onClick={() => setSelected(null)} className="text-gray-500">
            Close
          </button>
        </div>

        <div className="mb-2">
          <div className="font-medium">Content</div>
          <div className="text-sm text-gray-700">{selected.content}</div>
        </div>

        <div className="mb-2">
          <div className="font-medium">Platforms</div>
          <div className="text-sm text-gray-700">
            {selected.platforms.join(", ")}
          </div>
        </div>

        <div className="mb-2">
          <div className="font-medium">Status</div>
          <div className="text-sm text-gray-700">{selected.status}</div>
        </div>

        {selected.publishedAt && (
          <div className="mb-2 text-sm text-gray-600">
            Published: {new Date(selected.publishedAt).toLocaleString()}
          </div>
        )}

        <div className="mb-2">
          <div className="font-medium">Publish Result</div>
          <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(
              selected.publishResult || selected.lastError || {},
              null,
              2
            )}
          </pre>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {selected.status === "failed" && (
            <button
              onClick={() => {
                publishMutation.mutate(selected._id);
                setSelected(null);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => setSelected(null)}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
