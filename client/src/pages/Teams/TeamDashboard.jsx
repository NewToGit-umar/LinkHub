import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsAPI, invitationsAPI } from "../../services/api";

export default function TeamDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const { data, isLoading, error } = useQuery({
    queryKey: ["team", slug],
    queryFn: async () => {
      const res = await teamsAPI.get(slug);
      return res.data;
    },
  });

  const { data: membersData } = useQuery({
    queryKey: ["team-members", slug],
    queryFn: async () => {
      const res = await teamsAPI.getMembers(slug);
      return res.data.members;
    },
  });

  const { data: invitationsData } = useQuery({
    queryKey: ["team-invitations", slug],
    queryFn: async () => {
      const res = await invitationsAPI.getTeamInvitations(slug);
      return res.data.invitations;
    },
    enabled: data?.permissions?.canManageMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => invitationsAPI.create(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-invitations", slug]);
      setShowInvite(false);
      setInviteEmail("");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => teamsAPI.removeMember(slug, memberId),
    onSuccess: () => queryClient.invalidateQueries(["team-members", slug]),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-500">Error loading team</p>
          <Link to="/teams" className="text-indigo-600 hover:underline">
            ← Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const { team, role, permissions } = data || {};
  const members = membersData || [];
  const invitations = invitationsData || [];

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  {team?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {team?.name}
                </h1>
                <p className="text-sm text-gray-500">{team?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                {role}
              </span>
              {permissions?.canManageMembers && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Invite
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b -mb-px">
            {["overview", "members", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Members</p>
              <p className="text-2xl font-bold text-gray-800">
                {members.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-800">
                {invitations.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">
                {team?.plan || "Free"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Team Members</h2>
            </div>
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.user?._id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {member.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.user?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                      {member.role}
                    </span>
                    {permissions?.canManageMembers &&
                      member.role !== "owner" && (
                        <button
                          onClick={() =>
                            removeMemberMutation.mutate(member.user?._id)
                          }
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && permissions?.canManageMembers && (
              <div className="border-t">
                <div className="p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">
                    Pending Invitations
                  </h3>
                </div>
                <div className="divide-y">
                  {invitations.map((inv) => (
                    <div
                      key={inv._id}
                      className="p-4 flex items-center justify-between bg-yellow-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{inv.email}</p>
                        <p className="text-xs text-gray-500">
                          Invited by {inv.invitedBy?.name} • Expires{" "}
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs capitalize">
                        {inv.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && permissions?.canManageSettings && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Team Settings</h2>
            <p className="text-gray-500 text-sm">
              Team settings configuration coming soon.
            </p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-400"
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <Link to="/teams" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Teams
        </Link>
      </div>
    </div>
  );
}
