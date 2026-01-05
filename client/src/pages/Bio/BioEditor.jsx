import React, { useState, useEffect } from "react";
import { bioAPI } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import TemplateSelector from "./TemplateSelector";
import {
  Save,
  X,
  Palette,
  Type,
  Image,
  Eye,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Link2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

// Pre-defined color themes
const colorThemes = [
  {
    id: "default",
    name: "Default",
    primary: "#6366f1",
    secondary: "#a855f7",
    bg: "from-slate-50 to-indigo-50",
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    bg: "from-blue-50 to-cyan-50",
  },
  {
    id: "sunset",
    name: "Sunset",
    primary: "#f97316",
    secondary: "#ef4444",
    bg: "from-orange-50 to-red-50",
  },
  {
    id: "forest",
    name: "Forest",
    primary: "#22c55e",
    secondary: "#10b981",
    bg: "from-green-50 to-emerald-50",
  },
  {
    id: "lavender",
    name: "Lavender",
    primary: "#a855f7",
    secondary: "#ec4899",
    bg: "from-purple-50 to-pink-50",
  },
  {
    id: "midnight",
    name: "Midnight",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    bg: "from-slate-900 to-indigo-900",
    dark: true,
  },
  {
    id: "dark-ocean",
    name: "Dark Ocean",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    bg: "from-slate-900 to-cyan-900",
    dark: true,
  },
  {
    id: "dark-rose",
    name: "Dark Rose",
    primary: "#f43f5e",
    secondary: "#ec4899",
    bg: "from-slate-900 to-pink-900",
    dark: true,
  },
];

// Font options
const fontOptions = [
  { id: "inter", name: "Inter", family: "'Inter', sans-serif" },
  { id: "poppins", name: "Poppins", family: "'Poppins', sans-serif" },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "'Playfair Display', serif",
  },
  { id: "montserrat", name: "Montserrat", family: "'Montserrat', sans-serif" },
  { id: "roboto", name: "Roboto", family: "'Roboto', sans-serif" },
];

// Button styles
const buttonStyles = [
  { id: "rounded", name: "Rounded", class: "rounded-xl" },
  { id: "pill", name: "Pill", class: "rounded-full" },
  { id: "square", name: "Square", class: "rounded-md" },
  {
    id: "outline",
    name: "Outline",
    class: "rounded-xl border-2 bg-transparent",
  },
];

export default function BioEditor() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [page, setPage] = useState({
    title: "",
    slug: "",
    description: "",
    links: [],
    settings: {
      theme: "default",
      font: "inter",
      buttonStyle: "rounded",
      showAvatar: true,
      avatarUrl: "",
      customColors: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(true);
  const [activeTab, setActiveTab] = useState("colors");

  useEffect(() => {
    if (slug) {
      setLoading(true);
      bioAPI
        .getBySlug(slug)
        .then((r) => {
          const pageData = r.data.page;
          // Merge default settings with existing
          setPage({
            ...pageData,
            settings: {
              theme: "default",
              font: "inter",
              buttonStyle: "rounded",
              showAvatar: true,
              avatarUrl: "",
              ...pageData.settings,
            },
          });
        })
        .catch(() => toast.error("Failed to load bio page"))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  function handleChange(e) {
    const { name, value } = e.target;
    setPage((prev) => ({ ...prev, [name]: value }));
  }

  function handleSettingsChange(key, value) {
    setPage((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (page._id) {
        await bioAPI.update(page._id, page);
        toast.success("Bio page updated!");
      } else {
        const res = await bioAPI.create(page);
        toast.success("Bio page created!");
        navigate(`/bio/edit/${res.data.page.slug}`);
        return;
      }
      navigate(`/bio`);
    } catch (err) {
      console.error(err);
      toast.error("Error saving bio page");
    } finally {
      setLoading(false);
    }
  }

  function handleTemplateApplied(templateSlug) {
    setPage((prev) => ({
      ...prev,
      settings: { ...prev.settings, template: templateSlug },
    }));
    setShowTemplates(false);
    toast.success("Template applied!");
  }

  const selectedTheme =
    colorThemes.find((t) => t.id === page.settings?.theme) || colorThemes[0];

  // Link management functions
  function addLink() {
    setPage((prev) => ({
      ...prev,
      links: [...(prev.links || []), { title: "", url: "", id: Date.now() }],
    }));
  }

  function removeLink(index) {
    setPage((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  }

  function updateLink(index, field, value) {
    setPage((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  }

  function moveLink(fromIndex, direction) {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= page.links.length) return;

    setPage((prev) => {
      const newLinks = [...prev.links];
      [newLinks[fromIndex], newLinks[toIndex]] = [
        newLinks[toIndex],
        newLinks[fromIndex],
      ];
      return { ...prev, links: newLinks };
    });
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              {slug ? "Edit" : "Create"} Bio Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize your profile page appearance
            </p>
          </div>
          <div className="flex gap-3">
            {page._id && (
              <a
                href={`/p/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary inline-flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </a>
            )}
            <button
              onClick={() => navigate("/bio")}
              className="btn-secondary inline-flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="card slide-up">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-indigo-500" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      name="title"
                      value={page.title || ""}
                      onChange={handleChange}
                      placeholder="My Awesome Links"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="px-4 py-3 bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400 rounded-l-xl border border-r-0 border-gray-300 dark:border-slate-600 text-sm">
                        linkhub.com/p/
                      </span>
                      <input
                        name="slug"
                        value={page.slug || ""}
                        onChange={handleChange}
                        placeholder="my-links"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-r-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={page.description || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell visitors about yourself..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Links Management Card */}
              <div className="card slide-up" style={{ animationDelay: "50ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-indigo-500" />
                    Links
                  </h3>
                  <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </button>
                </div>

                {!page.links || page.links.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No links added yet</p>
                    <p className="text-xs mt-1">
                      Click "Add Link" to create your first link
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {page.links.map((link, index) => (
                      <div
                        key={link.id || index}
                        className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 pt-2">
                            <button
                              type="button"
                              onClick={() => moveLink(index, "up")}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLink(index, "down")}
                              disabled={index === page.links.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={link.title || ""}
                              onChange={(e) =>
                                updateLink(index, "title", e.target.value)
                              }
                              placeholder="Link Title"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <input
                              type="url"
                              value={link.url || ""}
                              onChange={(e) =>
                                updateLink(index, "url", e.target.value)
                              }
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Customization Card */}
              <div
                className="card slide-up"
                style={{ animationDelay: "100ms" }}
              >
                <button
                  type="button"
                  onClick={() => setShowThemePanel(!showThemePanel)}
                  className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 dark:text-white mb-4"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    Theme Customization
                  </span>
                  {showThemePanel ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showThemePanel && (
                  <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-2">
                      {[
                        { id: "colors", label: "Colors", icon: Palette },
                        { id: "typography", label: "Typography", icon: Type },
                        { id: "style", label: "Button Style", icon: Sparkles },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Colors Tab */}
                    {activeTab === "colors" && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {colorThemes.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() =>
                              handleSettingsChange("theme", theme.id)
                            }
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              page.settings?.theme === theme.id
                                ? "border-indigo-500 shadow-lg"
                                : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`h-12 rounded-lg bg-gradient-to-br ${theme.bg} mb-2`}
                            ></div>
                            <div className="flex items-center gap-1 mb-1">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.primary }}
                              ></div>
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.secondary }}
                              ></div>
                              {theme.dark && (
                                <Moon className="w-3 h-3 text-gray-500 ml-auto" />
                              )}
                            </div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {theme.name}
                            </p>
                            {page.settings?.theme === theme.id && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Typography Tab */}
                    {activeTab === "typography" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {fontOptions.map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() =>
                              handleSettingsChange("font", font.id)
                            }
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              page.settings?.font === font.id
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                            }`}
                          >
                            <p
                              className="text-2xl font-medium text-gray-800 dark:text-white mb-1"
                              style={{ fontFamily: font.family }}
                            >
                              Aa
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {font.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Button Style Tab */}
                    {activeTab === "style" && (
                      <div className="grid grid-cols-2 gap-3">
                        {buttonStyles.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() =>
                              handleSettingsChange("buttonStyle", style.id)
                            }
                            className={`p-4 rounded-xl border-2 transition-all ${
                              page.settings?.buttonStyle === style.id
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`h-10 bg-gradient-to-r from-indigo-500 to-purple-500 ${
                                style.class
                              } mb-2 ${
                                style.id === "outline"
                                  ? "bg-none bg-transparent border-indigo-500"
                                  : ""
                              }`}
                            ></div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {style.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Template Section */}
              {page._id && (
                <div
                  className="card slide-up"
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Image className="w-5 h-5 text-indigo-500" />
                      Templates
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {showTemplates ? "Hide" : "Browse Templates"}
                    </button>
                  </div>
                  {page.settings?.template && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Current template:{" "}
                      <span className="font-medium text-indigo-600">
                        {page.settings.template}
                      </span>
                    </p>
                  )}
                  {showTemplates && (
                    <TemplateSelector
                      bioPageId={page._id}
                      currentTemplate={page.settings?.template}
                      onApply={handleTemplateApplied}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div
                  className="card overflow-hidden slide-up"
                  style={{ animationDelay: "150ms" }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    Live Preview
                  </h3>

                  {/* Phone mockup */}
                  <div className="relative mx-auto w-full max-w-[260px]">
                    <div className="rounded-[2rem] p-2 bg-gray-900 shadow-2xl">
                      {/* Phone notch */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10"></div>

                      {/* Screen */}
                      <div
                        className={`rounded-[1.5rem] overflow-hidden bg-gradient-to-br ${selectedTheme.bg} min-h-[400px]`}
                      >
                        <div className="pt-8 pb-6 px-4 text-center">
                          {/* Avatar */}
                          <div
                            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg mb-3"
                            style={{ backgroundColor: selectedTheme.primary }}
                          >
                            {page.title?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          {/* Title */}
                          <h4
                            className={`font-bold mb-1 ${
                              selectedTheme.dark
                                ? "text-white"
                                : "text-gray-800"
                            }`}
                            style={{
                              fontFamily: fontOptions.find(
                                (f) => f.id === page.settings?.font
                              )?.family,
                            }}
                          >
                            {page.title || "Your Title"}
                          </h4>

                          {/* Description */}
                          <p
                            className={`text-xs mb-4 ${
                              selectedTheme.dark
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            {page.description || "Your description here"}
                          </p>

                          {/* Sample links */}
                          <div className="space-y-2">
                            {(page.links && page.links.length > 0
                              ? page.links
                              : [
                                  { title: "Link 1", url: "#" },
                                  { title: "Link 2", url: "#" },
                                  { title: "Link 3", url: "#" },
                                ]
                            ).map((link, i) => {
                              const btnStyle =
                                buttonStyles.find(
                                  (s) => s.id === page.settings?.buttonStyle
                                ) || buttonStyles[0];
                              return (
                                <a
                                  key={link.id || i}
                                  href={link.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block py-2 px-4 text-white text-xs font-medium ${btnStyle.class} transition-transform hover:scale-[1.02] cursor-pointer`}
                                  style={{
                                    background:
                                      btnStyle.id === "outline"
                                        ? "transparent"
                                        : `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.secondary})`,
                                    borderColor:
                                      btnStyle.id === "outline"
                                        ? selectedTheme.primary
                                        : "transparent",
                                    color:
                                      btnStyle.id === "outline"
                                        ? selectedTheme.primary
                                        : "white",
                                  }}
                                  onClick={(e) => {
                                    if (!link.url || link.url === "#") {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  {link.title || `Link ${i + 1}`}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
