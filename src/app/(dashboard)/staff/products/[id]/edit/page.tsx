import { notFound } from "next/navigation";
import { ProductForm } from "@/components/staff/product-form";
import { getCategories } from "@/actions/categories";
import { getStaffProduct } from "@/actions/staff";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getStaffProduct(id);
  return { title: product ? `Edit ${product.name}` : "Edit product" };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getStaffProduct(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Edit product
        </h2>
        <p className="text-muted-foreground">Update listing details and stock.</p>
      </div>
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price,
          compareAt: product.compareAt ?? "",
          stock: product.stock,
          sku: product.sku ?? "",
          categoryId: product.categoryId,
          images: product.images,
          featured: product.featured,
          published: product.published,
        }}
      />
    </div>
  );
}
