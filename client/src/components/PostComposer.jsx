import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsAPI, mediaAPI } from "../services/api";
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
  Video,
  Smile,
  Upload,
  Trash2,
  Tag,
  Globe,
  Lock,
  Eye,
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

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    icon: Globe,
    description: "Anyone can see",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    icon: Eye,
    description: "Only with link",
  },
  { value: "private", label: "Private", icon: Lock, description: "Only you" },
];

const youtubeCategories = [
  { id: "22", name: "People & Blogs" },
  { id: "28", name: "Science & Technology" },
  { id: "24", name: "Entertainment" },
  { id: "23", name: "Comedy" },
  { id: "27", name: "Education" },
  { id: "26", name: "Howto & Style" },
  { id: "20", name: "Gaming" },
  { id: "10", name: "Music" },
  { id: "17", name: "Sports" },
  { id: "25", name: "News & Politics" },
];

export default function PostComposer({ open, onClose }) {
  const qc = useQueryClient();
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Media state (for non-YouTube platforms)
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // YouTube-specific state
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [categoryId, setCategoryId] = useState("22");

  // Common emojis for quick access
  const commonEmojis = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "🤩",
    "😎",
    "🤔",
    "😊",
    "👍",
    "👏",
    "🙌",
    "💪",
    "🎉",
    "🔥",
    "❤️",
    "💯",
    "✨",
    "⭐",
    "🌟",
    "💡",
    "🚀",
    "💰",
    "🎯",
    "✅",
    "📢",
    "📌",
    "🔗",
    "📸",
    "🎬",
    "🎵",
    "💻",
    "📱",
  ];

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
    setShowEmojiPicker(false);
  };

  const isYouTubeSelected = platforms.includes("youtube");
  const isYouTubeOnly = platforms.length === 1 && platforms[0] === "youtube";

  const mutation = useMutation({
    mutationFn: async (payload) => {
      // If YouTube is selected and we have a video file, upload it first
      if (payload.platforms.includes("youtube") && videoFile) {
        setIsUploading(true);
        try {
          const uploadRes = await mediaAPI.uploadVideo(
            videoFile,
            setUploadProgress
          );
          payload.media = [
            {
              url: uploadRes.data.video.url,
              type: "video",
              filename: uploadRes.data.video.filename,
            },
          ];
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Upload images for non-YouTube posts
      if (mediaFiles.length > 0 && !payload.platforms.includes("youtube")) {
        setIsUploading(true);
        try {
          const uploadRes = await mediaAPI.uploadImages(
            mediaFiles,
            setUploadProgress
          );
          payload.media = uploadRes.data.images.map((img) => ({
            url: img.url,
            type: "image",
            filename: img.filename,
          }));
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      return postsAPI.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries(["posts"]);
      qc.invalidateQueries(["dashboard"]);
      resetForm();
      onClose();
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  const resetForm = () => {
    setContent("");
    setPlatforms([]);
    setScheduledAt("");
    setVideoFile(null);
    setVideoPreviewUrl("");
    setTitle("");
    setTags("");
    setVisibility("public");
    setCategoryId("22");
    setShowEmojiPicker(false);
    // Clear media files and revoke URLs
    mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  const providerOptions = [
    "twitter",
    "instagram",
    "facebook",
    "linkedin",
    "youtube",
    "tiktok",
  ];

  const togglePlatform = (p) => {
    setPlatforms((prev) => {
      const newPlatforms = prev.includes(p)
        ? prev.filter((x) => x !== p)
        : [...prev, p];

      // Clear video if YouTube is deselected
      if (p === "youtube" && prev.includes(p)) {
        setVideoFile(null);
        setVideoPreviewUrl("");
      }

      return newPlatforms;
    });
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (500MB max)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file must be less than 500MB");
        return;
      }

      // Validate file type
      const validTypes = [
        "video/mp4",
        "video/mov",
        "video/avi",
        "video/webm",
        "video/quicktime",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid video file (MP4, MOV, AVI, WebM)");
        return;
      }

      setVideoFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
    }
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl("");
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Image/Media handling for non-YouTube platforms
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const remainingSlots = 4 - mediaFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${4} images maximum`);
    }

    const validFiles = [];
    const newPreviews = [];

    filesToAdd.forEach((file) => {
      // Validate file size (10MB max per image)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per image.`);
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return;
      }

      validFiles.push(file);
      newPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name,
      });
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(mediaPreviews[index].url);

    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = (e) => {
    e.preventDefault();

    // Validation
    if (platforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    // YouTube-specific validation
    if (isYouTubeSelected) {
      if (!videoFile) {
        toast.error("YouTube requires a video file");
        return;
      }
      if (!title.trim()) {
        toast.error("YouTube requires a video title");
        return;
      }
    } else if (!content.trim()) {
      toast.error("Please write some content");
      return;
    }

    const payload = {
      content: content || "",
      platforms,
      scheduledAt: scheduledAt || undefined,
    };

    // Add YouTube-specific fields
    if (isYouTubeSelected) {
      payload.title = title;
      payload.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      payload.visibility = visibility;
      payload.categoryId = categoryId;
    }

    mutation.mutate(payload);
  };

  const characterCount = content.length;
  const maxChars = isYouTubeOnly ? 5000 : 280;

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 scale-in overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-500 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <p className="text-white/70 text-sm">
                {isYouTubeSelected
                  ? "Upload video to YouTube"
                  : "Share across your platforms"}
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

          {/* YouTube Video Upload Section */}
          {isYouTubeSelected && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700">
                  YouTube Video
                </span>
              </div>

              {/* Video Title */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {title.length}/100 characters
                </div>
              </div>

              {/* Video Upload */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Video File <span className="text-red-500">*</span>
                </label>

                {!videoFile ? (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-all"
                  >
                    <Video className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">
                      Click to upload video
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      MP4, MOV, AVI, WebM up to 500MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full rounded-xl max-h-64 bg-black"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-sm text-gray-600">
                      {videoFile.name} (
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  </div>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tech, tutorial, programming..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              {/* Visibility & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  >
                    {visibilityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} - {opt.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  >
                    {youtubeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content Editor (Description for YouTube) */}
          <div className="relative mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              {isYouTubeSelected ? "Description" : "Content"}
            </label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isYouTubeSelected
                  ? "Enter video description..."
                  : "What's on your mind? Share something amazing..."
              }
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl min-h-[120px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-gray-800 placeholder:text-gray-400"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-3">
              {!isYouTubeOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-indigo-600 cursor-pointer"
                    title="Add images"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-yellow-500 cursor-pointer"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {/* Emoji Picker Dropdown */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-10 right-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-72">
                        <div className="text-xs font-medium text-gray-500 mb-2">
                          Quick Emojis
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => insertEmoji(emoji)}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <span
                className={`text-sm font-medium ${
                  characterCount > maxChars ? "text-red-500" : "text-gray-400"
                }`}
              >
                {characterCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Image Previews (for non-YouTube) */}
          {!isYouTubeOnly && mediaPreviews.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Attached Images ({mediaPreviews.length}/4)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {mediaPreviews.length < 4 && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                  >
                    <Image className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add more</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hidden image input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

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
              className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
                mutation.isPending ||
                isUploading ||
                platforms.length === 0 ||
                (isYouTubeSelected && (!videoFile || !title.trim())) ||
                (!isYouTubeSelected && !content.trim())
              }
              className="btn-primary order-1 sm:order-2 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending || isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isUploading
                    ? `Uploading ${uploadProgress}%...`
                    : "Creating..."}
                </>
              ) : (
                <>
                  {isYouTubeSelected ? (
                    <Upload className="w-5 h-5 mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {scheduledAt
                    ? "Schedule"
                    : isYouTubeSelected
                    ? "Upload to YouTube"
                    : "Post Now"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
