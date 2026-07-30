import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryCard } from "@/components/home/category-card";
import { WhyChooseSection } from "@/components/home/why-choose-section";
import { SellerCtaSection } from "@/components/home/seller-cta-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getFeaturedProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";

export const metadata = {
  title: "ShopSphere Pro — Premium Multi-Vendor Marketplace",
  description:
    "Discover curated products from verified sellers. Secure checkout, fast shipping, and a modern shopping experience.",
  openGraph: {
    title: "ShopSphere Pro",
    description:
      "Premium multi-vendor marketplace for buyers and sellers who care about quality.",
    type: "website",
  },
};

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featured, categories] = await Promise.all([
      getFeaturedProducts(8),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Home page data error:", error);
  }

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Featured products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked selections from top sellers this week.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="rounded-xl">
              View all
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid
          products={featured}
          emptyMessage="Featured products will appear here once the catalog is seeded."
        />
      </section>

      <section className="border-y border-border/60 bg-muted/15 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Shop by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explore collections crafted for everyday living and work.
            </p>
          </div>
          {categories.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {categories.slice(0, 4).map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  image={cat.image}
                  description={cat.description}
                  productCount={cat.productCount}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Categories will appear after seeding the database.
            </p>
          )}
        </div>
      </section>

      <WhyChooseSection />
      <SellerCtaSection />
      <NewsletterSection />
    </>
  );
}
