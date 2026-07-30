"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CategoryData } from "@/actions/categories";

export interface SearchFilterProps {
  categories: CategoryData[];
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
] as const;

/** Alias used by product listing — search, category, and price sort */
export function SearchFilter({ categories }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "featured";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all" || (key === "sort" && value === "featured")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, searchParams]
  );

  const hasFilters = Boolean(q || category !== "all" || sort !== "featured");

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center ${
        pending ? "opacity-70" : ""
      }`}
    >
      <form
        className="relative min-w-[200px] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateParams({ q: (fd.get("q") as string)?.trim() || null });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          key={q}
          placeholder="Search products..."
          className="h-10 rounded-xl pl-9"
          aria-label="Search products"
        />
      </form>

      <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-none">
        <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:flex-none">
          <SlidersHorizontal className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          <Select
            value={category}
            onValueChange={(value) =>
              updateParams({ category: value ?? null })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[160px] rounded-xl sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:flex-none">
          <ArrowUpDown className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          <Select
            value={sort}
            onValueChange={(value) => updateParams({ sort: value ?? null })}
          >
            <SelectTrigger className="h-10 w-full min-w-[180px] rounded-xl sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={pending}
            onClick={() =>
              updateParams({ q: null, category: null, sort: null })
            }
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

/** @deprecated Prefer SearchFilter — kept for existing imports */
export function ProductFilters(props: SearchFilterProps) {
  return <SearchFilter {...props} />;
}
