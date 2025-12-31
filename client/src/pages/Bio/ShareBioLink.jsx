import { useState } from "react";
import toast from "react-hot-toast";

export default function ShareBioLink({ page }) {
  const [copied, setCopied] = useState(false);

  const slug = page?.slug || "";
  const title = page?.title || "";

  const bioUrl = `${window.location.origin}/p/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
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
      toast.success("Bio page exported");
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
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-700">
          Share Your Bio Page
        </h3>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow hover:shadow-lg transition"
        >
          Export JSON
        </button>
      </div>

      {/* URL Display and Copy */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={bioUrl}
          readOnly
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
        />
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-2">
        {shareOptions.map((option) => (
          <a
            key={option.name}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
          >
            <span className="text-xs">{option.icon}</span>
            {option.name}
          </a>
        ))}
      </div>

      {/* QR Code Placeholder */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 mb-2">QR Code</p>
        <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
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
