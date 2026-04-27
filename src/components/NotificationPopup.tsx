import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  RiCheckDoubleLine,
  RiInformationLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiErrorWarningLine,
  RiSettings3Line,
  RiArrowRightLine,
} from "react-icons/ri";
import { useLanguageStore } from "@/stores/languageStore";
import type { INotification } from "@/types/notification";
import { timeAgo } from "@/utils/datetime";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";

const typeConfig = {
  info: {
    icon: RiInformationLine,
    color: "text-accent-400",
    bg: "bg-accent-500/10",
    dot: "bg-accent-400",
  },
  success: {
    icon: RiCheckboxCircleLine,
    color: "text-neon-green",
    bg: "bg-neon-green/10",
    dot: "bg-neon-green",
  },
  warning: {
    icon: RiAlertLine,
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
    dot: "bg-neon-yellow",
  },
  error: {
    icon: RiErrorWarningLine,
    color: "text-neon-red",
    bg: "bg-neon-red/10",
    dot: "bg-neon-red",
  },
  system: {
    icon: RiSettings3Line,
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    dot: "bg-neon-cyan",
  },
};

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: INotification[];
  onMarkAllRead?: () => void;
}

export default function NotificationPopup({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationPopupProps) {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  const { language } = useLanguageStore();
  const { user } = useAuthStore();

  const recent = notifications.slice(0, 4);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    console.log({ user });

    if (user?.id) {
      const socket = getSocket();
      console.log({ socket });
      const token = localStorage.getItem("token");
      socket.emit("join", token);
      socket.on("notification", (data: INotification) => {
        console.log(data);
      });
      return () => {
        socket.off("notification");
      };
    }
  }, [user?.id]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // delay to avoid closing immediately from the toggle click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl shadow-black/30 z-50 overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600/40">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {language({ id: "Notifikasi", en: "Notifications" })}
          </h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-mono text-accent-400 hover:text-accent-300 transition-colors"
          >
            <RiCheckDoubleLine className="w-3.5 h-3.5" />
            {language({ id: "Tandai dibaca", en: "Mark all read" })}
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[340px]">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-dark-700/50 flex items-center justify-center mb-3">
              <RiInformationLine className="w-6 h-6 text-dark-400" />
            </div>
            <p className="text-sm text-dark-400 font-mono">
              {language({
                id: "Belum ada notifikasi",
                en: "No notifications yet",
              })}
            </p>
          </div>
        ) : (
          recent.map((notif) => {
            const config = typeConfig[notif.type];
            const Icon = config.icon;
            return (
              <button
                key={notif.id}
                onClick={() => {
                  if (notif.link) navigate(notif.link);
                  onClose();
                }}
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-dark-700/40 transition-all border-b border-dark-600/20 last:border-b-0 ${
                  !notif.isRead ? "bg-dark-700/20" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center mt-0.5`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold truncate ${
                        !notif.isRead ? "text-foreground" : "text-dark-200"
                      }`}
                    >
                      {language(notif.title)}
                    </span>
                    {!notif.isRead && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-dark-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {language(notif.message)}
                  </p>
                  <span className="text-[10px] text-dark-500 font-mono mt-1 block">
                    {timeAgo(notif.timestamp, language)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer - See All */}
      {notifications.length > 0 && (
        <div className="border-t border-dark-600/40">
          <button
            onClick={() => {
              navigate("/app/notifications");
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-accent-400 hover:text-accent-300 hover:bg-dark-700/30 transition-all"
          >
            {language({ id: "Lihat semua", en: "See all" })}
            <RiArrowRightLine className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
