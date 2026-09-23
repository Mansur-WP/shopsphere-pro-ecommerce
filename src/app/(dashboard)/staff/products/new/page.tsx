import { ProductForm } from "@/components/staff/product-form";
import { getCategories } from "@/actions/categories";

export const metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          New product
        </h2>
        <p className="text-muted-foreground">
          Add a listing to the Africhina catalog.
        </p>
      </div>
      <ProductForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
