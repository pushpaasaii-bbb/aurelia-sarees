"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  LoaderCircle,
  Save,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductImageGalleryManager from "@/components/admin/ProductImageGalleryManager";

const productSchema = z.object({
  title: z.string().trim().min(3, "Enter a product title."),
  slug: z
    .string()
    .trim()
    .min(3, "Enter a URL slug.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters and hyphens only."
    ),
  description: z.string().trim().min(10, "Enter a short description."),
  price: z
    .string()
    .refine((value) => Number(value) > 0, "Enter a valid selling price."),
  original_price: z.string(),
  stock_quantity: z
    .string()
    .regex(/^\d+$/, "Enter a valid stock quantity."),
  low_stock_threshold: z
    .string()
    .regex(/^\d+$/, "Enter a valid low-stock quantity."),
  category_id: z.string().min(1, "Choose a collection."),
  fabric: z.string().trim().min(2, "Enter the fabric."),
  colour: z.string().trim().min(2, "Enter the colour."),
  occasion: z.string().trim().min(2, "Enter the occasion."),
  work_details: z.string(),
  saree_length: z.string(),
  blouse_piece: z.string(),
  care_instructions: z.string(),
  dispatch_timeline: z.string(),
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

function getStoragePathFromPublicUrl(imageUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [formError, setFormError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
      stock_quantity: "0",
      low_stock_threshold: "3",
      category_id: "",
      fabric: "",
      colour: "",
      occasion: "",
      work_details: "",
      saree_length: "",
      blouse_piece: "",
      care_instructions: "",
      dispatch_timeline: "",
      status: "active",
      featured: false,
      is_new_arrival: false,
      is_best_seller: false,
    },
  });

  const productTitle = watch("title");

  useEffect(() => {
    async function loadProduct() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/admin/products/${productId}/edit`);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const [productResult, categoriesResult] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase
          .from("categories")
          .select("id, name")
          .order("sort_order", { ascending: true }),
      ]);

      if (!productResult.data) {
        router.replace("/admin/products");
        return;
      }

      const product = productResult.data;

      setCategories(categoriesResult.data ?? []);
      setValue("title", product.title ?? "");
      setValue("slug", product.slug ?? "");
      setValue("description", product.description ?? "");
      setValue("price", String(product.price ?? ""));
      setValue(
        "original_price",
        product.original_price ? String(product.original_price) : ""
      );
      setValue("stock_quantity", String(product.stock_quantity ?? 0));
      setValue(
        "low_stock_threshold",
        String(product.low_stock_threshold ?? 3)
      );
      setValue("category_id", product.category_id ?? "");
      setValue("fabric", product.fabric ?? "");
      setValue("colour", product.colour ?? "");
      setValue("occasion", product.occasion ?? "");
      setValue("work_details", product.work_details ?? "");
      setValue("saree_length", product.saree_length ?? "");
      setValue("blouse_piece", product.blouse_piece ?? "");
      setValue("care_instructions", product.care_instructions ?? "");
      setValue("dispatch_timeline", product.dispatch_timeline ?? "");
      setValue(
        "status",
        product.status as ProductFormValues["status"]
      );
      setValue("featured", product.featured ?? false);
      setValue("is_new_arrival", product.is_new_arrival ?? false);
      setValue("is_best_seller", product.is_best_seller ?? false);

      setIsCheckingAdmin(false);
    }

    loadProduct();
  }, [productId, router, setValue]);

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

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        price,
        original_price: originalPrice,
        stock_quantity: Number(values.stock_quantity),
        low_stock_threshold: Number(values.low_stock_threshold),
        category_id: values.category_id,
        fabric: values.fabric.trim(),
        colour: values.colour.trim(),
        occasion: values.occasion.trim(),
        work_details: values.work_details.trim() || null,
        saree_length: values.saree_length.trim() || null,
        blouse_piece: values.blouse_piece.trim() || null,
        care_instructions: values.care_instructions.trim() || null,
        dispatch_timeline: values.dispatch_timeline.trim() || null,
        status: values.status,
        featured: values.featured,
        is_new_arrival: values.is_new_arrival,
        is_best_seller: values.is_best_seller,
      })
      .eq("id", productId);

    if (updateError) {
      setFormError(updateError.message);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function handlePermanentDelete() {
    const confirmed = window.confirm(
      "Permanently delete this saree? This cannot be undone. Products with past orders cannot be deleted."
    );

    if (!confirmed) {
      return;
    }

    setFormError("");
    setIsDeleting(true);

    const supabase = createClient();

    const { count: orderItemCount, error: orderCheckError } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    if (orderCheckError) {
      setFormError(orderCheckError.message);
      setIsDeleting(false);
      return;
    }

    if ((orderItemCount ?? 0) > 0) {
      setFormError(
        "This saree is part of past orders, so it cannot be permanently deleted. Change its status to Discontinued instead."
      );
      setIsDeleting(false);
      return;
    }

    const { data: imageRows, error: imagesReadError } = await supabase
      .from("product_images")
      .select("id, image_url")
      .eq("product_id", productId);

    if (imagesReadError) {
      setFormError(imagesReadError.message);
      setIsDeleting(false);
      return;
    }

    const [cartResult, wishlistResult] = await Promise.all([
      supabase.from("cart_items").delete().eq("product_id", productId),
      supabase.from("wishlist_items").delete().eq("product_id", productId),
    ]);

    if (cartResult.error || wishlistResult.error) {
      setFormError(
        cartResult.error?.message ??
          wishlistResult.error?.message ??
          "Could not remove this saree from customer carts."
      );
      setIsDeleting(false);
      return;
    }

    const { error: imageDeleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (imageDeleteError) {
      setFormError(imageDeleteError.message);
      setIsDeleting(false);
      return;
    }

    const { error: productDeleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (productDeleteError) {
      setFormError(productDeleteError.message);
      setIsDeleting(false);
      return;
    }

    const storagePaths = (imageRows ?? [])
      .map((image) => getStoragePathFromPublicUrl(image.image_url))
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      await supabase.storage.from("product-images").remove(storagePaths);
    }

    router.replace("/admin/products");
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
          <Link
            href="/admin"
            className="font-serif text-2xl tracking-[0.12em]"
          >
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

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">
          Edit Saree
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Update product details, multiple product photos, and live stock.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-8">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Product Basics
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.12em]">
                  Product title
                </label>
                <input
                  {...register("title")}
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                />
                {errors.title && (
                  <p className="mt-2 text-xs text-red-700">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.12em]">
                  URL slug
                </label>
                <input
                  {...register("slug")}
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                />
                {errors.slug && (
                  <p className="mt-2 text-xs text-red-700">
                    {errors.slug.message}
                  </p>
                )}
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

            {errors.description && (
              <p className="mt-2 text-xs text-red-700">
                {errors.description.message}
              </p>
            )}
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Price & Inventory
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["price", "Selling price ₹"],
                ["original_price", "Original price ₹"],
                ["stock_quantity", "Stock quantity"],
                ["low_stock_threshold", "Low stock warning"],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                >
                  {label}
                  <input
                    {...register(
                      field as
                        | "price"
                        | "original_price"
                        | "stock_quantity"
                        | "low_stock_threshold"
                    )}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Saree Details
            </h2>

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
                <label
                  key={field}
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                >
                  {label}
                  <input
                    {...register(field)}
                    placeholder={placeholder}
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Product Gallery
            </h2>

            <div className="mt-6">
              <ProductImageGalleryManager
                productId={productId}
                productTitle={productTitle || "AURELIA Saree"}
              />
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Visibility
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-[0.12em]">
                Product status
                <select
                  {...register("status")}
                  className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
                >
                  <option value="active">
                    Active — visible and purchasable
                  </option>
                  <option value="hidden">Hidden — admin only</option>
                  <option value="sold_out">Sold Out — not purchasable</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <label className="flex items-center gap-3 text-sm">
                <input
                  {...register("featured")}
                  type="checkbox"
                  className="size-4 accent-[#4A0F22]"
                />
                Featured product
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  {...register("is_new_arrival")}
                  type="checkbox"
                  className="size-4 accent-[#4A0F22]"
                />
                New arrival
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  {...register("is_best_seller")}
                  type="checkbox"
                  className="size-4 accent-[#4A0F22]"
                />
                Best seller
              </label>
            </div>
          </section>

          {formError && (
            <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {formError}
            </p>
          )}

          <section className="border border-red-200 bg-red-50 p-5 sm:p-7">
            <div className="flex gap-3">
              <AlertTriangle
                size={22}
                className="mt-0.5 shrink-0 text-red-700"
              />
              <div>
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Danger zone
                </h2>
                <p className="mt-2 text-sm leading-6 text-red-800/80">
                  Permanently delete this saree only if it has never been
                  ordered. Products with previous customer orders must be set
                  to <strong>Discontinued</strong> instead.
                </p>

                <button
                  type="button"
                  onClick={handlePermanentDelete}
                  disabled={isDeleting}
                  className="mt-5 flex min-h-11 items-center gap-2 border border-red-700 px-4 text-xs font-bold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Permanently Delete Saree
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

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
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}