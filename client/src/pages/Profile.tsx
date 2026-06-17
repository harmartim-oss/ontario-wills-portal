import { Button } from "@/components/ui/button";
import { User, Mail, LogOut, Shield, Bell, Lock, Crown, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "billing">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [settings, setSettings] = useState({ emailNotifications: true, documentReminders: true, marketingEmails: false });

  // Fetch user profile
  const { data: profileData } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user settings
  const { data: settingsData } = trpc.user.getSettings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch current plan
  const { data: planData } = trpc.user.getCurrentPlan.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Upgrade plan mutation
  const upgradePlanMutation = trpc.user.upgradePlan.useMutation({
    onSuccess: () => {
      toast.success("Successfully upgraded to Premium!");
    },
    onError: () => {
      toast.error("Failed to upgrade plan");
    },
  });

  // Update profile mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Update settings mutation
  const updateSettingsMutation = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  // Delete account mutation
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deletion initiated");
      logout();
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  // Initialize form data
  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        name: profileData.user.name || "",
        email: profileData.user.email || "",
      });
    }
  }, [profileData]);

  // Initialize settings
  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Please log in to access your profile</p>
          <a href="/"><Button>Go Home</Button></a>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({
        emailNotifications: settings.emailNotifications,
        documentReminders: settings.documentReminders,
        marketingEmails: settings.marketingEmails,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      await deleteAccountMutation.mutateAsync({
        reason: "User requested deletion",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-foreground to-secondary text-background py-8">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="opacity-90">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="container max-w-6xl py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </div>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="p-8 rounded-lg border border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Account Status</label>
                      <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground">
                        Free Plan
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Member Since</label>
                      <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground">
                        March 2026
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveProfile} disabled={isSaving || updateProfileMutation.isPending}>
                        {isSaving || updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg border border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Upgrade to Premium</h2>
                  <p className="text-muted-foreground mb-6">
                    Unlock advanced features like AI Clause Optimizer, Live Tax Estimator, and AI Legal Assistant for just $99 one-time.
                  </p>
                  <a href="/pricing">
                    <Button>View Premium Features</Button>
                  </a>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div className="p-8 rounded-lg border border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-accent" />
                        <div>
                          <p className="font-semibold text-foreground">Authentication</p>
                          <p className="text-sm text-muted-foreground">Secured with Manus OAuth</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">Secure</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-accent" />
                        <div>
                          <p className="font-semibold text-foreground">Data Encryption</p>
                          <p className="text-sm text-muted-foreground">AES-256 encryption at rest</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-semibold">Active</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg border border-destructive/30 bg-destructive/5">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Danger Zone</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Delete Account</h3>
                      <p className="text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteAccountMutation.isPending}>
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div className="p-8 rounded-lg border border-border bg-card">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.documentReminders}
                        onChange={(e) => setSettings({ ...settings, documentReminders: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Document Updates</p>
                        <p className="text-sm text-muted-foreground">Notify me when documents are updated</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Re-balancing Alerts</p>
                        <p className="text-sm text-muted-foreground">Alert me when asset values change significantly</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Product Updates</p>
                        <p className="text-sm text-muted-foreground">Notify me about new features and improvements</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive promotional offers and tips</p>
                      </div>
                    </label>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveSettings} disabled={isSaving || updateSettingsMutation.isPending}>
                        {isSaving || updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
