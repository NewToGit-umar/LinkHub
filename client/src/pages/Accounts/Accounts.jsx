import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Music2,
  Link2,
  RefreshCw,
  Unlink,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Info,
  Users,
  Video,
  Image as ImageIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const providers = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "from-blue-400 to-blue-500",
    bgColor: "bg-blue-500",
    description: "Share updates and engage with followers",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "from-purple-500 via-pink-500 to-orange-400",
    bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    description: "Share photos and stories",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-600",
    description: "Connect with your audience",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-700 to-blue-800",
    bgColor: "bg-blue-700",
    description: "Professional networking",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500",
    description: "Share video content",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    color: "from-gray-900 to-black",
    bgColor: "bg-black",
    description: "Short-form video content",
  },
];

export default function Accounts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [demoHandle, setDemoHandle] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [disconnectingProvider, setDisconnectingProvider] = useState(null);
  const [connectMode, setConnectMode] = useState("real"); // 'real' or 'demo'

  // Handle OAuth callback results
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      toast.success(
        `${
          connected.charAt(0).toUpperCase() + connected.slice(1)
        } account connected successfully!`
      );
      qc.invalidateQueries(["social_accounts"]);
      // Clear the URL params
      setSearchParams({});
    }

    if (error) {
      // Decode URL-encoded error message
      const decodedError = decodeURIComponent(error).replace(/_/g, " ");
      toast.error(`Connection failed: ${decodedError}`);
      setSearchParams({});
    }
  }, [searchParams, qc, setSearchParams]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["social_accounts"],
    queryFn: async () => {
      const res = await socialAPI.list();
      return res.data.accounts;
    },
    enabled: !!user,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider) => {
      setDisconnectingProvider(provider);
      try {
        const result = await socialAPI.disconnect(provider);
        return { result, provider };
      } catch (error) {
        setDisconnectingProvider(null);
        throw error;
      }
    },
    onSuccess: ({ provider }) => {
      setDisconnectingProvider(null);
      qc.invalidateQueries(["social_accounts"]);
      qc.invalidateQueries(["analytics", "aggregate"]);
      toast.success("Account disconnected successfully");
    },
    onError: (error, provider) => {
      console.error("Disconnect error:", error);
      setDisconnectingProvider(null);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to disconnect account"
      );
    },
  });

  const syncMutation = useMutation({
    mutationFn: (provider) => socialAPI.refresh(provider),
    onSuccess: () => {
      qc.invalidateQueries(["social_accounts"]);
      toast.success("Account synced");
    },
    onError: () => toast.error("Failed to sync account"),
    onSettled: () => qc.invalidateQueries(["analytics", "aggregate"]),
  });

  // Demo mode - connect with fake credentials
  const connectDemoMutation = useMutation({
    mutationFn: async ({ provider, handle }) => {
      if (!demoUrl.trim()) {
        throw new Error("Please paste the profile link to connect.");
      }
      // Use the callback endpoint directly with demo tokens
      const response = await socialAPI.callback(provider, {
        accessToken: `demo_access_${Date.now()}`,
        refreshToken: `demo_refresh_${Date.now()}`,
        accountId: `demo_${provider}_${Date.now()}`,
        accountHandle: handle || `demo_${provider}`,
        accountName: `Demo ${
          provider.charAt(0).toUpperCase() + provider.slice(1)
        } Account`,
        profileData: {
          url: demoUrl.trim(),
          followers: Math.floor(Math.random() * 10000),
          bio: "Demo account for testing",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries(["social_accounts"]);
      toast.success("Demo account connected!");
      setDemoModalOpen(false);
      setDemoHandle("");
      setDemoUrl("");
      setSelectedProvider(null);
    },
    onError: (err) => {
      toast.error(
        err.message ||
          err.response?.data?.message ||
          "Failed to connect demo account"
      );
    },
  });

  const handleConnect = (provider) => {
    setSelectedProvider(provider);
    setConnectMode("real");
    setDemoModalOpen(true);
  };

  // Real OAuth connection - redirects to backend OAuth flow
  const handleRealConnect = () => {
    const authToken = localStorage.getItem("linkhub_token");
    if (selectedProvider && authToken) {
      // Redirect to OAuth start endpoint with token in query
      window.location.href = `${API_BASE}/social/start/${
        selectedProvider.id
      }?token=${encodeURIComponent(authToken)}`;
    } else {
      toast.error("Please log in to connect accounts");
    }
  };

  const handleDemoConnect = () => {
    if (selectedProvider) {
      connectDemoMutation.mutate({
        provider: selectedProvider.id,
        handle: demoHandle || `demo_${selectedProvider.id}`,
      });
    }
  };

  const accounts = data || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer h-48 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Failed to load accounts
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please try again later
          </p>
          <button onClick={() => refetch()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              Connected Accounts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your social media connections
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="btn-secondary inline-flex items-center"
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 border border-indigo-200 dark:border-indigo-800">
          <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200">
              <strong>Demo Mode:</strong> This is a demonstration environment.
              Click "Connect" to add a simulated account for testing purposes.
              In production, this would redirect to the actual OAuth flow for
              each platform.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold gradient-text">
              {accounts.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Connected
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-400">
              {providers.length - accounts.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Available
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {accounts.filter((a) => a.status === "active").length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Active
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {accounts.filter((a) => a.status !== "active").length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Needs Attention
            </div>
          </div>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider, index) => {
            const account = accounts.find((a) => a.platform === provider.id);
            const Icon = provider.icon;

            return (
              <div
                key={provider.id}
                className="card card-hover slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header with gradient */}
                <div className={`h-2 bg-gradient-to-r ${provider.color}`}></div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${provider.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    {account && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </div>
                    )}
                  </div>

                  {account ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          {account.profileData?.profilePicture ? (
                            <img
                              src={account.profileData.profilePicture}
                              alt={account.accountHandle}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {account.accountHandle
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                              @{account.accountHandle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {account.accountName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-2">
                        {(account.profileData?.followerCount !== undefined ||
                          account.profileData?.followers) && (
                          <div className="flex items-center gap-2 p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                                {(
                                  account.profileData.followerCount ||
                                  account.profileData.followers ||
                                  0
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {provider.id === "youtube"
                                  ? "Subscribers"
                                  : provider.id === "linkedin"
                                  ? "Connections"
                                  : "Followers"}
                              </p>
                            </div>
                          </div>
                        )}
                        {account.profileData?.postsCount !== undefined && (
                          <div className="flex items-center gap-2 p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800">
                            {provider.id === "youtube" ||
                            provider.id === "tiktok" ? (
                              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                            <div>
                              <p className="text-sm font-bold text-purple-800 dark:text-purple-200">
                                {account.profileData.postsCount.toLocaleString()}
                              </p>
                              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                {provider.id === "youtube"
                                  ? "Videos"
                                  : provider.id === "tiktok"
                                  ? "Videos"
                                  : "Posts"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Last sync:{" "}
                        {account.lastSyncAt
                          ? new Date(account.lastSyncAt).toLocaleString()
                          : "Never"}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => syncMutation.mutate(provider.id)}
                          disabled={syncMutation.isLoading}
                          className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              syncMutation.isLoading ? "animate-spin" : ""
                            }`}
                          />
                          Sync
                        </button>
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              "Disconnect this account? You can reconnect anytime."
                            );
                            if (confirmed) {
                              disconnectMutation.mutate(provider.id);
                            }
                          }}
                          disabled={
                            disconnectMutation.isPending ||
                            disconnectingProvider === provider.id
                          }
                          className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                        >
                          <Unlink
                            className={`w-4 h-4 ${
                              disconnectMutation.isPending &&
                              disconnectingProvider === provider.id
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                          Disconnect
                        </button>
                        {account.profileData?.url && (
                          <a
                            href={account.profileData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-1"
                            title="Visit profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paste your profile link to connect
                      </p>
                      <button
                        onClick={() => handleConnect(provider)}
                        className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Connect {provider.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connect Modal - Supports Real OAuth and Demo Mode */}
        {demoModalOpen && selectedProvider && (
          <div
            className="modal-overlay"
            onClick={() => setDemoModalOpen(false)}
          >
            <div
              className="modal-content max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 ${selectedProvider.bgColor} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <selectedProvider.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-400">
                    Connect {selectedProvider.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {connectMode === "real" ? "OAuth Connection" : "Demo Mode"}
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-slate-700/50 rounded-xl mb-6">
                <button
                  onClick={() => setConnectMode("real")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    connectMode === "real"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Real Account
                </button>
                <button
                  onClick={() => setConnectMode("demo")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    connectMode === "demo"
                      ? "bg-emerald-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Demo Mode
                </button>
              </div>

              {connectMode === "real" ? (
                <>
                  <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 mb-6">
                    <p className="text-sm text-emerald-200">
                      <strong>Real OAuth:</strong> You will be redirected to{" "}
                      {selectedProvider.name}
                      's authorization page to securely connect your account. We
                      never see your password.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400 mb-6">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Secure OAuth 2.0 authentication</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Post directly to {selectedProvider.name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Real-time analytics and engagement data</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Revoke access anytime</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDemoModalOpen(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRealConnect}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Connect with {selectedProvider.name}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
                    <p className="text-sm text-yellow-200">
                      <strong>Note:</strong> This is a demo connection for
                      testing. No real {selectedProvider.name} account will be
                      connected.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username / Handle
                      </label>
                      <input
                        type="text"
                        value={demoHandle}
                        onChange={(e) => setDemoHandle(e.target.value)}
                        placeholder={`e.g., my${selectedProvider.id}handle`}
                        className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profile Link (required)
                      </label>
                      <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder={`https://${selectedProvider.id}.com/you`}
                        className="w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setDemoModalOpen(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDemoConnect}
                      disabled={connectDemoMutation.isLoading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      {connectDemoMutation.isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          Connect Demo
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
