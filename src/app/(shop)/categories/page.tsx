import Link from "next/link";
import { Package } from "lucide-react";
import { getCategories } from "@/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore products organized by collection.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Package className="size-5" />
              </div>
              <div>
                <h2 className="font-heading font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {cat.productCount ?? 0} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
