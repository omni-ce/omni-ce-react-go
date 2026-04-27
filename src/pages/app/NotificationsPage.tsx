import { useState } from "react";
import {
  RiNotificationLine,
  RiCheckDoubleLine,
  RiInformationLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiErrorWarningLine,
  RiSettings3Line,
  RiDeleteBinLine,
  RiFilterLine,
  RiCheckLine,
} from "react-icons/ri";
import { useLanguageStore } from "@/stores/languageStore";
import { useNotificationStore } from "@/stores/notificationStore";
import type { INotification } from "@/types/notification";
import { formatTimestamp } from "@/utils/datetime";

const typeConfig = {
  info: {
    icon: RiInformationLine,
    label: { id: "Info", en: "Info" },
    color: "text-accent-400",
    bg: "bg-accent-500/10",
    border: "border-accent-500/20",
    dot: "bg-accent-400",
    badge: "bg-accent-500/15 text-accent-400",
  },
  success: {
    icon: RiCheckboxCircleLine,
    label: { id: "Berhasil", en: "Success" },
    color: "text-neon-green",
    bg: "bg-neon-green/10",
    border: "border-neon-green/20",
    dot: "bg-neon-green",
    badge: "bg-neon-green/15 text-neon-green",
  },
  warning: {
    icon: RiAlertLine,
    label: { id: "Peringatan", en: "Warning" },
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
    border: "border-neon-yellow/20",
    dot: "bg-neon-yellow",
    badge: "bg-neon-yellow/15 text-neon-yellow",
  },
  error: {
    icon: RiErrorWarningLine,
    label: { id: "Error", en: "Error" },
    color: "text-neon-red",
    bg: "bg-neon-red/10",
    border: "border-neon-red/20",
    dot: "bg-neon-red",
    badge: "bg-neon-red/15 text-neon-red",
  },
  system: {
    icon: RiSettings3Line,
    label: { id: "Sistem", en: "System" },
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    border: "border-neon-cyan/20",
    dot: "bg-neon-cyan",
    badge: "bg-neon-cyan/15 text-neon-cyan",
  },
};

type FilterType = "all" | INotification["type"];

export default function NotificationsPage() {
  const { language } = useLanguageStore();
  const {
    notifications: notifs,
    markAllRead: handleMarkAllRead,
    toggleRead: handleToggleRead,
    deleteNotification: handleDelete,
    clearAll: handleClearAll,
  } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  const filteredNotifs = notifs.filter((n) => {
    if (activeFilter !== "all" && n.type !== activeFilter) return false;
    if (showUnreadOnly && n.is_read) return false;
    return true;
  });

  const filters: { key: FilterType; label: { id: string; en: string } }[] = [
    { key: "all", label: { id: "Semua", en: "All" } },
    { key: "info", label: { id: "Info", en: "Info" } },
    { key: "success", label: { id: "Berhasil", en: "Success" } },
    { key: "warning", label: { id: "Peringatan", en: "Warning" } },
    { key: "error", label: { id: "Error", en: "Error" } },
    { key: "system", label: { id: "Sistem", en: "System" } },
  ];

  // Group notifications by date
  const grouped = filteredNotifs.reduce<Record<string, INotification[]>>(
    (acc, notification) => {
      const date = new Date(notification.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = language({ id: "Hari ini", en: "Today" });
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = language({ id: "Kemarin", en: "Yesterday" });
      } else {
        key = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(notification);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <RiNotificationLine className="w-5 h-5" />
            {language({
              id: "Pusat Notifikasi",
              en: "Notification Center",
            })}
          </h2>
          <p className="text-sm text-dark-300 mt-1">
            {language({
              id: `${unreadCount} belum dibaca dari ${notifs.length} total notifikasi`,
              en: `${unreadCount} unread of ${notifs.length} total notifications`,
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-accent-400 hover:text-accent-300 bg-accent-500/10 hover:bg-accent-500/15 border border-accent-500/20 rounded-lg transition-all"
            >
              <RiCheckDoubleLine className="w-3.5 h-3.5" />
              {language({ id: "Tandai semua dibaca", en: "Mark all read" })}
            </button>
          )}
          {notifs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-dark-400 hover:text-neon-red bg-dark-700/50 hover:bg-neon-red/10 border border-dark-600/30 hover:border-neon-red/20 rounded-lg transition-all"
            >
              <RiDeleteBinLine className="w-3.5 h-3.5" />
              {language({ id: "Hapus semua", en: "Clear all" })}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <RiFilterLine className="w-4 h-4 text-dark-400 mr-1" />
          {filters.map((f) => {
            const count =
              f.key === "all"
                ? notifs.length
                : notifs.filter((n) => n.type === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-lg border transition-all ${
                  activeFilter === f.key
                    ? "bg-accent-500/15 text-accent-400 border-accent-500/30"
                    : "text-dark-400 hover:text-dark-200 bg-dark-700/30 border-dark-600/30 hover:border-dark-500/40"
                }`}
              >
                {language(f.label)} ({count})
              </button>
            );
          })}
        </div>

        {/* Unread toggle */}
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-lg border transition-all ${
            showUnreadOnly
              ? "bg-accent-500/15 text-accent-400 border-accent-500/30"
              : "text-dark-400 bg-dark-700/30 border-dark-600/30 hover:text-dark-200"
          }`}
        >
          <div
            className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${
              showUnreadOnly
                ? "bg-accent-500 border-accent-500"
                : "border-dark-500"
            }`}
          >
            {showUnreadOnly && <RiCheckLine className="w-2 h-2 text-white" />}
          </div>
          {language({ id: "Belum dibaca saja", en: "Unread only" })}
        </button>
      </div>

      {/* Notification list */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
            <RiNotificationLine className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-sm font-semibold text-dark-300 mb-1">
            {language({
              id: "Tidak ada notifikasi",
              en: "No notifications",
            })}
          </h3>
          <p className="text-xs text-dark-500 font-mono">
            {showUnreadOnly
              ? language({
                  id: "Semua notifikasi sudah dibaca",
                  en: "All notifications have been read",
                })
              : language({
                  id: "Notifikasi akan muncul di sini",
                  en: "Notifications will appear here",
                })}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-mono font-semibold text-dark-400 uppercase tracking-wider">
                  {dateGroup}
                </span>
                <div className="flex-1 h-px bg-dark-600/30" />
                <span className="text-[10px] font-mono text-dark-500">
                  {items.length}{" "}
                  {language({ id: "notifikasi", en: "notifications" })}
                </span>
              </div>

              {/* Notification cards */}
              <div className="space-y-2">
                {items.map((notif) => {
                  const config = typeConfig[notif.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={notif.id}
                      className={`group relative bg-dark-800/60 border rounded-xl p-4 transition-all duration-200 hover:bg-dark-800/80 ${
                        !notif.is_read
                          ? `${config.border} bg-dark-800/80`
                          : "border-dark-600/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type icon */}
                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center`}
                        >
                          <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-sm font-semibold truncate ${
                                    !notif.is_read
                                      ? "text-foreground"
                                      : "text-dark-200"
                                  }`}
                                >
                                  {language(notif.title)}
                                </h4>
                                {!notif.is_read && (
                                  <div
                                    className={`w-2 h-2 rounded-full ${config.dot} shrink-0 animate-pulse`}
                                  />
                                )}
                              </div>
                              <p className="text-xs text-dark-400 mt-1 leading-relaxed">
                                {language(notif.message)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleToggleRead(notif.id)}
                                className="p-1.5 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all"
                                title={
                                  notif.is_read
                                    ? language({
                                        id: "Tandai belum dibaca",
                                        en: "Mark as unread",
                                      })
                                    : language({
                                        id: "Tandai dibaca",
                                        en: "Mark as read",
                                      })
                                }
                              >
                                {notif.is_read ? (
                                  <RiInformationLine className="w-3.5 h-3.5" />
                                ) : (
                                  <RiCheckDoubleLine className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(notif.id)}
                                className="p-1.5 rounded-lg text-dark-400 hover:text-neon-red hover:bg-neon-red/10 transition-all"
                                title={language({
                                  id: "Hapus notifikasi",
                                  en: "Delete notification",
                                })}
                              >
                                <RiDeleteBinLine className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${config.badge}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {language(config.label)}
                            </span>
                            <span className="text-[10px] font-mono text-dark-500">
                              {formatTimestamp(notif.timestamp, language)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
