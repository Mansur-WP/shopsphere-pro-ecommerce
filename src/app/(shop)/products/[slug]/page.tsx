import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/actions/products";
import { getProductReviews, getReviewEligibility } from "@/actions/reviews";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { ProductGrid } from "@/components/products/product-grid";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) {
    return { title: "Product not found" };
  }
  const description = product.description.slice(0, 160);
  const image = product.images[0];

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [{ reviews }, related, reviewEligibility] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.id, product.categoryId, 4),
    getReviewEligibility(product.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku ?? undefined,
    brand: product.seller
      ? { "@type": "Brand", name: product.seller.storeName }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="inline-flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="size-4" />
          Shop
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <ProductDetailClient
        product={{ ...product, reviews, reviewEligibility }}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-heading mb-6 text-2xl font-bold tracking-tight">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
