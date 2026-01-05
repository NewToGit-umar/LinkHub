import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  LayoutDashboard,
  Send,
  Link2,
  Users,
  BarChart3,
  Calendar,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  User,
  Moon,
  Sun,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/posts", icon: Send, label: "Posts" },
  { path: "/links", icon: Link2, label: "Links" },
  { path: "/accounts", icon: Users, label: "Accounts" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/bio", icon: Globe, label: "Bio Pages" },
  { path: "/teams", icon: Users, label: "Teams" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshingNotifs, setIsRefreshingNotifs] = useState(false);
  const [notifUpdatedAt, setNotifUpdatedAt] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark, accent, setAccent, accents } = useTheme();

  // Refs for click-outside detection
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close profile menu if clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      // Close notifications if clicking outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    // Add event listener when any dropdown is open
    if (showProfileMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotifications]);

  const accentBackgrounds = {
    emerald: isDark
      ? "from-black via-emerald-950 to-black"
      : "from-emerald-50 via-white to-emerald-100",
    ocean: isDark
      ? "from-slate-950 via-slate-900 to-sky-950"
      : "from-sky-50 via-white to-cyan-100",
    sunset: isDark
      ? "from-slate-950 via-fuchsia-950 to-orange-900"
      : "from-orange-50 via-rose-50 to-amber-100",
  };

  const iconTone = isDark ? "text-emerald-100" : "text-emerald-700";
  const panelBg = isDark
    ? "bg-slate-900 border border-emerald-800"
    : "bg-white border border-emerald-200 shadow-lg";

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith("http")) return user.avatar;
    return `${
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5001"
    }${user.avatar}`;
  };

  const handleRefreshNotifications = async () => {
    setIsRefreshingNotifs(true);
    try {
      // Placeholder simulated notifications; replace with API when available
      const simulated = [
        {
          id: "notif-1",
          title: "New comment on your post",
          body: "" + "Someone engaged with your latest post.",
          time: "Just now",
        },
        {
          id: "notif-2",
          title: "Team invitation accepted",
          body: "Alex joined your team.",
          time: "5m ago",
        },
      ];
      setNotifications(simulated);
      setNotifUpdatedAt(new Date().toISOString());
      toast.success("Notifications refreshed");
    } catch (err) {
      toast.error("Failed to refresh notifications");
    } finally {
      setIsRefreshingNotifs(false);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications([]);
    setNotifUpdatedAt(new Date().toISOString());
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        accentBackgrounds[accent] || accentBackgrounds.emerald
      } ${
        isDark ? "text-white" : "text-slate-900"
      } transition-colors duration-300`}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-2xl transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/50 dark:border-slate-700/50">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LinkHub</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="mx-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Link2 className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-emerald-600 to-lime-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "" : "group-hover:scale-110 transition-transform"
                  }`}
                />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-emerald-400/30">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-emerald-400/30">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 h-16 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-6 h-6 dark:text-gray-300" />
          </button>

          <div className="flex-1 lg:flex-none">
            {/* Page title could go here */}
          </div>

          <div className="relative flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-2 hover:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-colors"
              >
                <Bell className={`w-5 h-5 ${iconTone}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl p-3 z-50 ${panelBg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      Notifications
                    </span>
                    <button
                      onClick={handleRefreshNotifications}
                      className={`text-xs flex items-center gap-1 ${
                        isDark
                          ? "text-emerald-300 hover:text-emerald-200"
                          : "text-emerald-700 hover:text-emerald-900"
                      }`}
                    >
                      {isRefreshingNotifs ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />{" "}
                          Refreshing
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className={`space-y-2 text-sm max-h-64 overflow-auto pr-1 ${
                      isDark ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    {notifications.length === 0 ? (
                      <div
                        className={`p-2 rounded-xl border ${
                          isDark
                            ? "bg-emerald-900/40 border-emerald-800 text-emerald-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border ${
                            isDark
                              ? "bg-emerald-900/40 border-emerald-800"
                              : "bg-emerald-50 border-emerald-200"
                          }`}
                        >
                          <div
                            className={`font-semibold text-sm ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {n.title}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isDark ? "text-emerald-100" : "text-emerald-800"
                            }`}
                          >
                            {n.body}
                          </div>
                          <div
                            className={`text-[11px] mt-1 ${
                              isDark ? "text-emerald-300" : "text-emerald-700"
                            }`}
                          >
                            {n.time}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-between mt-3 text-[11px] ${
                      isDark ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    <span>
                      {notifUpdatedAt
                        ? `Updated ${new Date(
                            notifUpdatedAt
                          ).toLocaleTimeString()}`
                        : "Not refreshed yet"}
                    </span>
                    <button
                      onClick={handleMarkAllRead}
                      className={`hover:underline ${
                        isDark ? "text-emerald-200" : "text-emerald-800"
                      }`}
                    >
                      Mark all read
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="mt-3 w-full py-2 text-xs text-emerald-200 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              to="/settings/privacy"
              className="p-2 hover:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-colors"
            >
              <Settings className={`w-5 h-5 ${iconTone}`} />
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 pl-3 border-l border-emerald-800/60"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-emerald-50">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </button>
              {showProfileMenu && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl p-3 z-50 ${panelBg}`}
                >
                  <div
                    className={`text-xs mb-2 ${
                      isDark ? "text-emerald-200" : "text-emerald-700"
                    }`}
                  >
                    Signed in as
                  </div>
                  <div
                    className={`text-sm font-semibold mb-3 truncate ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {user?.email || "user@example.com"}
                  </div>
                  <div
                    className={`space-y-1 text-sm ${
                      isDark ? "text-emerald-50" : "text-emerald-800"
                    }`}
                  >
                    <Link
                      to="/profile"
                      className={`block px-3 py-2 rounded-xl ${
                        isDark
                          ? "hover:bg-emerald-900/40"
                          : "hover:bg-emerald-100"
                      }`}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/settings/privacy"
                      className={`block px-3 py-2 rounded-xl ${
                        isDark
                          ? "hover:bg-emerald-900/40"
                          : "hover:bg-emerald-100"
                      }`}
                    >
                      Privacy Settings
                    </Link>
                    <Link
                      to="/bio"
                      className="block px-3 py-2 rounded-xl hover:bg-emerald-900/40"
                    >
                      Manage Bio Links
                    </Link>
                    <Link
                      to="/links"
                      className="block px-3 py-2 rounded-xl hover:bg-emerald-900/40"
                    >
                      Manage Links
                    </Link>
                    <Link
                      to="/accounts"
                      className="block px-3 py-2 rounded-xl hover:bg-emerald-900/40"
                    >
                      Social Accounts
                    </Link>
                  </div>
                  <div className="mt-3 border-t border-emerald-800/60 pt-3 space-y-3">
                    <div
                      className={`text-xs ${
                        isDark ? "text-emerald-200" : "text-emerald-800"
                      }`}
                    >
                      Theme & Accent
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setShowProfileMenu(false);
                        }}
                        className={`flex-1 px-3 py-2 rounded-xl font-medium ${
                          isDark
                            ? "bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800/80"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {isDark ? "Light" : "Dark"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {accents.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setAccent(opt.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            accent === opt.id
                              ? "border-[var(--accent-from)] bg-[var(--accent-ghost)] text-[var(--accent-to)]"
                              : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div
              className={`${
                isDark
                  ? "bg-slate-900 border-emerald-800"
                  : "bg-white border-emerald-200"
              } border-2 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Confirm Logout
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to sign out?
                  </p>
                </div>
              </div>
              <p
                className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                You'll need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
