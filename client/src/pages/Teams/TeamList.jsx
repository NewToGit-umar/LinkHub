import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { teamsAPI } from "../../services/api";
import { Plus, Users, Crown, ChevronRight, Link2, X } from "lucide-react";
import toast from "react-hot-toast";

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
      toast.success("Team created successfully!");
    },
    onError: () => {
      toast.error("Failed to create team");
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    createMutation.mutate(newTeam);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="shimmer h-10 w-48 rounded-xl mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer h-32 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Error loading teams
            </h3>
            <p className="text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const teams = data || [];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">My Teams</h1>
            <p className="text-gray-600 mt-1">
              Collaborate with your team members
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary inline-flex items-center group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Create Team
          </button>
        </div>

        {/* Create Team Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 scale-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Create New Team
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) =>
                      setNewTeam((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="My Awesome Team"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="input-field resize-none"
                    placeholder="What's this team about?"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 btn-primary disabled:opacity-50"
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
          <div className="card text-center py-16 fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 float">
              <Link2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first team and start collaborating with others.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team, index) => (
              <Link
                key={team._id}
                to={`/teams/${team.slug}`}
                className="card card-hover group slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {team.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {team.members?.length || 0} members
                      </span>
                      <span className="inline-flex items-center text-xs">
                        <Crown className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                        <span className="capitalize text-gray-500">
                          {team.plan || "free"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
