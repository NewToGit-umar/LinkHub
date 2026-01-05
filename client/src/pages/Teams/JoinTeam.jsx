import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { Users, CheckCircle2, AlertCircle, Loader2, LogIn } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export default function JoinTeam() {
  const { slug, code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [error, setError] = useState(null);

  // Fetch team info by invite link
  const {
    data: teamData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["team-invite", slug, code],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/teams/join/${slug}/${code}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid invite link");
      }
      return response.json();
    },
    retry: false,
  });

  // Join team mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/teams/join/${slug}/${code}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join team");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Successfully joined the team!");
      navigate(`/teams/${slug}`);
    },
    onError: (error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const handleJoin = () => {
    if (!isAuthenticated) {
      // Store the invite link to redirect back after login
      localStorage.setItem("pending_invite", `/join/${slug}/${code}`);
      navigate("/login");
      return;
    }
    joinMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (isError || !teamData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Invalid Invite Link
          </h1>
          <p className="text-gray-400 mb-6">
            This invite link is invalid, expired, or has reached its maximum
            uses.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="card max-w-md w-full p-8">
        {/* Team Info */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Join {teamData.team?.name}
          </h1>
          {teamData.team?.description && (
            <p className="text-gray-400 text-sm">{teamData.team.description}</p>
          )}
        </div>

        {/* Team Stats */}
        <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Members</span>
            <span className="text-white font-medium">
              {teamData.team?.memberCount || 1}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-400">Your Role</span>
            <span className="text-emerald-400 font-medium capitalize">
              {teamData.role}
            </span>
          </div>
          {teamData.expiresAt && (
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-400">Link Expires</span>
              <span className="text-yellow-400 font-medium">
                {new Date(teamData.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-gray-300">
              Collaborate on social media posts
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-gray-300">
              Access shared analytics and insights
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-gray-300">Coordinate content scheduling</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Action Button */}
        {isAuthenticated ? (
          <button
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {joinMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Join Team
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleJoin}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login to Join
            </button>
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By joining, you agree to LinkHub's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
