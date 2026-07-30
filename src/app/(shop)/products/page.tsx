import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { SearchFilter } from "@/components/products/search-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const titleParts = ["Shop"];
  if (params.q) titleParts.push(`“${params.q}”`);
  if (params.category) titleParts.push(params.category);
  return {
    title: titleParts.join(" · "),
    description:
      "Browse curated products across electronics, fashion, home, and more on ShopSphere Pro.",
  };
}

function FiltersSkeleton() {
  return <Skeleton className="h-[72px] w-full rounded-2xl" />;
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];
  let pages = 1;
  let total = 0;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    const [productResult, cats] = await Promise.all([
      getProducts({
        q: params.q,
        category: params.category,
        sort: params.sort,
        page,
      }),
      getCategories(),
    ]);
    products = productResult.products;
    pages = productResult.pages;
    total = productResult.total;
    categories = cats;
  } catch (error) {
    console.error("Products page error:", error);
  }

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.sort) sp.set("sort", params.sort);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          {total > 0
            ? `${total} product${total === 1 ? "" : "s"} found`
            : "Browse our full catalog"}
        </p>
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <SearchFilter categories={categories} />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductGrid
            products={products}
            emptyMessage="No products match your filters. Try clearing search or category."
          />
        </Suspense>
      </div>

      {pages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-4"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link href={buildPageUrl(page - 1)}>
              <Button variant="outline" className="rounded-xl">
                <ChevronLeft className="size-4" />
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="rounded-xl" disabled>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={buildPageUrl(page + 1)}>
              <Button variant="outline" className="rounded-xl">
                Next
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="rounded-xl" disabled>
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
