import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferences {
  emailOnShare: boolean;
  emailOnUpdate: boolean;
  emailOnRevoke: boolean;
  emailOnComment: boolean;
  emailDigestFrequency: 'immediate' | 'daily' | 'weekly';
  unsubscribeAll: boolean;
}

interface NotificationPreferencesProps {
  initialPreferences?: NotificationPreferences;
  onSave?: (preferences: NotificationPreferences) => Promise<void>;
  isLoading?: boolean;
}

const defaultPreferences: NotificationPreferences = {
  emailOnShare: true,
  emailOnUpdate: true,
  emailOnRevoke: true,
  emailOnComment: true,
  emailDigestFrequency: 'immediate',
  unsubscribeAll: false,
};

export function NotificationPreferences({
  initialPreferences = defaultPreferences,
  onSave,
  isLoading = false,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly') => {
    setPreferences(prev => ({
      ...prev,
      emailDigestFrequency: frequency,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(preferences);
      }
      setHasChanges(false);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update notification preferences');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(initialPreferences);
    setHasChanges(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Bell className="w-8 h-8" />
          Notification Preferences
        </h2>
        <p className="text-gray-600">
          Manage how and when you receive notifications about your documents and shared items
        </p>
      </div>

      {/* Document Sharing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Document Sharing
          </CardTitle>
          <CardDescription>
            Get notified when documents are shared with you or when you share documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email when document is shared</p>
              <p className="text-sm text-gray-600">Receive notification when someone shares a document with you</p>
            </div>
            <Switch
              checked={preferences.emailOnShare}
              onCheckedChange={() => handleToggle('emailOnShare')}
              disabled={preferences.unsubscribeAll}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email when share is revoked</p>
              <p className="text-sm text-gray-600">Receive notification when access to a shared document is removed</p>
            </div>
            <Switch
              checked={preferences.emailOnRevoke}
              onCheckedChange={() => handleToggle('emailOnRevoke')}
              disabled={preferences.unsubscribeAll}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Document Updates
          </CardTitle>
          <CardDescription>
            Stay informed about changes to your shared documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email when document is updated</p>
              <p className="text-sm text-gray-600">Receive notification when a shared document is modified</p>
            </div>
            <Switch
              checked={preferences.emailOnUpdate}
              onCheckedChange={() => handleToggle('emailOnUpdate')}
              disabled={preferences.unsubscribeAll}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email on comments</p>
              <p className="text-sm text-gray-600">Receive notification when someone comments on your documents</p>
            </div>
            <Switch
              checked={preferences.emailOnComment}
              onCheckedChange={() => handleToggle('emailOnComment')}
              disabled={preferences.unsubscribeAll}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Email Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['immediate', 'daily', 'weekly'] as const).map(frequency => (
            <label key={frequency} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="frequency"
                value={frequency}
                checked={preferences.emailDigestFrequency === frequency}
                onChange={() => handleFrequencyChange(frequency)}
                disabled={preferences.unsubscribeAll}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {frequency === 'immediate' ? 'Immediate' : frequency === 'daily' ? 'Daily Digest' : 'Weekly Digest'}
                </p>
                <p className="text-sm text-gray-600">
                  {frequency === 'immediate'
                    ? 'Get notified right away'
                    : frequency === 'daily'
                      ? 'Receive one email per day with all updates'
                      : 'Receive one email per week with all updates'}
                </p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Unsubscribe All */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5" />
            Unsubscribe from All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-gray-900">Disable all email notifications</p>
              <p className="text-sm text-gray-600">You won't receive any email notifications from Ontario Wills</p>
            </div>
            <Switch
              checked={preferences.unsubscribeAll}
              onCheckedChange={() => handleToggle('unsubscribeAll')}
              className="data-[state=checked]:bg-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isSaving || isLoading}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Info Message */}
      {hasChanges && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            You have unsaved changes. Click "Save Preferences" to apply them.
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationPreferences;
