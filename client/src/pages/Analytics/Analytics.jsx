import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI, socialAPI } from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  FileText,
  AlertCircle,
  Sparkles,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Analytics() {
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch, isFetching, isError } = useQuery({
    queryKey: ["analytics", "aggregate"],
    queryFn: async () => {
      const r = await analyticsAPI.aggregate();
      return r.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: accountsData } = useQuery({
    queryKey: ["socialAccounts"],
    queryFn: async () => {
      const r = await socialAPI.list();
      return r.data.accounts;
    },
  });

  const connectedAccounts = accountsData?.filter((a) => a.isActive) || [];
  const hasAccounts = connectedAccounts.length > 0;

  const totals = data?.totals || [];
  const topPosts = data?.topPosts || [];
  const monthly = data?.monthly || [];

  // Calculate summary stats - show 0 when no data
  const totalLikes = hasAccounts
    ? totals.reduce((sum, t) => sum + (t.likes || 0), 0)
    : 0;
  const totalShares = hasAccounts
    ? totals.reduce((sum, t) => sum + (t.shares || 0), 0)
    : 0;
  const totalComments = hasAccounts
    ? totals.reduce((sum, t) => sum + (t.comments || 0), 0)
    : 0;
  const totalEngagement = totalLikes + totalShares + totalComments;

  const barData = hasAccounts
    ? totals.map((t) => ({
        platform: t.platform,
        likes: t.likes || 0,
        shares: t.shares || 0,
        comments: t.comments || 0,
      }))
    : [{ platform: "No Data", likes: 0, shares: 0, comments: 0 }];

  const lineData = hasAccounts
    ? monthly.map((m) => ({
        name: `${m._id?.month || 0}/${m._id?.year || 0}`,
        likes: m.likes || 0,
        shares: m.shares || 0,
        comments: m.comments || 0,
      }))
    : [];

  const pieData = [
    { name: "Likes", value: totalLikes, color: "#10b981" },
    { name: "Shares", value: totalShares, color: "#3b82f6" },
    { name: "Comments", value: totalComments, color: "#8b5cf6" },
  ];

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Analytics refreshed!");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        summary: {
          totalLikes,
          totalShares,
          totalComments,
          totalEngagement,
        },
        platformBreakdown: barData,
        monthlyTrends: lineData,
        topPosts: topPosts.map((p) => ({
          postId: p.postId,
          engagementScore: p.score || 0,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkhub-analytics-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Analytics exported successfully!");
    } catch (error) {
      toast.error("Failed to export analytics");
    } finally {
      setIsExporting(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="shimmer h-10 w-48 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-28 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="shimmer h-80 rounded-2xl"></div>
            <div className="shimmer h-80 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Unable to load analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please try again. Values will remain 0 until data loads.
          </p>
          <button
            onClick={() => refetch()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
              <BarChart3 className="w-10 h-10" />
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {hasAccounts
                ? "Track your social media performance"
                : "Connect accounts to see your analytics"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2"
            >
              <Download
                className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`}
              />
              Export
            </button>
          </div>
        </div>

        {/* No Accounts Warning */}
        {!hasAccounts && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                No Accounts Connected
              </h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Connect your social media accounts to start tracking analytics.
                All values shown are 0 until you connect accounts.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            label="Total Engagement"
            value={totalEngagement}
            color="from-emerald-500 to-green-600"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={totalLikes}
            color="from-pink-500 to-rose-500"
          />
          <StatCard
            icon={Share2}
            label="Total Shares"
            value={totalShares}
            color="from-blue-500 to-indigo-500"
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={totalComments}
            color="from-purple-500 to-violet-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Platform Breakdown
            </h2>
            {barData.length === 0 || !hasAccounts ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Sparkles className="w-12 h-12 mb-3 opacity-50" />
                <p>No platform data available</p>
                <p className="text-sm">Connect accounts to see breakdown</p>
              </div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.2}
                    />
                    <XAxis dataKey="platform" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="likes" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="shares"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="comments"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Engagement Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Engagement Distribution
            </h2>
            {totalEngagement === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Sparkles className="w-12 h-12 mb-3 opacity-50" />
                <p>No engagement data yet</p>
                <p className="text-sm">Start posting to see results</p>
              </div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Monthly Trends
          </h2>
          {lineData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Sparkles className="w-12 h-12 mb-3 opacity-50" />
              <p>No monthly data available</p>
              <p className="text-sm">
                Data will appear after you have activity over multiple months
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={lineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.2}
                  />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Posts */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Top Performing Posts
          </h2>
          {topPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No top posts available</p>
              <p className="text-sm">
                Create and publish posts to see performance data
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPosts.map((p, index) => (
                <div
                  key={p.postId || index}
                  className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-100 dark:border-slate-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-amber-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Post #{String(p.postId).slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Engagement Score
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {(p.score || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
