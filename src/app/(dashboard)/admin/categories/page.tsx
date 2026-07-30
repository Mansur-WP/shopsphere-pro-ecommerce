import { CategoryManager } from "@/components/admin/category-manager";
import { getCategories } from "@/actions/categories";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Categories</h2>
        <p className="text-muted-foreground">
          Organize the catalog with marketplace categories.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
