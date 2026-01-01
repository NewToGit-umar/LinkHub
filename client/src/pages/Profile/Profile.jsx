import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { profileAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  MapPin,
  Globe,
  Phone,
  Camera,
  Save,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    avatar: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      const userData = res.data.user;
      setProfile({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || "",
        website: userData.website || "",
        phone: userData.phone || "",
        avatar: userData.avatar || null,
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { name, bio, location, website, phone } = profile;
      await profileAPI.update({ name, bio, location, website, phone });
      toast.success("Profile updated successfully");

      // Update local storage user data
      const savedUser = JSON.parse(
        localStorage.getItem("linkhub_user") || "{}"
      );
      savedUser.name = name;
      localStorage.setItem("linkhub_user", JSON.stringify(savedUser));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await profileAPI.uploadAvatar(formData);
      setProfile((prev) => ({ ...prev, avatar: res.data.avatarUrl }));

      // Update local storage and auth context
      const savedUser = JSON.parse(
        localStorage.getItem("linkhub_user") || "{}"
      );
      savedUser.avatar = res.data.avatarUrl;
      localStorage.setItem("linkhub_user", JSON.stringify(savedUser));
      setUser(savedUser); // Update auth context to reflect change immediately

      toast.success("Avatar uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile.avatar) return;

    setUploadingAvatar(true);
    try {
      await profileAPI.deleteAvatar();
      setProfile((prev) => ({ ...prev, avatar: null }));

      // Update local storage and auth context
      const savedUser = JSON.parse(
        localStorage.getItem("linkhub_user") || "{}"
      );
      savedUser.avatar = null;
      localStorage.setItem("linkhub_user", JSON.stringify(savedUser));
      setUser(savedUser); // Update auth context to reflect change immediately

      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await profileAPI.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const getAvatarUrl = () => {
    if (!profile.avatar) return null;
    if (profile.avatar.startsWith("http")) return profile.avatar;
    return `${
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5001"
    }${profile.avatar}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>

        {/* Avatar Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center cursor-pointer overflow-hidden group"
              >
                {profile.avatar ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <p className="text-gray-300 text-sm mb-3">
                Click on the avatar to upload a new image. Max size: 5MB
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Upload New
                </button>
                {profile.avatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">
            Profile Information
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="+1 (234) 567-8900"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              <Lock className="w-5 h-5 inline mr-2" />
              Change Password
            </h2>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              {showPasswordSection ? "Cancel" : "Change"}
            </button>
          </div>

          {showPasswordSection && (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {passwordData.newPassword && passwordData.confirmPassword && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    passwordData.newPassword === passwordData.confirmPassword
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Passwords do not match
                    </>
                  )}
                </div>
              )}

              {/* Change Password Button */}
              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
