"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Package,
  ShoppingCart,
  Store,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityItem {
  id: string;
  type: "order" | "user" | "seller" | "product";
  title: string;
  subtitle: string;
  createdAt: string;
}

const ICONS = {
  order: ShoppingCart,
  user: UserPlus,
  seller: Store,
  product: Package,
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-heading text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!activities.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((item) => {
              const Icon = ICONS[item.type];
              return (
                <li key={item.id} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
