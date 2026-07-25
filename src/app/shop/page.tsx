"use client";

import Link from "next/link";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  fabric: string | null;
  colour: string | null;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  category: {
    name: string;
    slug: string;
  } | null;
  product_images: ProductImage[] | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      const supabase = createClient();

      const [{ data: productsData }, { data: categoriesData }] =
        await Promise.all([
          supabase
            .from("products")
            .select(
              `
                id,
                title,
                slug,
                price,
                original_price,
                stock_quantity,
                low_stock_threshold,
                fabric,
                colour,
                is_new_arrival,
                is_best_seller,
                category:categories(name, slug),
                product_images(image_url, alt_text, sort_order)
              `
            )
            .eq("status", "active")
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("id, name, slug")
            .order("sort_order", { ascending: true }),
        ]);

      setProducts((productsData as Product[] | null) ?? []);
      setCategories(categoriesData ?? []);
      setIsLoading(false);
    }

    loadShopData();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.fabric?.toLowerCase().includes(normalizedSearch) ||
        product.colour?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.slug === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((firstProduct, secondProduct) => {
      if (sortBy === "price-low") return firstProduct.price - secondProduct.price;
      if (sortBy === "price-high") return secondProduct.price - firstProduct.price;
      if (sortBy === "best-selling") {
        return Number(secondProduct.is_best_seller) - Number(firstProduct.is_best_seller);
      }

      return Number(secondProduct.is_new_arrival) - Number(firstProduct.is_new_arrival);
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="Go to AURELIA home"
            className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>

          <div className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] md:flex">
            <Link href="/">Home</Link>
            <span className="text-[#B68A42]">Shop</span>
            <a href="#shop-products">Collections</a>
          </div>

          <Link
            href="/"
            className="flex size-11 items-center justify-center text-[#4A0F22] md:hidden"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} strokeWidth={1.7} />
          </Link>
        </div>
      </header>

      <section className="border-b border-[#E6DACA] bg-[#EDE3D5] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
            Curated for every celebration
          </p>
          <h1 className="mt-3 font-serif text-5xl text-[#4A0F22] sm:text-6xl">
            The Saree Collection
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6E1834]/80">
            Discover timeless drapes, selected for their craft, comfort, and
            unforgettable presence.
          </p>
        </div>
      </section>

      <section id="shop-products" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-b border-[#E6DACA] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, fabric or colour"
              className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#6E1834]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#6E1834]/70">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "saree" : "sarees"}
            </p>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="flex min-h-11 items-center gap-2 border border-[#4A0F22] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[#4A0F22] lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4A0F22]">
              Filter by Collection
            </p>

            <div className="mt-4 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`py-2 text-left text-sm transition ${
                  selectedCategory === "all"
                    ? "font-bold text-[#4A0F22]"
                    : "text-[#6E1834]/70 hover:text-[#4A0F22]"
                }`}
              >
                All Sarees
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`py-2 text-left text-sm transition ${
                    selectedCategory === category.slug
                      ? "font-bold text-[#4A0F22]"
                      : "text-[#6E1834]/70 hover:text-[#4A0F22]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-8 border-t border-[#E6DACA] pt-6">
              <label
                htmlFor="desktop-sort"
                className="text-xs font-bold uppercase tracking-[0.16em] text-[#4A0F22]"
              >
                Sort by
              </label>
              <select
                id="desktop-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="mt-3 h-11 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-selling">Best Selling</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] underline underline-offset-4"
            >
              Clear all filters
            </button>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#EDE3D5]" />
                    <div className="mt-4 h-4 w-3/4 bg-[#EDE3D5]" />
                    <div className="mt-2 h-4 w-1/2 bg-[#EDE3D5]" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
                <p className="font-serif text-3xl text-[#4A0F22]">
                  No sarees found
                </p>
                <p className="mt-3 text-sm text-[#6E1834]/70">
                  Try clearing filters or searching for something different.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-6">
                {filteredProducts.map((product) => {
                  const image = [...(product.product_images ?? [])].sort(
                    (firstImage, secondImage) =>
                      firstImage.sort_order - secondImage.sort_order
                  )[0];

                  const isLowStock =
                    product.stock_quantity > 0 &&
                    product.stock_quantity <= (product.low_stock_threshold ?? 3);

                  const discount =
                    product.original_price && product.original_price > product.price
                      ? Math.round(
                          ((product.original_price - product.price) /
                            product.original_price) *
                            100
                        )
                      : null;

                  return (
                    <article key={product.id} className="group min-w-0">
                      <Link
                        href={`/product/${product.slug}`}
                        className="relative block aspect-[3/4] overflow-hidden bg-[#EDE3D5]"
                      >
                        {image ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition duration-700 lg:group-hover:scale-105"
                            style={{
                              backgroundImage: `url("${image.image_url}")`,
                            }}
                            aria-label={image.alt_text ?? product.title}
                            role="img"
                          />
                        ) : (
                          <div className="grid h-full place-items-center px-4 text-center font-serif text-xl text-[#6E1834]/60">
                            AURELIA
                          </div>
                        )}

                        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                          {product.is_new_arrival && (
                            <span className="bg-[#4A0F22] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                              New
                            </span>
                          )}
                          {product.is_best_seller && (
                            <span className="bg-[#B68A42] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                              Best Seller
                            </span>
                          )}
                          {isLowStock && (
                            <span className="bg-[#FFFDF9] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#6E1834]">
                              Only {product.stock_quantity} left
                            </span>
                          )}
                        </div>

                       <div className="absolute right-2 top-2">
  <WishlistButton
    productId={product.id}
    productTitle={product.title}
    compact
  />
</div>

                        {product.stock_quantity === 0 && (
                          <div className="absolute inset-0 grid place-items-center bg-[#1F1B1B]/55">
                            <span className="border border-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="pt-4">
                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                          {product.category?.name ?? product.fabric ?? "AURELIA"}
                        </p>
                        <Link
                          href={`/product/${product.slug}`}
                          className="mt-1 block font-serif text-xl leading-tight text-[#4A0F22] sm:text-2xl"
                        >
                          {product.title}
                        </Link>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[#4A0F22]">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-[#6E1834]/50 line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                          {discount && (
                            <span className="text-[10px] font-bold text-emerald-700">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 lg:hidden">
          <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-3xl bg-[#FAF7F2] p-6">
            <div className="flex items-center justify-between">
              <p className="font-serif text-3xl text-[#4A0F22]">Filters</p>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                aria-label="Close filters"
                className="grid size-11 place-items-center"
              >
                <X size={22} />
              </button>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#4A0F22]">
              Collection
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`min-h-11 border px-3 text-left text-sm ${
                  selectedCategory === "all"
                    ? "border-[#4A0F22] bg-[#4A0F22] text-white"
                    : "border-[#DCCCB9] bg-white text-[#6E1834]"
                }`}
              >
                All Sarees
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`min-h-11 border px-3 text-left text-sm ${
                    selectedCategory === category.slug
                      ? "border-[#4A0F22] bg-[#4A0F22] text-white"
                      : "border-[#DCCCB9] bg-white text-[#6E1834]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <label
              htmlFor="mobile-sort"
              className="mt-7 block text-xs font-bold uppercase tracking-[0.16em] text-[#4A0F22]"
            >
              Sort by
            </label>
            <select
              id="mobile-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-3 h-12 w-full border border-[#DCCCB9] bg-white px-3 text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-selling">Best Selling</option>
            </select>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="mt-7 min-h-12 w-full bg-[#4A0F22] text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              Show {filteredProducts.length} Sarees
            </button>
          </div>
        </div>
      )}
    </main>
  );
}