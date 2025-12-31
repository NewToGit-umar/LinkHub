import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsAPI } from "../../services/api";
import PostComposer from "../../components/PostComposer";
import {
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Posts() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = useQuery({
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "scheduled":
      case "queued":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "publishing":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: "badge-success",
      scheduled: "badge-info",
      queued: "badge-info",
      failed: "badge-error",
      publishing: "badge-warning",
      draft: "bg-gray-100 text-gray-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Posts</h1>
            <p className="text-gray-600 mt-1">
              Manage and schedule your social media content
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="btn-secondary inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setOpen(true)}
              className="btn-primary inline-flex items-center group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Post
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-32 rounded-2xl"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-16 fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first post and start engaging with your audience
              across multiple platforms.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p, index) => (
              <div
                key={p._id}
                className="card card-hover slide-up cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelected(p)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {p.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {p.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg text-xs font-medium text-gray-600 capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    {p.scheduledAt && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Scheduled: {new Date(p.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div
                      className={`badge ${getStatusBadge(
                        p.status
                      )} flex items-center gap-1.5`}
                    >
                      {getStatusIcon(p.status)}
                      <span className="capitalize">{p.status}</span>
                    </div>
                    {p.status !== "queued" &&
                      p.status !== "publishing" &&
                      p.status !== "published" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            publishMutation.mutate(p._id);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                          Queue
                        </button>
                      )}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <PostComposer open={open} onClose={() => setOpen(false)} />

        {/* Details Modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div
              className="modal-content max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold gradient-text">
                  Post Details
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Content
                  </label>
                  <p className="text-gray-800">{selected.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selected.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium capitalize"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Status
                    </label>
                    <div
                      className={`badge ${getStatusBadge(
                        selected.status
                      )} inline-flex items-center gap-1.5`}
                    >
                      {getStatusIcon(selected.status)}
                      <span className="capitalize">{selected.status}</span>
                    </div>
                  </div>
                </div>

                {selected.publishedAt && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <label className="text-sm font-medium text-green-700 block mb-1">
                      Published
                    </label>
                    <p className="text-green-800">
                      {new Date(selected.publishedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {(selected.publishResult || selected.lastError) && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      {selected.lastError ? "Error Details" : "Publish Result"}
                    </label>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg max-h-40 overflow-auto">
                      {JSON.stringify(
                        selected.publishResult || selected.lastError || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                {selected.status === "failed" && (
                  <button
                    onClick={() => {
                      publishMutation.mutate(selected._id);
                      setSelected(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
