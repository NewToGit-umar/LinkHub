import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { teamsAPI } from "../../services/api";

export default function TeamList() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await teamsAPI.list();
      return res.data.teams;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => teamsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      setShowCreate(false);
      setNewTeam({ name: "", description: "" });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    createMutation.mutate(newTeam);
  };

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
        <div className="max-w-4xl mx-auto">
          <p className="text-red-500">Error loading teams</p>
        </div>
      </div>
    );
  }

  const teams = data || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Teams</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Team
          </button>
        </div>

        {/* Create Team Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
              <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) =>
                      setNewTeam((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="My Awesome Team"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) =>
                      setNewTeam((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="What's this team about?"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teams List */}
        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              You're not part of any teams yet.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Link
                key={team._id}
                to={`/teams/${team.slug}`}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {team.description || "No description"}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{team.members?.length || 0} members</span>
                      <span className="capitalize">{team.plan || "free"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-4 border-t">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
