import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { publicProfileAPI } from "../../services/api";
import {
  User,
  MapPin,
  Globe,
  Calendar,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  BarChart3,
  MousePointerClick,
  Eye,
  FileText,
  Link2,
  Users,
  CheckCircle,
  Sparkles,
  Music2,
} from "lucide-react";
import toast from "react-hot-toast";

// Platform icons and colors
const platformConfig = {
  twitter: {
    icon: Twitter,
    color: "bg-sky-500",
    hoverColor: "hover:bg-sky-600",
    name: "Twitter",
  },
  instagram: {
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    hoverColor: "hover:opacity-90",
    name: "Instagram",
  },
  facebook: {
    icon: Facebook,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    name: "Facebook",
  },
  linkedin: {
    icon: Linkedin,
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
    name: "LinkedIn",
  },
  youtube: {
    icon: Youtube,
    color: "bg-red-600",
    hoverColor: "hover:bg-red-700",
    name: "YouTube",
  },
  tiktok: {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    color: "bg-black",
    hoverColor: "hover:bg-gray-900",
    name: "TikTok",
  },
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

// Social Account Card
const SocialAccountCard = ({ account, onVisit }) => {
  const config = platformConfig[account.platform] || {
    icon: Globe,
    color: "bg-gray-600",
    hoverColor: "hover:bg-gray-700",
    name: account.platform,
  };
  const Icon = config.icon;

  // Format followers count
  const formatFollowers = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const followerLabel =
    account.platform === "youtube"
      ? "subscribers"
      : account.platform === "linkedin"
      ? "connections"
      : "followers";

  return (
    <a
      href={account.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onVisit}
      className={`flex items-center gap-3 p-4 ${config.color} ${config.hoverColor} rounded-xl transition-all transform hover:scale-[1.02] group cursor-pointer`}
    >
      {/* Profile Picture or Platform Icon */}
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
        {account.profilePicture ? (
          <img
            src={account.profilePicture}
            alt={account.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {account.name || `@${account.handle}`}
        </p>
        <p className="text-sm text-white/70 truncate">@{account.handle}</p>
      </div>
      {/* Stats */}
      <div className="flex items-center gap-3">
        {formatFollowers(account.followers) && (
          <div className="text-right">
            <p className="text-sm font-bold text-white">
              {formatFollowers(account.followers)}
            </p>
            <p className="text-xs text-white/70">{followerLabel}</p>
          </div>
        )}
        <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
      </div>
    </a>
  );
};

// Link Card Component
const LinkCard = ({ link, onLinkClick }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => onLinkClick(link.id)}
    className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
        {link.icon ? (
          <span className="text-lg">{link.icon}</span>
        ) : (
          <Link2 className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{link.title}</p>
        <p className="text-sm text-gray-400 truncate">{link.url}</p>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <MousePointerClick className="w-4 h-4" />
        <span className="text-sm">{link.clicks}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
    </div>
  </a>
);

// Bio Page Card
const BioPageCard = ({ page }) => (
  <Link
    to={`/p/${page.slug}`}
    className="block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all group"
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{page.title}</p>
        <p className="text-sm text-gray-400">{page.linkCount} links</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
    </div>
  </Link>
);

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    publicProfileAPI
      .getProfile(username)
      .then((res) => {
        setProfile(res.data.profile);
        setError(null);
        // Track page view
        publicProfileAPI.trackView(username, {
          visitorId:
            localStorage.getItem("linkhub_visitor_id") || generateVisitorId(),
          referer: document.referrer,
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Profile not found");
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const generateVisitorId = () => {
    const id = "v_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("linkhub_visitor_id", id);
    return id;
  };

  const handleShare = async () => {
    const profileUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name}'s LinkHub Profile`,
          text: `Check out ${profile?.name}'s profile on LinkHub`,
          url: profileUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(profileUrl);
        }
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = async (linkId) => {
    try {
      await publicProfileAPI.trackClick(username, linkId);
    } catch (err) {
      console.error("Failed to track click", err);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/uploads")) {
      const apiBase =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5001";
      return `${apiBase}${avatar}`;
    }
    return avatar;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-emerald-950 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-emerald-950 to-black">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {error ||
              "The profile you're looking for doesn't exist or is private."}
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-lime-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">LinkHub</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {copied ? "Copied!" : "Share"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-10">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            {profile.avatar ? (
              <img
                src={getAvatarUrl(profile.avatar)}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover object-top border-4 border-emerald-500/50 shadow-xl shadow-emerald-500/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center border-4 border-emerald-500/50">
                <User className="w-16 h-16 text-white" />
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-full flex items-center justify-center border-2 border-black">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Name & Username */}
          <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
          <p className="text-emerald-400 font-medium mb-3">
            @{profile.username}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-300 max-w-lg mx-auto mb-4">{profile.bio}</p>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined{" "}
              {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <StatCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={profile.stats.totalClicks}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Eye}
            label="Page Views"
            value={profile.stats.totalPageViews}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <StatCard
            icon={FileText}
            label="Posts"
            value={profile.stats.totalPosts}
            color="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <StatCard
            icon={Link2}
            label="Links"
            value={profile.stats.totalLinks}
            color="bg-gradient-to-br from-emerald-500 to-lime-500"
          />
          <StatCard
            icon={Users}
            label="Followers"
            value={profile.stats.totalFollowers}
            color="bg-gradient-to-br from-indigo-500 to-purple-500"
          />
        </div>

        {/* Social Accounts */}
        {profile.socialAccounts && profile.socialAccounts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Connected Accounts
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {profile.socialAccounts.map((account, index) => (
                <SocialAccountCard key={index} account={account} />
              ))}
            </div>
          </div>
        )}

        {/* Bio Pages */}
        {profile.bioPages && profile.bioPages.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Bio Pages
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {profile.bioPages.map((page, index) => (
                <BioPageCard key={index} page={page} />
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {profile.links && profile.links.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              Links
            </h2>
            <div className="space-y-3">
              {profile.links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <Link
              to="/"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              LinkHub
            </Link>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Create your own profile at{" "}
            <Link to="/register" className="text-emerald-400 hover:underline">
              linkhub.com
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
