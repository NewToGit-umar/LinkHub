import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { privacyAPI } from "../../services/api";
import { Alert, AccessibleButton } from "../../components/Accessible";
import toast from "react-hot-toast";

export default function PrivacySettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    profilePublic: true,
    showEmail: false,
    allowAnalytics: true,
    allowMarketing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await privacyAPI.getSettings();
      setSettings(res.data.settings);
    } catch (err) {
      toast.error("Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await privacyAPI.updateSettings(settings);
      toast.success("Privacy settings saved");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await privacyAPI.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkhub-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setDeleting(true);
    try {
      await privacyAPI.deleteAccount(deleteConfirm);
      toast.success("Account deleted");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Privacy Settings
        </h1>

        {/* Privacy Toggles */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Privacy Preferences</h2>

          <div className="space-y-4">
            <ToggleSetting
              label="Public Profile"
              description="Allow others to view your profile"
              checked={settings.profilePublic}
              onChange={() => handleSettingChange("profilePublic")}
            />

            <ToggleSetting
              label="Show Email"
              description="Display your email on your public profile"
              checked={settings.showEmail}
              onChange={() => handleSettingChange("showEmail")}
            />

            <ToggleSetting
              label="Allow Analytics"
              description="Allow us to collect anonymous usage data to improve our service"
              checked={settings.allowAnalytics}
              onChange={() => handleSettingChange("allowAnalytics")}
            />

            <ToggleSetting
              label="Marketing Emails"
              description="Receive promotional emails and updates"
              checked={settings.allowMarketing}
              onChange={() => handleSettingChange("allowMarketing")}
            />
          </div>

          <div className="mt-6">
            <AccessibleButton
              onClick={handleSave}
              loading={saving}
              ariaLabel="Save privacy settings"
            >
              Save Settings
            </AccessibleButton>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Export Your Data</h2>
          <p className="text-gray-600 mb-4">
            Download a copy of all your data stored in LinkHub. This includes
            your profile, posts, connected accounts, bio pages, and analytics
            data.
          </p>
          <AccessibleButton
            variant="secondary"
            onClick={handleExportData}
            ariaLabel="Download your data"
          >
            Download My Data
          </AccessibleButton>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-4">
            Danger Zone
          </h2>
          <p className="text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <AccessibleButton
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            ariaLabel="Delete your account"
          >
            Delete My Account
          </AccessibleButton>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-red-700 mb-4">
                  Delete Account Permanently
                </h3>

                <Alert type="error" className="mb-4">
                  This will permanently delete all your data including posts,
                  bio pages, connected accounts, and analytics. This cannot be
                  undone!
                </Alert>

                <p className="text-gray-600 mb-4">
                  Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                </p>

                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500"
                  aria-label="Type DELETE MY ACCOUNT to confirm"
                />

                <div className="flex justify-end space-x-3">
                  <AccessibleButton
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirm("");
                    }}
                  >
                    Cancel
                  </AccessibleButton>
                  <AccessibleButton
                    variant="danger"
                    onClick={handleDeleteAccount}
                    loading={deleting}
                    disabled={deleteConfirm !== "DELETE MY ACCOUNT"}
                  >
                    Delete Forever
                  </AccessibleButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  const id = `toggle-${label.toLowerCase().replace(/\s/g, "-")}`;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <label
          htmlFor={id}
          className="font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${checked ? "bg-indigo-600" : "bg-gray-200"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}
