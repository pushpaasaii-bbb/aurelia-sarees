"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductImageUploader from "@/components/admin/ProductImageUploader";

const productSchema = z.object({
  title: z.string().trim().min(3, "Enter a product title."),
  slug: z
    .string()
    .trim()
    .min(3, "Enter a URL slug.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters and hyphens only."),
  description: z.string().trim().min(10, "Enter a short description."),
  price: z.string().refine((value) => Number(value) > 0, "Enter a valid selling price."),
  original_price: z.string(),
  stock_quantity: z.string().regex(/^\d+$/, "Enter a valid stock quantity."),
  low_stock_threshold: z.string().regex(/^\d+$/, "Enter a valid low-stock quantity."),
  category_id: z.string().min(1, "Choose a collection."),
  fabric: z.string().trim().min(2, "Enter the fabric."),
  colour: z.string().trim().min(2, "Enter the colour."),
  occasion: z.string().trim().min(2, "Enter the occasion."),
  work_details: z.string(),
  saree_length: z.string(),
  blouse_piece: z.string(),
  care_instructions: z.string(),
  dispatch_timeline: z.string(),
  image_url: z.string(),
  status: z.enum(["active", "hidden", "discontinued", "sold_out"]),
  featured: z.boolean(),
  is_new_arrival: z.boolean(),
  is_best_seller: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type Category = {
  id: string;
  name: string;
};

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function NewAdminProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: "",
      original_price: "",
      stock_quantity: "1",
      low_stock_threshold: "3",
      category_id: "",
      fabric: "",
      colour: "",
      occasion: "",
      work_details: "",
      saree_length: "5.5 metres",
      blouse_piece: "Included",
      care_instructions: "Dry clean only",
      dispatch_timeline: "Dispatches within 2–3 business days",
      image_url: "",
      status: "active",
      featured: false,
      is_new_arrival: true,
      is_best_seller: false,
    },
  });

  const imageUrl = watch("image_url");

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/products/new");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("sort_order");

      setCategories(data ?? []);
      setIsCheckingAdmin(false);
    }

    loadAdminData();
  }, [router]);

  async function onSubmit(values: ProductFormValues) {
    setFormError("");

    const price = Number(values.price);
    const originalPrice = values.original_price
      ? Number(values.original_price)
      : null;

    if (originalPrice !== null && originalPrice < price) {
      setFormError("Original price cannot be lower than the selling price.");
      return;
    }

    const supabase = createClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        title: values.title,
        slug: values.slug,
        description: values.description,
        price,
        original_price: originalPrice,
        stock_quantity: Number(values.stock_quantity),
        low_stock_threshold: Number(values.low_stock_threshold),
        category_id: values.category_id,
        fabric: values.fabric,
        colour: values.colour,
        occasion: values.occasion,
        work_details: values.work_details || null,
        saree_length: values.saree_length || null,
        blouse_piece: values.blouse_piece || null,
        care_instructions: values.care_instructions || null,
        dispatch_timeline: values.dispatch_timeline || null,
        status: values.status,
        featured: values.featured,
        is_new_arrival: values.is_new_arrival,
        is_best_seller: values.is_best_seller,
      })
      .select("id")
      .single();

    if (productError || !product) {
      setFormError(productError?.message ?? "Could not create this product.");
      return;
    }

    if (values.image_url) {
      const { error: imageError } = await supabase.from("product_images").insert({
        product_id: product.id,
        image_url: values.image_url,
        alt_text: values.title,
        sort_order: 1,
      });

      if (imageError) {
        setFormError("Product was created, but its image could not be saved.");
        return;
      }
    }

    router.push("/admin/products");
    router.refresh();
  }

  if (isCheckingAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const details = [
    ["fabric", "Fabric", "Pure Silk"],
    ["colour", "Colour", "Crimson Red"],
    ["occasion", "Occasion", "Wedding, Festive, Party"],
    ["work_details", "Work / weave", "Zari, embroidery, handwork"],
    ["saree_length", "Saree length", "5.5 metres"],
    ["blouse_piece", "Blouse piece", "Included"],
    ["care_instructions", "Care instructions", "Dry clean only"],
    ["dispatch_timeline", "Dispatch timeline", "Dispatches within 2–3 days"],
  ] as const;

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.12em]">
            AURELIA
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link
          href="/admin/products"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Products
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">Add a Saree</h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Add the true stock quantity that customers can purchase.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-8">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Product Basics</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.12em]">
                  Product title
                </label>
                <input
                  {...register("title", {
                    onBlur: (event) =>
                      setValue("slug", createSlug(event.target.value)),
                  })}
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                />
                {errors.title && <p className="mt-2 text-xs text-red-700">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.12em]">
                  URL slug
                </label>
                <input
                  {...register("slug")}
                  placeholder="example-saree-name"
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                />
                {errors.slug && <p className="mt-2 text-xs text-red-700">{errors.slug.message}</p>}
              </div>
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em]">
              Description
              <textarea
                {...register("description")}
                rows={4}
                className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none focus:border-[#6E1834]"
              />
            </label>
            {errors.description && <p className="mt-2 text-xs text-red-700">{errors.description.message}</p>}
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Price & Inventory</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["price", "Selling price ₹", "1"],
                ["original_price", "Original price ₹", "Optional"],
                ["stock_quantity", "Stock quantity", "0"],
                ["low_stock_threshold", "Low stock warning", "3"],
              ].map(([field, label, placeholder]) => (
                <label key={field} className="text-xs font-bold uppercase tracking-[0.12em]">
                  {label}
                  <input
                    {...register(field as "price" | "original_price" | "stock_quantity" | "low_stock_threshold")}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder={placeholder}
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
            {(errors.price || errors.stock_quantity || errors.low_stock_threshold) && (
              <p className="mt-3 text-xs text-red-700">Enter valid price and stock numbers.</p>
            )}
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Saree Details</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-[0.12em]">
                Collection
                <select
                  {...register("category_id")}
                  className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
                >
                  <option value="">Choose collection</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {details.map(([field, label, placeholder]) => (
                <label key={field} className="text-xs font-bold uppercase tracking-[0.12em]">
                  {label}
                  <input
                    {...register(field)}
                    placeholder={placeholder}
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>

            {(errors.category_id || errors.fabric || errors.colour || errors.occasion) && (
              <p className="mt-3 text-xs text-red-700">
                Collection, fabric, colour, and occasion are required.
              </p>
            )}
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Image & Visibility</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ProductImageUploader
                value={imageUrl}
                onChange={(url) =>
                  setValue("image_url", url, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />

              <label className="text-xs font-bold uppercase tracking-[0.12em]">
                Product status
                <select
                  {...register("status")}
                  className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
                >
                  <option value="active">Active — visible and purchasable</option>
                  <option value="hidden">Hidden — admin only</option>
                  <option value="sold_out">Sold Out — not purchasable</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-3 text-sm">
                <input {...register("featured")} type="checkbox" className="size-4 accent-[#4A0F22]" />
                Featured product
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input {...register("is_new_arrival")} type="checkbox" className="size-4 accent-[#4A0F22]" />
                New arrival
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input {...register("is_best_seller")} type="checkbox" className="size-4 accent-[#4A0F22]" />
                Best seller
              </label>
            </div>
          </section>

          {formError && (
            <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="flex min-h-12 items-center justify-center border border-[#DCCCB9] px-5 text-xs font-bold uppercase tracking-[0.13em] text-[#6E1834]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save size={17} /> Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}