import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Za-z]/, "Password must include a letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const sellerRegisterSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  description: z.string().min(20, "Describe your store (min 20 characters)"),
  businessEmail: z.string().email("Enter a valid business email"),
  phone: z.string().min(7, "Enter a valid phone number").optional(),
  address: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  compareAt: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  featured: z.boolean(),
  published: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5, "Review must be at least 5 characters").optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Full name is required"),
  shippingEmail: z.string().email("Valid email is required"),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingCountry: z.string().min(2, "Country is required"),
  shippingPostal: z.string().min(2, "Postal code is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .optional(),
});

export const storeUpdateSchema = z.object({
  storeName: z.string().min(2),
  description: z.string().min(20),
  businessEmail: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  isDefault: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type StoreUpdateInput = z.infer<typeof storeUpdateSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
