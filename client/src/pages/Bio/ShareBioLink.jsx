import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../hooks/useTheme";

export default function ShareBioLink({ page }) {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const slug = page?.slug || "";
  const title = page?.title || "";

  const bioUrl = `${window.location.origin}/p/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bioUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Failed to copy link");
    }
  };

  const handleExport = () => {
    if (!page) return;
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        page: {
          id: page._id,
          slug: page.slug,
          title: page.title,
          description: page.description,
          links: page.links || [],
          views: page.views || 0,
        },
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkhub-bio-${page.slug || "page"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Bio page exported successfully!");
    } catch (err) {
      toast.error("Failed to export bio page");
    }
  };

  const shareOptions = [
    {
      name: "Twitter",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=Check out ${
        title || "my bio"
      }&url=${encodeURIComponent(bioUrl)}`,
    },
    {
      name: "Facebook",
      icon: "f",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        bioUrl
      )}`,
    },
    {
      name: "LinkedIn",
      icon: "in",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        bioUrl
      )}`,
    },
    {
      name: "WhatsApp",
      icon: "📱",
      url: `https://wa.me/?text=${encodeURIComponent(
        `Check out ${title || "my bio"}: ${bioUrl}`
      )}`,
    },
    {
      name: "Email",
      icon: "✉️",
      url: `mailto:?subject=${encodeURIComponent(
        `Check out ${title || "my bio"}`
      )}&body=${encodeURIComponent(bioUrl)}`,
    },
  ];

  return (
    <div
      className={`${
        isDark
          ? "bg-slate-800/50 border-slate-700/50"
          : "bg-white/80 border-gray-200"
      } backdrop-blur-sm rounded-2xl border p-5 space-y-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Share Your Bio Page
        </h3>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow hover:shadow-lg transition"
        >
          Export JSON
        </button>
      </div>

      {/* URL Display and Copy */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={bioUrl}
          readOnly
          className={`flex-1 px-4 py-3 ${
            isDark
              ? "bg-slate-700/50 border-slate-600 text-gray-300"
              : "bg-gray-100 border-gray-200 text-gray-700"
          } border rounded-xl text-sm`}
        />
        <button
          onClick={copyToClipboard}
          className={`px-4 py-3 rounded-xl text-sm font-medium transition ${
            copied
              ? "bg-green-600 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share Buttons */}
      <div>
        <p
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          } mb-2`}
        >
          Share on
        </p>
        <div className="flex flex-wrap gap-2">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-2 ${
                isDark
                  ? "bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
              } border rounded-xl text-sm transition`}
            >
              <span>{option.icon}</span>
              {option.name}
            </a>
          ))}
        </div>
      </div>

      {/* QR Code */}
      <div
        className={`pt-4 border-t ${
          isDark ? "border-slate-700/50" : "border-gray-200"
        }`}
      >
        <p
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          } mb-3`}
        >
          QR Code
        </p>
        <div className="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
              bioUrl
            )}`}
            alt="QR Code"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
