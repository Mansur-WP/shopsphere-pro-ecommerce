import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryBySlug } from "@/actions/categories";
import { getProducts } from "@/actions/products";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ category: slug, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All categories
      </Link>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {total} product{total === 1 ? "" : "s"}
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
