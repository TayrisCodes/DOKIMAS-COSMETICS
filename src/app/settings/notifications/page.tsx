'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, TestTube, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  requestNotificationPermission,
} from '@/lib/pwa';

const CATEGORIES = ['Aftershave', 'Oils', 'Deodorants', 'Cleansers', 'Promotions'];

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const [preferences, setPreferences] = useState({
    enabled: true,
    categories: CATEGORIES,
    frequency: 'immediate' as 'immediate' | 'daily' | 'weekly',
    channels: {
      push: true,
      email: true,
    },
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadPreferences();
    checkSubscriptionStatus();
    loadNotifications();
  }, []);

  const checkSubscriptionStatus = async () => {
    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (data.success && data.data.preferences) {
        setPreferences(data.data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();

      if (data.success && data.data.notifications) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setSaving(true);
    try {
      const permission = await requestNotificationPermission();

      if (permission !== 'granted') {
        toast.error('Notification permission denied. Please enable in browser settings.');
        return;
      }

      const subscription = await subscribeToPush({
        categories: preferences.categories,
        frequency: preferences.frequency,
      });

      if (subscription) {
        setIsSubscribed(true);
        setNotificationPermission('granted');
        toast.success('Notifications enabled successfully!');
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('Enable notifications error:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableNotifications = async () => {
    setSaving(true);
    try {
      const success = await unsubscribeFromPush();

      if (success) {
        setIsSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } catch (error) {
      console.error('Disable notifications error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Preferences saved successfully!');

        // If subscribed, update subscription with new preferences
        if (isSubscribed) {
          await subscribeToPush({
            categories: preferences.categories,
            frequency: preferences.frequency,
          });
        }
      } else {
        toast.error(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Save preferences error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test notification sent! Check your notifications.');
      } else {
        toast.error(data.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('All notifications marked as read');
        loadNotifications();
      }
    } catch (error) {
      console.error('Mark all read error:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const toggleCategory = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your notification preferences and view notification history
        </p>
      </div>

      {/* Enable/Disable Notifications */}
      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isSubscribed ? (
              <Bell className="h-8 w-8 text-green-600" />
            ) : (
              <BellOff className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <h2 className="text-xl font-semibold">Push Notifications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSubscribed
                  ? 'You are subscribed to push notifications'
                  : 'Enable push notifications to stay updated'}
              </p>
            </div>
          </div>

          <Button
            onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
            disabled={saving}
            variant={isSubscribed ? 'destructive' : 'default'}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {notificationPermission === 'denied' && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Notification Preferences</h2>

        {/* Categories */}
        <div className="mb-6">
          <Label className="mb-3 block text-base">Notify me about:</Label>
          <div className="space-y-3">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={preferences.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={category} className="cursor-pointer font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-6">
          <Label htmlFor="frequency" className="mb-3 block text-base">
            Notification Frequency
          </Label>
          <Select
            value={preferences.frequency}
            onValueChange={(value: any) =>
              setPreferences((prev) => ({ ...prev, frequency: value }))
            }
          >
            <SelectTrigger id="frequency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Channels */}
        <div className="mb-6">
          <Label className="mb-3 block text-base">Channels</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-channel" className="font-normal">
                Push Notifications
              </Label>
              <Switch
                id="push-channel"
                checked={preferences.channels.push}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    channels: { ...prev.channels, push: checked },
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-channel" className="font-normal">
                Email Notifications
              </Label>
              <Switch
                id="email-channel"
                checked={preferences.channels.email}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    channels: { ...prev.channels, email: checked },
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSavePreferences} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>

          {isSubscribed && (
            <Button onClick={handleTestNotification} variant="outline">
              <TestTube className="mr-2 h-4 w-4" />
              Send Test
            </Button>
          )}
        </div>
      </Card>

      {/* Notification History */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Notifications</h2>
          {notifications.some((n) => !n.read) && (
            <Button onClick={handleMarkAllRead} variant="outline" size="sm">
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-lg border p-4 ${
                  notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.body}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(notification.sentAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

