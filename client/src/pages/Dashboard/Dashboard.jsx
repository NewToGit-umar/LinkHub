import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  Users,
  Link2,
  Plus,
  Eye,
  Share2,
  MessageCircle,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";
import { dashboardAPI } from "../../services/api";
import StatCard from "./StatCard";

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardAPI.getDashboardData,
    staleTime: 0,
    cacheTime: 1000 * 60 * 5,
    refetchInterval: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="shimmer h-10 w-48 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-32 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="shimmer h-64 rounded-2xl"></div>
            <div className="shimmer h-64 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.data?.stats || {
    totalPosts: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
    totalEngagement: 0,
  };

  const recentPosts = dashboardData?.data?.recentPosts || [
    {
      id: 1,
      content: "Just launched our new feature!",
      status: "published",
      engagement: 245,
    },
    {
      id: 2,
      content: "Weekly tips for social media growth",
      status: "scheduled",
      engagement: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <Link
            to="/posts"
            className="btn-primary inline-flex items-center group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="slide-up" style={{ animationDelay: "0ms" }}>
            <StatCard
              title="Total Posts"
              value={stats.totalPosts}
              icon={Calendar}
              trend={{ value: 12, isPositive: true }}
              color="blue"
              gradient="from-blue-500 to-indigo-500"
            />
          </div>
          <div className="slide-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Scheduled"
              value={stats.scheduledPosts}
              icon={Zap}
              trend={{ value: 5, isPositive: true }}
              color="green"
              gradient="from-green-500 to-emerald-500"
            />
          </div>
          <div className="slide-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Connected Accounts"
              value={stats.connectedAccounts}
              icon={Users}
              trend={{ value: 2, isPositive: true }}
              color="purple"
              gradient="from-purple-500 to-pink-500"
            />
          </div>
          <div className="slide-up" style={{ animationDelay: "300ms" }}>
            <StatCard
              title="Total Engagement"
              value={stats.totalEngagement?.toLocaleString() || "0"}
              icon={TrendingUp}
              trend={{ value: 8, isPositive: true }}
              color="orange"
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div
            className="card card-hover fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Recent Activity
              </h3>
              <Link
                to="/posts"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 float">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-500">No recent activity yet</p>
                  <Link
                    to="/posts"
                    className="text-indigo-600 text-sm hover:underline mt-2 inline-block"
                  >
                    Create your first post
                  </Link>
                </div>
              ) : (
                recentPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300"
                    style={{ animationDelay: `${500 + index * 100}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`badge ${
                            post.status === "published"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 ml-4">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="font-medium">{post.engagement}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="card card-hover fade-in"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/accounts"
                className="group p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Connect Accounts
                </span>
              </Link>
              <Link
                to="/analytics"
                className="group p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  View Analytics
                </span>
              </Link>
              <Link
                to="/links"
                className="group p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Link2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Manage Links
                </span>
              </Link>
              <Link
                to="/teams"
                className="group p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Team
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
