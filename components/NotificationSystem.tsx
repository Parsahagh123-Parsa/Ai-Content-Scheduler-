'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Clock, Calendar, Zap } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'post_reminder' | 'trending_alert' | 'engagement_boost' | 'schedule_ready' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  icon?: string;
  data?: any;
}

interface NotificationSystemProps {
  userId?: string;
}

/**
 * NotificationSystem Component
 * 
 * A comprehensive notification system for ViralFlow that provides:
 * - Real-time posting reminders
 * - Trending topic alerts
 * - Engagement boost notifications
 * - Schedule ready alerts
 * - Achievement notifications
 * - System notifications
 * 
 * Features:
 * - Beautiful glassmorphic UI
 * - Sound effects for urgent notifications
 * - Browser push notifications
 * - Notification history
 * - Smart grouping and prioritization
 */
export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Set up real-time subscription (if using Supabase realtime)
    // const subscription = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'notifications',
    //     filter: `user_id=eq.${userId}`
    //   }, (payload) => {
    //     handleNewNotification(payload.new as Notification);
    //   })
    //   .subscribe();

    return () => {
      clearInterval(interval);
      // subscription.unsubscribe();
    };
  }, [userId]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound for urgent/high priority notifications
    if (soundEnabled && (notification.priority === 'urgent' || notification.priority === 'high')) {
      playNotificationSound(notification.type);
    }
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
      });
    }
  };

  const playNotificationSound = (type: string) => {
    const audio = new Audio();
    switch (type) {
      case 'post_reminder':
        audio.src = '/sounds/reminder.mp3';
        break;
      case 'trending_alert':
        audio.src = '/sounds/trending.mp3';
        break;
      case 'engagement_boost':
        audio.src = '/sounds/boost.mp3';
        break;
      default:
        audio.src = '/sounds/notification.mp3';
    }
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio fails
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (!notifications.find(n => n.id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_reminder':
        return <Clock className="w-5 h-5" />;
      case 'trending_alert':
        return <Zap className="w-5 h-5" />;
      case 'engagement_boost':
        return <CheckCircle className="w-5 h-5" />;
      case 'schedule_ready':
        return <Calendar className="w-5 h-5" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const groupedNotifications = {
    urgent: notifications.filter(n => n.priority === 'urgent' && !n.isRead),
    high: notifications.filter(n => n.priority === 'high' && !n.isRead),
    medium: notifications.filter(n => n.priority === 'medium' && !n.isRead),
    low: notifications.filter(n => n.priority === 'low' && !n.isRead),
    read: notifications.filter(n => n.isRead),
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-300 hover:text-blue-200"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/20"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No notifications yet</p>
                </div>
              ) : (
                <>
                  {/* Urgent Notifications */}
                  {groupedNotifications.urgent.length > 0 && (
                    <div className="p-2">
                      {groupedNotifications.urgent.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getNotificationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* High Priority */}
                  {groupedNotifications.high.length > 0 && (
                    <div className="p-2">
                      {groupedNotifications.high.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getNotificationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* Medium & Low Priority */}
                  {[...groupedNotifications.medium, ...groupedNotifications.low].map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                      onDelete={() => deleteNotification(notification.id)}
                      getIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}

                  {/* Read Notifications (collapsed by default) */}
                  {groupedNotifications.read.length > 0 && (
                    <details className="p-2">
                      <summary className="text-sm text-white/60 cursor-pointer">
                        {groupedNotifications.read.length} read notifications
                      </summary>
                      {groupedNotifications.read.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                          getIcon={getNotificationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </details>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  getIcon: (type: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  getIcon,
  getPriorityColor,
}: NotificationItemProps) {
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 mb-2 rounded-xl border-l-4 ${getPriorityColor(notification.priority)} ${
        notification.isRead ? 'opacity-60' : ''
      } hover:bg-white/5 transition-all cursor-pointer`}
      onClick={() => {
        if (!notification.isRead) onRead();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1 text-white/80">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-2 p-1 rounded-full hover:bg-white/20"
            >
              <X className="w-3 h-3 text-white/60" />
            </button>
          </div>
          <p className="text-xs text-white/70 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/50">{timeAgo}</span>
            {notification.actionLabel && (
              <button className="text-xs text-blue-300 hover:text-blue-200 font-medium">
                {notification.actionLabel} →
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

