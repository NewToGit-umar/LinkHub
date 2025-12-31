import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { bioAPI, engagementAPI } from "../../services/api";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-500">
            {error || "The bio page you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  // Extract styles from settings
  const styles = page.settings?.styles || {};
  const layout = page.settings?.layout || {};

  const bgStyle = styles.backgroundColor?.startsWith("linear")
    ? { background: styles.backgroundColor }
    : { backgroundColor: styles.backgroundColor || "#ffffff" };

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        ...bgStyle,
        fontFamily: styles.fontFamily || "Inter, system-ui, sans-serif",
      }}
    >
      <div
        className="max-w-md mx-auto"
        style={{ padding: layout.padding || "20px" }}
      >
        {/* Avatar */}
        {layout.showAvatar !== false && page.avatar && (
          <div className="flex justify-center mb-4">
            <img
              src={page.avatar}
              alt={page.title}
              className="w-24 h-24 object-cover"
              style={{ borderRadius: styles.avatarBorderRadius || "50%" }}
            />
          </div>
        )}

        {/* Title */}
        {layout.showTitle !== false && page.title && (
          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{ color: styles.textColor || "#1f2937" }}
          >
            {page.title}
          </h1>
        )}

        {/* Description */}
        {layout.showDescription !== false && page.description && (
          <p
            className="text-center mb-6 opacity-80"
            style={{ color: styles.textColor || "#1f2937" }}
          >
            {page.description}
          </p>
        )}

        {/* Links */}
        <div className="space-y-3">
          {(page.links || [])
            .filter((link) => link.isActive !== false)
            .map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(link, e)}
                className="block w-full py-3 px-4 text-center transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: styles.linkBackgroundColor || "#f3f4f6",
                  color: styles.linkColor || "#3b82f6",
                  borderRadius: styles.linkBorderRadius || "8px",
                  border:
                    styles.buttonStyle === "outlined"
                      ? `2px solid ${styles.linkColor || "#3b82f6"}`
                      : "none",
                  background:
                    styles.buttonStyle === "ghost"
                      ? "transparent"
                      : styles.linkBackgroundColor,
                }}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.title}
              </a>
            ))}
        </div>

        {/* Footer / Powered By */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs opacity-50 hover:opacity-75"
            style={{ color: styles.textColor || "#1f2937" }}
          >
            Powered by LinkHub
          </a>
        </div>
      </div>
    </div>
  );
}
