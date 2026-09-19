import React from "react";
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Flame, 
  GraduationCap, 
  ExternalLink,
  Trash2
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (item: NotificationItem) => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onClearNotifications,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "breaking_news":
        return <Flame className="h-4 w-4 text-rose-500" />;
      case "daily_digest":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "exam_alert":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "creator_upload":
      default:
        return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                id="mark-all-notifications-read-btn"
                onClick={onMarkAllAsRead}
                title="Mark all as read"
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}

            <button
              id="clear-notifications-btn"
              onClick={onClearNotifications}
              title="Clear all notifications"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                id={`notif-item-${item.id}`}
                onClick={() => onNotificationClick(item)}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3 text-left transition ${
                  item.read
                    ? "bg-neutral-50/70 hover:bg-neutral-100 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/60"
                    : "border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-950/40"
                }`}
              >
                <div className="mt-0.5 shrink-0 rounded-xl bg-white p-2 shadow-2xs dark:bg-neutral-800">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold ${item.read ? "text-neutral-800 dark:text-neutral-200" : "text-indigo-900 dark:text-indigo-200"}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-neutral-400 dark:text-neutral-500">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
