"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { Bell, CheckCheck, BellOff, UserPlus, CheckCircle2, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { apiFetch } from "@/lib/client";
import { formatRelative, cn } from "@/lib/utils";

const TYPE_ICON = {
  assigned: UserPlus,
  completed: CheckCircle2,
  updated: RefreshCw,
};

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, mutate } = useNotifications();

  async function markAllRead() {
    // Optimistic clear.
    mutate(
      (current) => ({ ...(current || {}), items: (current?.items || []).map((n) => ({ ...n, isRead: true })), unreadCount: 0 }),
      false
    );
    try {
      await apiFetch("/api/notifications", { method: "PATCH" });
    } finally {
      mutate();
    }
  }

  async function openNotification(n) {
    setOpen(false);
    if (!n.isRead) {
      apiFetch(`/api/notifications/${n.id}`, { method: "PATCH" })
        .then(() => mutate())
        .catch(() => {});
    }
    if (n.task) router.push(`/tasks/${n.task}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                Task activity will show up here.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell;
                return (
                  <m.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => openNotification(n)}
                    className={cn(
                      "flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/60",
                      !n.isRead && "bg-accent/40"
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug">{n.message}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatRelative(n.createdAt)}
                      </span>
                    </span>
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </m.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
