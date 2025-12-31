import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import {
  X,
  Send,
  Calendar,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Sparkles,
  Image,
  Smile,
} from "lucide-react";
import toast from "react-hot-toast";

const platformIcons = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Sparkles,
};

const platformColors = {
  twitter: "from-blue-400 to-blue-500",
  instagram: "from-pink-500 to-purple-500",
  facebook: "from-blue-600 to-blue-700",
  linkedin: "from-blue-700 to-blue-800",
  youtube: "from-red-500 to-red-600",
  tiktok: "from-gray-900 to-gray-800",
};

export default function PostComposer({ open, onClose }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");

  const mutation = useMutation({
    mutationFn: (payload) => postsAPI.create(payload),
    onSuccess: () => {
      qc.invalidateQueries(["posts"]);
      qc.invalidateQueries(["dashboard"]);
      setContent("");
      setPlatforms([]);
      setScheduledAt("");
      onClose();
      toast.success("Post created successfully!");
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  const providerOptions = [
    "twitter",
    "instagram",
    "facebook",
    "linkedin",
    "tiktok",
    "youtube",
  ];

  const togglePlatform = (p) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please write some content");
      return;
    }
    if (platforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }
    mutation.mutate({
      content,
      platforms,
      scheduledAt: scheduledAt || undefined,
    });
  };

  const characterCount = content.length;
  const maxChars = 280;

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <p className="text-white/70 text-sm">
                Share across your platforms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6">
          {/* Content Editor */}
          <div className="relative mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share something amazing..."
              className="w-full p-4 border-2 border-gray-200 rounded-2xl min-h-[150px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-gray-800 placeholder:text-gray-400"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-3">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <Smile className="w-5 h-5" />
              </button>
              <span
                className={`text-sm font-medium ${
                  characterCount > maxChars ? "text-red-500" : "text-gray-400"
                }`}
              >
                {characterCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Select Platforms
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {providerOptions.map((p) => {
                const Icon = platformIcons[p] || Sparkles;
                const isSelected = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-br ${platformColors[p]} text-white border-transparent shadow-lg scale-105`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium capitalize">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                mutation.isPending || platforms.length === 0 || !content.trim()
              }
              className="btn-primary order-1 sm:order-2 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {scheduledAt ? "Schedule Post" : "Post Now"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
