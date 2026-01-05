import React from "react";

export default function SocialAccountCard({
  provider,
  account,
  onConnect,
  onDisconnect,
  onSync,
  syncing,
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium capitalize">{provider}</div>
        <div
          className={`text-sm ${account ? "text-green-600" : "text-gray-500"}`}
        >
          {account ? "Connected" : "Not connected"}
        </div>
      </div>

      {account ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">@{account.accountHandle}</div>
          <div className="text-xs text-gray-500">{account.accountName}</div>
          <div className="text-xs text-gray-400">
            Last sync:{" "}
            {account.lastSyncAt
              ? new Date(account.lastSyncAt).toLocaleString()
              : "never"}
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => onDisconnect(provider)}
              className="btn-danger text-sm px-3 py-1"
            >
              Disconnect
            </button>
            <button
              onClick={() => onSync(provider)}
              className="btn-outline text-sm px-3 py-1"
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Sync"}
            </button>
            <a
              href={account.profileData?.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600"
            >
              View
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">No account connected</div>
          <button
            onClick={() => onConnect(provider)}
            className="btn-primary text-sm px-3 py-1"
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
}
