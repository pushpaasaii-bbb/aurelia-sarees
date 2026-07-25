"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_visible: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/admin/categories");
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    setCategories(data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Enter a collection name.");
      return;
    }

    setIsAdding(true);

    const supabase = createClient();

    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: slugify(name),
      description: description.trim() || null,
      sort_order: categories.length + 1,
      is_visible: true,
    });

    setIsAdding(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setDescription("");
    loadCategories();
  }

  async function updateCategory(category: Category) {
    const supabase = createClient();

    await supabase
      .from("categories")
      .update({
        name: category.name,
        slug: slugify(category.slug),
        description: category.description || null,
        sort_order: Number(category.sort_order),
        is_visible: category.is_visible,
      })
      .eq("id", category.id);

    setMessage("Collection saved successfully.");
    loadCategories();
  }

  async function deleteCategory(categoryId: string) {
    const confirmed = window.confirm(
      "Delete this collection? Products will remain but become uncategorised."
    );

    if (!confirmed) return;

    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", categoryId);
    loadCategories();
  }

  function changeCategory(
    categoryId: string,
    key: keyof Category,
    value: string | number | boolean | null
  ) {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId ? { ...category, [key]: value } : category
      )
    );
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
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
          href="/admin"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Admin Dashboard
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">
          Collections
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Manage the saree collections customers can browse.
        </p>

        <form
          onSubmit={addCategory}
          className="mt-8 grid gap-4 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6"
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New collection name"
            className="h-12 border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short description (optional)"
            className="h-12 border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-70"
          >
            {isAdding ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />}
            Add Collection
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-[#6E1834]">{message}</p>}

        <section className="mt-6 space-y-4">
          {categories.map((category) => (
            <article key={category.id} className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_100px_auto] md:items-end">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                  Collection name
                  <input
                    value={category.name}
                    onChange={(event) =>
                      changeCategory(category.id, "name", event.target.value)
                    }
                    className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                  URL slug
                  <input
                    value={category.slug}
                    onChange={(event) =>
                      changeCategory(category.id, "slug", event.target.value)
                    }
                    className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                  Position
                  <input
                    type="number"
                    min="0"
                    value={category.sort_order}
                    onChange={(event) =>
                      changeCategory(category.id, "sort_order", Number(event.target.value))
                    }
                    className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeCategory(category.id, "is_visible", !category.is_visible)
                    }
                    className="grid min-h-11 min-w-11 place-items-center border border-[#DCCCB9] text-[#6E1834]"
                    aria-label="Toggle collection visibility"
                  >
                    {category.is_visible ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateCategory(category)}
                    className="flex min-h-11 items-center gap-2 bg-[#4A0F22] px-4 text-xs font-bold uppercase tracking-[0.1em] text-white"
                  >
                    <Save size={15} /> Save
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCategory(category.id)}
                    className="grid min-h-11 min-w-11 place-items-center border border-red-200 text-red-700"
                    aria-label="Delete collection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}