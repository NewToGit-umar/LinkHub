import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { landingAPI } from "../../services/api";
import {
  Link2,
  BarChart3,
  Users,
  Calendar,
  Share2,
  ArrowRight,
  Check,
  Star,
  Zap,
  Globe,
  Shield,
  Moon,
  Sun,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ChevronDown,
  Edit3,
  X,
  Save,
  Upload,
  Plus,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

// Icon mapping for dynamic rendering
const iconMap = {
  Globe,
  Link2,
  Calendar,
  Zap,
  BarChart3,
  Users,
  Star,
  Shield,
};

// Default sample profile data (fallback)
const defaultProfile = {
  name: "Umar Farooq",
  username: "umarfarooq",
  bio: "Digital Creator | Marketing Expert | Helping brands grow online 🚀",
  avatar: "/umar-profile.png",
  links: [
    { title: "My Portfolio", url: "#", clicks: 2847, icon: "Globe" },
    { title: "Latest Blog Post", url: "#", clicks: 1523, icon: "Link2" },
    { title: "Book a Consultation", url: "#", clicks: 892, icon: "Calendar" },
    { title: "Free Marketing Guide", url: "#", clicks: 3201, icon: "Zap" },
  ],
  stats: {
    totalViews: 45892,
    totalClicks: 12847,
    followers: 28500,
  },
  socials: [
    { platform: "twitter", followers: "12.5K" },
    { platform: "instagram", followers: "28.3K" },
    { platform: "youtube", followers: "8.2K" },
  ],
};

const features = [
  {
    icon: Link2,
    title: "Bio Link Pages",
    description:
      "Create beautiful, customizable landing pages with all your important links in one place.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Calendar,
    title: "Schedule Posts",
    description:
      "Plan and schedule your content across multiple social platforms effortlessly.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your performance with detailed analytics and insights.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together with your team to manage content and campaigns.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Share2,
    title: "Multi-Platform Publishing",
    description:
      "Publish to Twitter, Instagram, Facebook, LinkedIn, and more from one place.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security.",
    color: "from-slate-500 to-gray-600",
  },
];

const platforms = [
  { name: "Twitter", icon: Twitter, color: "bg-blue-400" },
  {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
  },
  { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { name: "YouTube", icon: Youtube, color: "bg-red-500" },
];

export default function LandingPage() {
  const [darkPreview, setDarkPreview] = useState(false);
  const [sampleProfile, setSampleProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(defaultProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Avatar positioning state
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 30 }); // percentage values
  const [imageScale, setImageScale] = useState(100); // percentage scale
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const avatarContainerRef = useRef(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Fetch landing profile on mount
  useEffect(() => {
    fetchLandingProfile();
  }, []);

  const fetchLandingProfile = async () => {
    try {
      const response = await landingAPI.getProfile();
      if (response.data?.profile) {
        setSampleProfile(response.data.profile);
        setEditForm(response.data.profile);
      }
    } catch (error) {
      console.log("Using default profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ ...sampleProfile });
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await landingAPI.updateProfile(editForm);
      if (response.data?.profile) {
        setSampleProfile(response.data.profile);
        setEditForm(response.data.profile);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await landingAPI.uploadAvatar(formData);
      if (response.data?.avatar) {
        const apiBase =
          import.meta.env.VITE_API_URL?.replace("/api", "") ||
          "http://localhost:5001";
        const avatarUrl = response.data.avatar.startsWith("http")
          ? response.data.avatar
          : `${apiBase}${response.data.avatar}`;
        setEditForm((prev) => ({ ...prev, avatar: avatarUrl }));
        setSampleProfile((prev) => ({ ...prev, avatar: avatarUrl }));
        toast.success("Avatar uploaded!");
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...editForm.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditForm((prev) => ({ ...prev, links: newLinks }));
  };

  const handleAddLink = () => {
    setEditForm((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        { title: "New Link", url: "#", clicks: 0, icon: "Globe" },
      ],
    }));
  };

  const handleRemoveLink = (index) => {
    setEditForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleStatsChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      stats: { ...prev.stats, [field]: parseInt(value) || 0 },
    }));
  };

  // Avatar drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(100, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(100, e.clientY - dragStart.y));

    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const newX = Math.max(0, Math.min(100, touch.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(100, touch.clientY - dragStart.y));

    setImagePosition({ x: newX, y: newY });
  };

  const handleZoomIn = () => {
    setImageScale((prev) => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setImageScale((prev) => Math.max(100, prev - 10));
  };

  const handleResetPosition = () => {
    setImagePosition({ x: 50, y: 30 });
    setImageScale(100);
  };

  // Update editForm with position when it changes
  useEffect(() => {
    if (isEditing) {
      setEditForm((prev) => ({
        ...prev,
        avatarPosition: imagePosition,
        avatarScale: imageScale,
      }));
    }
  }, [imagePosition, imageScale, isEditing]);

  // Load saved position when opening edit modal
  const handleEditClick = () => {
    setEditForm({ ...sampleProfile });
    if (sampleProfile.avatarPosition) {
      setImagePosition(sampleProfile.avatarPosition);
    } else {
      setImagePosition({ x: 50, y: 30 });
    }
    if (sampleProfile.avatarScale) {
      setImageScale(sampleProfile.avatarScale);
    } else {
      setImageScale(100);
    }
    setIsEditing(true);
  };

  // Get avatar URL with proper base
  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/umar-profile.png";
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/uploads")) {
      const apiBase =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5001";
      return `${apiBase}${avatar}`;
    }
    return avatar;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black overflow-hidden">
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

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LinkHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-white/80 hover:text-white font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-lime-500 text-black font-medium rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80 mb-6">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Trusted by 10,000+ creators</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                All Your Links,
                <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                  {" "}
                  One Powerful Hub
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Create stunning bio pages, schedule posts across platforms, and
                grow your audience with powerful analytics. All in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-lime-500 text-black font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#demo"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  See Demo
                  <ChevronDown className="w-5 h-5" />
                </a>
              </div>

              {/* Platform icons */}
              <div className="mt-12 flex items-center gap-4 justify-center lg:justify-start">
                <span className="text-sm text-gray-400">Publish to:</span>
                <div className="flex items-center gap-3">
                  {platforms.map((p) => (
                    <div
                      key={p.name}
                      className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center shadow-lg`}
                      title={p.name}
                    >
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sample Profile Preview */}
            <div className="relative" id="demo">
              {/* Admin Edit Button */}
              {isAdmin && !isEditing && (
                <button
                  onClick={handleEditClick}
                  className="absolute -top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}

              {/* Theme toggle for preview */}
              <div className="absolute -top-4 right-4 z-20">
                <button
                  onClick={() => setDarkPreview(!darkPreview)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  title="Toggle preview theme"
                >
                  {darkPreview ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Phone mockup */}
              <div className="relative mx-auto w-[320px]">
                <div
                  className={`rounded-[3rem] p-3 ${
                    darkPreview ? "bg-gray-900" : "bg-white"
                  } shadow-2xl`}
                >
                  {/* Phone notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>

                  {/* Screen */}
                  <div
                    className={`rounded-[2.5rem] overflow-hidden ${
                      darkPreview
                        ? "bg-gray-800"
                        : "bg-gradient-to-br from-emerald-50 to-lime-50"
                    }`}
                  >
                    <div className="pt-12 pb-8 px-6">
                      {/* Profile header */}
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full shadow-lg mb-4 overflow-hidden">
                          <img
                            src={getAvatarUrl(sampleProfile.avatar)}
                            alt={sampleProfile.name}
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: sampleProfile.avatarPosition
                                ? `${sampleProfile.avatarPosition.x}% ${sampleProfile.avatarPosition.y}%`
                                : "50% 30%",
                              transform: sampleProfile.avatarScale
                                ? `scale(${sampleProfile.avatarScale / 100})`
                                : "scale(1)",
                            }}
                          />
                        </div>
                        <h3
                          className={`text-xl font-bold ${
                            darkPreview ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {sampleProfile.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            darkPreview ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          @{sampleProfile.username}
                        </p>
                        <p
                          className={`text-sm mt-2 ${
                            darkPreview ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {sampleProfile.bio}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div
                          className={`text-center p-2 rounded-xl ${
                            darkPreview
                              ? "bg-gray-700/50"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              darkPreview ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {(sampleProfile.stats.totalViews / 1000).toFixed(1)}
                            K
                          </div>
                          <div
                            className={`text-xs ${
                              darkPreview ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Views
                          </div>
                        </div>
                        <div
                          className={`text-center p-2 rounded-xl ${
                            darkPreview
                              ? "bg-gray-700/50"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              darkPreview ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {(sampleProfile.stats.totalClicks / 1000).toFixed(
                              1
                            )}
                            K
                          </div>
                          <div
                            className={`text-xs ${
                              darkPreview ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Clicks
                          </div>
                        </div>
                        <div
                          className={`text-center p-2 rounded-xl ${
                            darkPreview
                              ? "bg-gray-700/50"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <div
                            className={`text-lg font-bold ${
                              darkPreview ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {(sampleProfile.stats.followers / 1000).toFixed(1)}K
                          </div>
                          <div
                            className={`text-xs ${
                              darkPreview ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Followers
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="space-y-3">
                        {sampleProfile.links.map((link, i) => {
                          const IconComponent =
                            typeof link.icon === "string"
                              ? iconMap[link.icon] || Globe
                              : link.icon || Globe;
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer ${
                                darkPreview
                                  ? "bg-gradient-to-r from-emerald-700/60 to-lime-600/60 hover:from-emerald-700 hover:to-lime-600"
                                  : "bg-gradient-to-r from-emerald-700/50 to-lime-600/50 hover:from-emerald-700 hover:to-lime-600"
                              }`}
                            >
                              <IconComponent className="w-5 h-5 text-white" />
                              <span className="flex-1 text-white font-medium text-sm">
                                {link.title}
                              </span>
                              <span className="text-xs text-white/70">
                                {link.clicks}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Social icons */}
                      <div className="flex justify-center gap-4 mt-6">
                        <Twitter
                          className={`w-5 h-5 ${
                            darkPreview ? "text-gray-400" : "text-gray-500"
                          } hover:text-blue-400 cursor-pointer transition-colors`}
                        />
                        <Instagram
                          className={`w-5 h-5 ${
                            darkPreview ? "text-gray-400" : "text-gray-500"
                          } hover:text-pink-500 cursor-pointer transition-colors`}
                        />
                        <Youtube
                          className={`w-5 h-5 ${
                            darkPreview ? "text-gray-400" : "text-gray-500"
                          } hover:text-red-500 cursor-pointer transition-colors`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats cards */}
                <div
                  className="absolute -left-20 top-1/4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Clicks</div>
                      <div className="text-lg font-bold text-gray-800">
                        +847
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-16 bottom-1/4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-bounce"
                  style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">New Followers</div>
                      <div className="text-lg font-bold text-gray-800">
                        +1.2K
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                Grow Online
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools to manage your online presence, engage your
              audience, and track your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-700 to-lime-500 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Level Up Your Online Presence?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of creators and businesses already using LinkHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">LinkHub</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 LinkHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* Admin Edit Modal */}
      {isEditing && isAdmin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Edit Landing Profile
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Avatar Upload with Drag to Position */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar - Drag to position your photo
                </label>

                {/* Large preview with drag functionality */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div
                    ref={avatarContainerRef}
                    className="relative w-40 h-40 rounded-full overflow-hidden bg-slate-800 border-4 border-emerald-500/50 cursor-move select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                  >
                    <img
                      src={getAvatarUrl(editForm.avatar)}
                      alt="Avatar"
                      draggable={false}
                      className="absolute w-full h-full object-cover transition-transform"
                      style={{
                        objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                        transform: `scale(${imageScale / 100})`,
                      }}
                    />
                    {/* Drag indicator overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors">
                      <Move className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>

                  {/* Position controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={imageScale <= 100}
                      className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-400 w-12 text-center">
                      {imageScale}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={imageScale >= 200}
                      className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetPosition}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors ml-2"
                      title="Reset position"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Drag the image to position • Use zoom to adjust size
                  </p>
                </div>

                {/* Upload button */}
                <div className="flex justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Avatar
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stats
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Total Views
                    </label>
                    <input
                      type="number"
                      value={editForm.stats?.totalViews || 0}
                      onChange={(e) =>
                        handleStatsChange("totalViews", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Total Clicks
                    </label>
                    <input
                      type="number"
                      value={editForm.stats?.totalClicks || 0}
                      onChange={(e) =>
                        handleStatsChange("totalClicks", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Followers
                    </label>
                    <input
                      type="number"
                      value={editForm.stats?.followers || 0}
                      onChange={(e) =>
                        handleStatsChange("followers", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Links
                  </label>
                  <button
                    onClick={handleAddLink}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </button>
                </div>
                <div className="space-y-3">
                  {editForm.links?.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg"
                    >
                      <select
                        value={link.icon}
                        onChange={(e) =>
                          handleLinkChange(index, "icon", e.target.value)
                        }
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none"
                      >
                        {Object.keys(iconMap).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) =>
                          handleLinkChange(index, "title", e.target.value)
                        }
                        placeholder="Link title"
                        className="flex-1 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none"
                      />
                      <input
                        type="number"
                        value={link.clicks}
                        onChange={(e) =>
                          handleLinkChange(
                            index,
                            "clicks",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Clicks"
                        className="w-20 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 hover:bg-red-600/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
