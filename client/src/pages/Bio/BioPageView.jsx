import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bioAPI, engagementAPI } from "../../services/api";
import { Sparkles, ExternalLink } from "lucide-react";

// Pre-defined color themes (matching BioEditor)
const colorThemes = {
  default: {
    primary: "#6366f1",
    secondary: "#a855f7",
    bg: "from-slate-50 to-indigo-50",
    dark: false,
  },
  ocean: {
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    bg: "from-blue-50 to-cyan-50",
    dark: false,
  },
  sunset: {
    primary: "#f97316",
    secondary: "#ef4444",
    bg: "from-orange-50 to-red-50",
    dark: false,
  },
  forest: {
    primary: "#22c55e",
    secondary: "#10b981",
    bg: "from-green-50 to-emerald-50",
    dark: false,
  },
  lavender: {
    primary: "#a855f7",
    secondary: "#ec4899",
    bg: "from-purple-50 to-pink-50",
    dark: false,
  },
  midnight: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    bg: "from-slate-900 to-indigo-900",
    dark: true,
  },
  "dark-ocean": {
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    bg: "from-slate-900 to-cyan-900",
    dark: true,
  },
  "dark-rose": {
    primary: "#f43f5e",
    secondary: "#ec4899",
    bg: "from-slate-900 to-pink-900",
    dark: true,
  },
};

const fontFamilies = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  playfair: "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
  roboto: "'Roboto', sans-serif",
};

const buttonStyleClasses = {
  rounded: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-md",
  outline: "rounded-xl border-2 bg-transparent",
};

export default function BioPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    bioAPI
      .getBySlug(slug)
      .then((res) => {
        setPage(res.data.page);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Page not found");
        setPage(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLinkClick = async (link, e) => {
    // Track the click before redirecting
    try {
      // Get or create visitor ID
      let visitorId = localStorage.getItem("linkhub_visitor_id");
      if (!visitorId) {
        visitorId = "v_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("linkhub_visitor_id", visitorId);
      }

      await engagementAPI.trackClick(link._id, {
        visitorId,
        referer: document.referrer || window.location.href,
      });
    } catch (err) {
      console.error("Failed to track click", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "The bio page you're looking for doesn't exist."}
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Get theme settings with fallbacks
  const settings = page.settings || {};
  const themeId = settings.theme || "default";
  const theme = colorThemes[themeId] || colorThemes.default;
  const fontFamily = fontFamilies[settings.font] || fontFamilies.inter;
  const buttonStyleClass =
    buttonStyleClasses[settings.buttonStyle] || buttonStyleClasses.rounded;
  const isOutline = settings.buttonStyle === "outline";

  return (
    <div
      className={`min-h-screen py-12 px-4 bg-gradient-to-br ${theme.bg}`}
      style={{ fontFamily }}
    >
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: theme.primary }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: theme.secondary, animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {settings.avatarUrl ? (
            <div
              className="w-28 h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-white/30"
              style={{ boxShadow: `0 10px 40px -10px ${theme.primary}50` }}
            >
              <img
                src={settings.avatarUrl}
                alt={page.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white/30"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 10px 40px -10px ${theme.primary}80`,
              }}
            >
              {page.title?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-3xl font-bold text-center mb-2 ${
            theme.dark ? "text-white" : "text-gray-800"
          }`}
        >
          {page.title || "Untitled"}
        </h1>

        {/* Description */}
        {page.description && (
          <p
            className={`text-center mb-8 ${
              theme.dark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {page.description}
          </p>
        )}

        {/* Links */}
        <div className="space-y-3">
          {(page.links || [])
            .filter((link) => link.isActive !== false)
            .map((link, index) => (
              <a
                key={link._id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(link, e)}
                className={`group block w-full py-4 px-6 text-center font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${buttonStyleClass}`}
                style={{
                  background: isOutline
                    ? "transparent"
                    : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  borderColor: isOutline ? theme.primary : "transparent",
                  color: isOutline ? theme.primary : "white",
                  boxShadow: isOutline
                    ? "none"
                    : `0 4px 20px -5px ${theme.primary}60`,
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {link.icon && <span>{link.icon}</span>}
                  {link.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
            ))}
        </div>

        {/* Stats */}
        {page.views > 0 && (
          <div
            className={`mt-8 text-center text-sm ${
              theme.dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {page.views.toLocaleString()} views
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity ${
              theme.dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Powered by LinkHub
          </Link>
        </div>
      </div>
    </div>
  );
}
