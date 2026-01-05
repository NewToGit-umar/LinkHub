import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ShareBioLink from "./ShareBioLink";
import { useTheme } from "../../hooks/useTheme";

export default function BioList() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    setLoading(true);
    api
      .get("/bio/pages/user")
      .then((r) => setPages(r.data.pages || []))
      .catch(() => {
        // Fallback: try dashboard API
        api
          .get("/dashboard")
          .then((r) => setPages(r.data.pages || []))
          .catch(() => setPages([]));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            My Bio Pages
          </h2>
          <Link
            to="/bio/new"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-lime-500 text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            + Create New
          </Link>
        </div>

        {loading ? (
          <div
            className={`text-center py-8 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Loading...
          </div>
        ) : pages.length === 0 ? (
          <div
            className={`${
              isDark
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-white/80 border-gray-200"
            } backdrop-blur-sm rounded-2xl border p-8 text-center`}
          >
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-4`}>
              You haven't created any bio pages yet.
            </p>
            <Link
              to="/bio/new"
              className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-600 to-lime-500 text-white rounded-xl hover:shadow-lg"
            >
              Create Your First Bio Page
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pages List */}
            <div className="space-y-4">
              {pages.map((p) => (
                <div
                  key={p._id}
                  className={`${
                    isDark
                      ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                      : "bg-white/80 border-gray-200 hover:border-gray-300"
                  } backdrop-blur-sm rounded-2xl border p-4 cursor-pointer transition ${
                    selectedPage?._id === p._id
                      ? "ring-2 ring-emerald-500 border-emerald-500/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPage(p)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {p.title || "Untitled"}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        /{p.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/bio/edit/${p.slug}`}
                        className="text-sm text-emerald-500 hover:text-emerald-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <a
                        href={`/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm ${
                          isDark
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                    </div>
                  </div>
                  {p.description && (
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } mt-2 line-clamp-2`}
                    >
                      {p.description}
                    </p>
                  )}
                  <div
                    className={`flex gap-4 mt-3 text-xs ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <span>{p.links?.length || 0} links</span>
                    <span>{p.views || 0} views</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Share Panel */}
            <div>
              {selectedPage ? (
                <ShareBioLink page={selectedPage} />
              ) : (
                <div
                  className={`${
                    isDark
                      ? "bg-slate-800/30 border-slate-700/50 text-gray-500"
                      : "bg-white/60 border-gray-200 text-gray-400"
                  } rounded-2xl border p-8 text-center`}
                >
                  Select a bio page to share
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          className={`mt-8 pt-4 border-t ${
            isDark ? "border-slate-700/50" : "border-gray-200"
          }`}
        >
          <Link
            to="/dashboard"
            className={`text-sm ${
              isDark
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
