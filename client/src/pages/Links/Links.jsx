import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Link2,
  Plus,
  ExternalLink,
  Trash2,
  Edit2,
  BarChart3,
  Eye,
  MousePointer,
  GripVertical,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Links() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [selectedBioPage, setSelectedBioPage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
  });

  // Fetch user's bio pages
  const { data: bioPages, isLoading: loadingPages } = useQuery({
    queryKey: ["bio-pages"],
    queryFn: async () => {
      const res = await api.get("/bio/pages/user");
      return res.data.pages || [];
    },
  });

  // Set default selected page
  useEffect(() => {
    if (bioPages?.length > 0 && !selectedBioPage) {
      setSelectedBioPage(bioPages[0]);
    }
  }, [bioPages, selectedBioPage]);

  // Add link mutation
  const addLinkMutation = useMutation({
    mutationFn: async (linkData) => {
      const page = selectedBioPage;
      const updatedLinks = [
        ...(page.links || []),
        { ...linkData, id: Date.now().toString() },
      ];
      return api.patch(`/bio/pages/${page._id}`, { links: updatedLinks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bio-pages"]);
      setShowAddModal(false);
      setNewLink({ title: "", url: "", description: "" });
      toast.success("Link added successfully!");
    },
    onError: () => toast.error("Failed to add link"),
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ linkId, linkData }) => {
      const page = selectedBioPage;
      const updatedLinks = page.links.map((l) =>
        l.id === linkId || l._id === linkId ? { ...l, ...linkData } : l
      );
      return api.patch(`/bio/pages/${page._id}`, { links: updatedLinks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bio-pages"]);
      setEditingLink(null);
      toast.success("Link updated!");
    },
    onError: () => toast.error("Failed to update link"),
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId) => {
      const page = selectedBioPage;
      const updatedLinks = page.links.filter(
        (l) => l.id !== linkId && l._id !== linkId
      );
      return api.patch(`/bio/pages/${page._id}`, { links: updatedLinks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bio-pages"]);
      toast.success("Link deleted!");
    },
    onError: () => toast.error("Failed to delete link"),
  });

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    addLinkMutation.mutate(newLink);
  };

  const handleUpdateLink = (e) => {
    e.preventDefault();
    if (!editingLink) return;
    updateLinkMutation.mutate({
      linkId: editingLink.id || editingLink._id,
      linkData: {
        title: editingLink.title,
        url: editingLink.url,
        description: editingLink.description,
      },
    });
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id || link._id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("URL copied!");
  };

  const links = selectedBioPage?.links || [];

  if (loadingPages) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Link Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all your bio page links in one place
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedBioPage}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Link
          </button>
        </div>

        {/* Bio Page Selector */}
        {bioPages?.length > 0 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bio Page
            </label>
            <div className="flex gap-3 flex-wrap">
              {bioPages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => setSelectedBioPage(page)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedBioPage?._id === page._id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
                  }`}
                >
                  {page.title || page.slug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/50">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Bio Pages Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create a bio page first to start managing your links
            </p>
            <Link
              to="/bio/new"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Bio Page
            </Link>
          </div>
        )}

        {/* Links List */}
        {selectedBioPage && (
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Links Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start adding links to your bio page
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Link
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {links.map((link, index) => (
                  <div
                    key={link.id || link._id || index}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-5 border border-white/50 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Link2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {link.title}
                        </h3>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 truncate block mt-1"
                        >
                          {link.url}
                        </a>
                        {link.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {link.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MousePointer className="w-3 h-3" />
                            {link.clicks || 0} clicks
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(link)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          {copiedId === (link.id || link._id) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() =>
                            deleteLinkMutation.mutate(link.id || link._id)
                          }
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Link Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Add New Link
              </h2>
              <form onSubmit={handleAddLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="My Website"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newLink.description}
                    onChange={(e) =>
                      setNewLink((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    placeholder="A short description..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLinkMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {addLinkMutation.isPending ? "Adding..." : "Add Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Link Modal */}
        {editingLink && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Edit Link
              </h2>
              <form onSubmit={handleUpdateLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingLink.title}
                    onChange={(e) =>
                      setEditingLink((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={editingLink.url}
                    onChange={(e) =>
                      setEditingLink((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingLink.description || ""}
                    onChange={(e) =>
                      setEditingLink((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingLink(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLinkMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {updateLinkMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
