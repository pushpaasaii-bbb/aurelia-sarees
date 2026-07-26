"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumImageSize = 5 * 1024 * 1024;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function getManagedCoverPath(imageUrl: string | null) {
  if (!imageUrl) return null;

  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  const encodedPath = imageUrl
    .slice(markerIndex + marker.length)
    .split("?")[0];

  try {
    const storagePath = decodeURIComponent(encodedPath);
    return storagePath.startsWith("category-covers/") ? storagePath : null;
  } catch {
    return null;
  }
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [busyCategoryId, setBusyCategoryId] = useState<string | null>(null);
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

    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, slug, description, image_url, sort_order, is_visible"
      )
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setCategories((data as Category[] | null) ?? []);
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
      image_url: null,
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
    setMessage("Collection added. You can now upload its cover image.");
    await loadCategories();
  }

  async function updateCategory(category: Category) {
    setBusyCategoryId(category.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .update({
        name: category.name.trim(),
        slug: slugify(category.slug),
        description: category.description?.trim() || null,
        image_url: category.image_url || null,
        sort_order: Number(category.sort_order),
        is_visible: category.is_visible,
      })
      .eq("id", category.id);

    setBusyCategoryId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Collection saved successfully.");
    await loadCategories();
  }

  async function uploadCategoryImage(
    category: Category,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setMessage("");

    if (!allowedImageTypes.includes(file.type)) {
      setMessage("Use a JPG, PNG, or WEBP collection image.");
      return;
    }

    if (file.size > maximumImageSize) {
      setMessage("Collection images must be smaller than 5 MB.");
      return;
    }

    setBusyCategoryId(category.id);

    const supabase = createClient();
    const extension = getFileExtension(file);
    const storagePath = `category-covers/${category.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setBusyCategoryId(null);
      setMessage(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(storagePath);

    const { error: updateError } = await supabase
      .from("categories")
      .update({ image_url: publicUrl })
      .eq("id", category.id);

    if (updateError) {
      await supabase.storage.from("product-images").remove([storagePath]);
      setBusyCategoryId(null);
      setMessage(updateError.message);
      return;
    }

    const previousManagedPath = getManagedCoverPath(category.image_url);

    if (previousManagedPath && previousManagedPath !== storagePath) {
      await supabase.storage
        .from("product-images")
        .remove([previousManagedPath]);
    }

    setBusyCategoryId(null);
    setMessage("Collection cover uploaded successfully.");
    await loadCategories();
  }

  async function removeCategoryImage(category: Category) {
    const confirmed = window.confirm(
      "Remove this collection cover image? The collection will use the fallback design."
    );

    if (!confirmed) return;

    setBusyCategoryId(category.id);
    setMessage("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("categories")
      .update({ image_url: null })
      .eq("id", category.id);

    if (updateError) {
      setBusyCategoryId(null);
      setMessage(updateError.message);
      return;
    }

    const managedPath = getManagedCoverPath(category.image_url);

    if (managedPath) {
      const { error: removeError } = await supabase.storage
        .from("product-images")
        .remove([managedPath]);

      if (removeError) {
        setBusyCategoryId(null);
        setMessage(
          "The cover was removed from the collection, but its old storage file could not be cleaned up."
        );
        await loadCategories();
        return;
      }
    }

    setBusyCategoryId(null);
    setMessage("Collection cover removed.");
    await loadCategories();
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      "Delete this collection? Products will remain but become uncategorised."
    );

    if (!confirmed) return;

    setBusyCategoryId(category.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setBusyCategoryId(null);
      setMessage(error.message);
      return;
    }

    const managedPath = getManagedCoverPath(category.image_url);

    if (managedPath) {
      await supabase.storage.from("product-images").remove([managedPath]);
    }

    setBusyCategoryId(null);
    setMessage("Collection deleted.");
    await loadCategories();
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
          Manage collection details, visibility, position, and premium cover
          images.
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
            {isAdding ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Plus size={17} />
            )}
            Add Collection
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-[#6E1834]">{message}</p>}

        <section className="mt-6 space-y-4">
          {categories.map((category) => {
            const isBusy = busyCategoryId === category.id;

            return (
              <article
                key={category.id}
                className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6"
              >
                <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                      Cover image
                    </p>

                    <div className="mt-2 overflow-hidden border border-[#DCCCB9] bg-[#F3EBE1]">
                      {category.image_url ? (
                        <span
                          role="img"
                          aria-label={`${category.name} collection cover`}
                          className="block aspect-[4/5] bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(to top, rgba(74, 15, 34, 0.2), transparent 45%), url("${category.image_url}")`,
                          }}
                        />
                      ) : (
                        <span className="grid aspect-[4/5] place-items-center text-[#B68A42]">
                          <ImageIcon size={30} strokeWidth={1.3} />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2">
                      <label
                        htmlFor={`category-cover-${category.id}`}
                        className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 bg-[#4A0F22] px-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-white ${
                          isBusy ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        {isBusy ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Upload size={15} />
                        )}
                        {category.image_url ? "Replace image" : "Upload image"}
                      </label>

                      <input
                        id={`category-cover-${category.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isBusy}
                        onChange={(event) =>
                          uploadCategoryImage(category, event)
                        }
                        className="sr-only"
                      />

                      {category.image_url && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => removeCategoryImage(category)}
                          className="flex min-h-11 items-center justify-center gap-2 border border-red-200 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-red-700 disabled:opacity-60"
                        >
                          <X size={15} /> Remove image
                        </button>
                      )}
                    </div>

                    <p className="mt-3 text-[10px] leading-4 text-[#6E1834]/55">
                      Portrait 4:5 recommended. JPG, PNG, or WEBP. Maximum 5 MB.
                    </p>
                  </div>

                  <div className="grid content-start gap-4">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_100px]">
                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                        Collection name
                        <input
                          value={category.name}
                          onChange={(event) =>
                            changeCategory(
                              category.id,
                              "name",
                              event.target.value
                            )
                          }
                          className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none focus:border-[#6E1834]"
                        />
                      </label>

                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                        URL slug
                        <input
                          value={category.slug}
                          onChange={(event) =>
                            changeCategory(
                              category.id,
                              "slug",
                              event.target.value
                            )
                          }
                          className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none focus:border-[#6E1834]"
                        />
                      </label>

                      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                        Position
                        <input
                          type="number"
                          min="0"
                          value={category.sort_order}
                          onChange={(event) =>
                            changeCategory(
                              category.id,
                              "sort_order",
                              Number(event.target.value)
                            )
                          }
                          className="mt-2 block h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none focus:border-[#6E1834]"
                        />
                      </label>
                    </div>

                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                      Short description
                      <textarea
                        value={category.description ?? ""}
                        onChange={(event) =>
                          changeCategory(
                            category.id,
                            "description",
                            event.target.value
                          )
                        }
                        rows={3}
                        className="mt-2 block w-full border border-[#DCCCB9] bg-white p-3 text-sm outline-none focus:border-[#6E1834]"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          changeCategory(
                            category.id,
                            "is_visible",
                            !category.is_visible
                          )
                        }
                        className="flex min-h-11 items-center gap-2 border border-[#DCCCB9] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[#6E1834] disabled:opacity-60"
                      >
                        {category.is_visible ? (
                          <>
                            <Eye size={17} /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff size={17} /> Hidden
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateCategory(category)}
                        className="flex min-h-11 items-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
                      >
                        {isBusy ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Save size={15} />
                        )}
                        Save
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => deleteCategory(category)}
                        className="flex min-h-11 items-center gap-2 border border-red-200 px-4 text-xs font-bold uppercase tracking-[0.1em] text-red-700 disabled:opacity-60"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}