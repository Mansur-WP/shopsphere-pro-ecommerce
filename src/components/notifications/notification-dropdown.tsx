"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const data = await getNotifications(15);
      setItems(data.notifications);
      setUnread(data.unreadCount);
    });
  }

  useEffect(() => {
    if (session?.user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (!session?.user) return null;

  function handleOpen(next: boolean) {
    setOpen(next);
    if (next) load();
  }

  function handleClick(item: NotificationItem) {
    startTransition(async () => {
      if (!item.read) {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
        setUnread((c) => Math.max(0, c - 1));
      }
      setOpen(false);
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    });
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]">
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="font-heading text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
              disabled={pending}
              onClick={handleMarkAll}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!items.length ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul>
              {items.map((item) => {
                const content = (
                  <div
                    className={cn(
                      "px-4 py-3 transition-colors hover:bg-muted/50",
                      !item.read && "bg-emerald-500/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      {!item.read && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.message}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                );

                return (
                  <li key={item.id} className="border-b border-border/40 last:border-0">
                    {item.link ? (
                      <Link href={item.link} onClick={() => handleClick(item)}>
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => handleClick(item)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
