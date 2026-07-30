import Link from "next/link";
import {
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS = {
  users: Users,
  store: Store,
  package: Package,
  orders: ShoppingCart,
  revenue: DollarSign,
  clock: Clock,
} as const satisfies Record<string, LucideIcon>;

export type AdminStatIcon = keyof typeof ICONS;

export interface AdminStatItem {
  label: string;
  value: string | number;
  description?: string;
  /** Serialisable icon key — never pass Lucide components across the RSC boundary */
  icon: AdminStatIcon;
  href?: string;
}

interface AdminStatsCardProps {
  cards: AdminStatItem[];
  className?: string;
}

export function AdminStatsCard({ cards, className }: AdminStatsCardProps) {
  if (!cards.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
        Unable to load dashboard stats.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6",
        className
      )}
    >
      {cards.map((card) => {
        const Icon = ICONS[card.icon] ?? Package;
        const inner = (
          <Card
            className={cn(
              "border-border/70 transition-all duration-300",
              card.href &&
                "hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold">{card.value}</p>
              {card.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              )}
            </CardContent>
          </Card>
        );

        return card.href ? (
          <Link key={card.label} href={card.href}>
            {inner}
          </Link>
        ) : (
          <div key={card.label}>{inner}</div>
        );
      })}
    </div>
  );
}
