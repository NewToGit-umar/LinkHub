import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

// Sample profile data for demo
const sampleProfile = {
  name: "Umar Farooq",
  username: "umarfarooq",
  bio: "Digital Creator | Marketing Expert | Helping brands grow online 🚀",
  avatar: "UF",
  links: [
    { title: "My Portfolio", url: "#", clicks: 2847, icon: Globe },
    { title: "Latest Blog Post", url: "#", clicks: 1523, icon: Link2 },
    { title: "Book a Consultation", url: "#", clicks: 892, icon: Calendar },
    { title: "Free Marketing Guide", url: "#", clicks: 3201, icon: Zap },
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
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-600 to-lime-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                          {sampleProfile.avatar}
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
                        {sampleProfile.links.map((link, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer ${
                              darkPreview
                                ? "bg-gradient-to-r from-emerald-700/60 to-lime-600/60 hover:from-emerald-700 hover:to-lime-600"
                                : "bg-gradient-to-r from-emerald-700/50 to-lime-600/50 hover:from-emerald-700 hover:to-lime-600"
                            }`}
                          >
                            <link.icon className="w-5 h-5 text-white" />
                            <span className="flex-1 text-white font-medium text-sm">
                              {link.title}
                            </span>
                            <span className="text-xs text-white/70">
                              {link.clicks}
                            </span>
                          </div>
                        ))}
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
    </div>
  );
}
