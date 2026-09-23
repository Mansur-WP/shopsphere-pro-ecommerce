"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/staff/image-uploader";
import {
  createStaffProduct,
  updateStaffProduct,
} from "@/actions/staff";
import { productSchema, type ProductInput } from "@/lib/validations";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: Partial<ProductInput>;
}

export function ProductForm({
  categories,
  mode,
  productId,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? ("" as unknown as number),
      compareAt: defaultValues?.compareAt ?? "",
      stock: defaultValues?.stock ?? 0,
      sku: defaultValues?.sku ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      images: defaultValues?.images ?? [],
      featured: defaultValues?.featured ?? false,
      published: defaultValues?.published ?? true,
    },
  });

  const images = watch("images");

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      const payload = {
        ...values,
        compareAt:
          values.compareAt === "" || values.compareAt === undefined
            ? undefined
            : values.compareAt,
      };

      const result =
        mode === "create"
          ? await createStaffProduct(payload)
          : await updateStaffProduct(productId!, payload);

      if (result.success) {
        toast.success(result.message ?? "Saved successfully");
        router.push("/staff/products");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-heading">
          {mode === "create" ? "Product details" : "Edit product"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="rounded-xl"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              className="rounded-xl"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="rounded-xl"
                aria-invalid={!!errors.price}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAt">Compare at</Label>
              <Input
                id="compareAt"
                type="number"
                step="0.01"
                min="0"
                className="rounded-xl"
                {...register("compareAt")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                className="rounded-xl"
                aria-invalid={!!errors.stock}
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" className="rounded-xl" {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(v) => field.onChange(v ?? "")}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <ImageUploader
            value={images ?? []}
            onChange={(urls) =>
              setValue("images", urls, { shouldValidate: true })
            }
          />
          {errors.images && (
            <p className="text-xs text-destructive">{errors.images.message}</p>
          )}

          <div className="flex flex-wrap gap-6 rounded-xl border border-border/70 p-4">
            <Controller
              control={control}
              name="published"
              render={({ field }) => (
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Published
                </label>
              )}
            />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  Featured
                </label>
              )}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="rounded-xl" disabled={pending}>
              {pending
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                  ? "Create product"
                  : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push("/staff/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
