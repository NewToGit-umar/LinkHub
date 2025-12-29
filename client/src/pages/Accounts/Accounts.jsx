import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const providers = [
  "twitter",
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
];

export default function Accounts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["social_accounts"],
    queryFn: async () => {
      const res = await socialAPI.list();
      return res.data.accounts;
    },
    enabled: !!user,
  });

  const disconnectMutation = useMutation({
    mutationFn: (provider) => socialAPI.disconnect(provider),
    onSuccess: () => qc.invalidateQueries(["social_accounts"]),
  });

  const handleConnect = async (provider) => {
    // Open start endpoint in new tab (server should redirect to provider auth URL)
    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:5001"
    }/api/social/start/${provider}`;
    window.open(url, "_blank");
  };

  if (isLoading)
    return <div className="p-6">Loading connected accounts...</div>;
  if (isError)
    return <div className="p-6 text-red-600">Failed to load accounts</div>;

  const accounts = data || [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Connected Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => {
          const acct = accounts.find((a) => a.platform === p);
          return (
            <div
              key={p}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium capitalize">{p}</div>
                <div className="text-sm text-gray-500">
                  {acct ? "Connected" : "Not connected"}
                </div>
              </div>

              {acct ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    @{acct.accountHandle}
                  </div>
                  <div className="text-xs text-gray-500">
                    {acct.accountName}
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => disconnectMutation.mutate(p)}
                      className="btn-danger text-sm px-3 py-1"
                      disabled={disconnectMutation.isLoading}
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          accounts.find((a) => a.platform === p)?.profileData
                            ?.url || "#",
                          "_blank"
                        )
                      }
                      className="btn-outline text-sm px-3 py-1"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    No account connected
                  </div>
                  <button
                    onClick={() => handleConnect(p)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
