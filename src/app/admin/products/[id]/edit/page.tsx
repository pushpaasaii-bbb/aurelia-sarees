"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };

type FormData = {
  title: string;
  slug: string;
  description: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  category_id: string;
  fabric: string;
  colour: string;
  occasion: string;
  work_details: string;
  saree_length: string;
  blouse_piece: string;
  care_instructions: string;
  dispatch_timeline: string;
  status: "active" | "hidden" | "discontinued" | "sold_out";
  featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
};

const emptyForm: FormData = {
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
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/admin/products/${params.id}/edit`);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const [{ data: product }, { data: categoryData }] = await Promise.all([
        supabase.from("products").select("*").eq("id", params.id).single(),
        supabase.from("categories").select("id, name").order("sort_order"),
      ]);

      if (!product) {
        router.replace("/admin/products");
        return;
      }

      setCategories(categoryData ?? []);
      setForm({
        title: product.title ?? "",
        slug: product.slug ?? "",
        description: product.description ?? "",
        price: String(product.price ?? ""),
        original_price: product.original_price ? String(product.original_price) : "",
        stock_quantity: String(product.stock_quantity ?? 0),
        low_stock_threshold: String(product.low_stock_threshold ?? 3),
        category_id: product.category_id ?? "",
        fabric: product.fabric ?? "",
        colour: product.colour ?? "",
        occasion: product.occasion ?? "",
        work_details: product.work_details ?? "",
        saree_length: product.saree_length ?? "",
        blouse_piece: product.blouse_piece ?? "",
        care_instructions: product.care_instructions ?? "",
        dispatch_timeline: product.dispatch_timeline ?? "",
        status: product.status,
        featured: product.featured ?? false,
        is_new_arrival: product.is_new_arrival ?? false,
        is_best_seller: product.is_best_seller ?? false,
      });

      setIsLoading(false);
    }

    loadPage();
  }, [params.id, router]);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.slug ||
      !form.description ||
      !form.category_id ||
      !form.fabric ||
      !form.colour ||
      !form.occasion
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.stock_quantity) < 0) {
      setError("Enter a valid selling price and stock quantity.");
      return;
    }

    if (
      form.original_price &&
      Number(form.original_price) < Number(form.price)
    ) {
      setError("Original price cannot be lower than selling price.");
      return;
    }

    setIsSaving(true);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        original_price: form.original_price
          ? Number(form.original_price)
          : null,
        stock_quantity: Number(form.stock_quantity),
        low_stock_threshold: Number(form.low_stock_threshold),
        category_id: form.category_id,
        fabric: form.fabric.trim(),
        colour: form.colour.trim(),
        occasion: form.occasion.trim(),
        work_details: form.work_details.trim() || null,
        saree_length: form.saree_length.trim() || null,
        blouse_piece: form.blouse_piece.trim() || null,
        care_instructions: form.care_instructions.trim() || null,
        dispatch_timeline: form.dispatch_timeline.trim() || null,
        status: form.status,
        featured: form.featured,
        is_new_arrival: form.is_new_arrival,
        is_best_seller: form.is_best_seller,
      })
      .eq("id", params.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const textFields: Array<[keyof FormData, string, string]> = [
    ["fabric", "Fabric", "Pure Silk"],
    ["colour", "Colour", "Crimson Red"],
    ["occasion", "Occasion", "Wedding, Festive, Party"],
    ["work_details", "Work / weave", "Zari, embroidery, handwork"],
    ["saree_length", "Saree length", "5.5 metres"],
    ["blouse_piece", "Blouse piece", "Included"],
    ["care_instructions", "Care instructions", "Dry clean only"],
    ["dispatch_timeline", "Dispatch timeline", "Dispatches within 2–3 days"],
  ];

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

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">
          Edit Saree
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Update product details and exact live stock quantity.
        </p>

        <form onSubmit={handleSave} className="mt-9 space-y-8">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Product Basics</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                ["title", "Product title"],
                ["slug", "URL slug"],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                >
                  {label}
                  <input
                    value={form[field as "title" | "slug"]}
                    onChange={(event) =>
                      updateField(
                        field as "title" | "slug",
                        event.target.value
                      )
                    }
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em]">
              Description
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={4}
                className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none focus:border-[#6E1834]"
              />
            </label>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Price & Inventory</h2>

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
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={
                      form[
                        field as
                          | "price"
                          | "original_price"
                          | "stock_quantity"
                          | "low_stock_threshold"
                      ]
                    }
                    onChange={(event) =>
                      updateField(
                        field as
                          | "price"
                          | "original_price"
                          | "stock_quantity"
                          | "low_stock_threshold",
                        event.target.value
                      )
                    }
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Saree Details</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-bold uppercase tracking-[0.12em]">
                Collection
                <select
                  value={form.category_id}
                  onChange={(event) => updateField("category_id", event.target.value)}
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

              {textFields.map(([field, label, placeholder]) => (
                <label
                  key={field}
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                >
                  {label}
                  <input
                    value={form[field] as string}
                    placeholder={placeholder}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Visibility</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-[0.12em]">
                Product status
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as FormData["status"])
                  }
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
              {[
                ["featured", "Featured product"],
                ["is_new_arrival", "New arrival"],
                ["is_best_seller", "Best seller"],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={
                      form[
                        field as "featured" | "is_new_arrival" | "is_best_seller"
                      ]
                    }
                    onChange={(event) =>
                      updateField(
                        field as "featured" | "is_new_arrival" | "is_best_seller",
                        event.target.checked
                      )
                    }
                    className="size-4 accent-[#4A0F22]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {error && (
            <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
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
              disabled={isSaving}
              className="flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save size={17} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}