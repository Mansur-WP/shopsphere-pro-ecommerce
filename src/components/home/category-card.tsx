import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  productCount?: number;
  image?: string | null;
  description?: string | null;
  className?: string;
  index?: number;
}

export function CategoryCard({
  name,
  slug,
  productCount = 0,
  image,
  description,
  className,
  index = 0,
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-blue-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">
              {name}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {description
                ? description.slice(0, 48) + (description.length > 48 ? "…" : "")
                : `${productCount} product${productCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
