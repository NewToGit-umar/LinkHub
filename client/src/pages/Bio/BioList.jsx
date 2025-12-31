import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ShareBioLink from "./ShareBioLink";

export default function BioList() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Bio Pages</h2>
          <Link
            to="/bio/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Create New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              You haven't created any bio pages yet.
            </p>
            <Link
              to="/bio/new"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${
                    selectedPage?._id === p._id
                      ? "ring-2 ring-indigo-500"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPage(p)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {p.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500">/{p.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/bio/edit/${p.slug}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <a
                        href={`/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
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
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                  Select a bio page to share
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-4 border-t">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
