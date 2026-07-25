"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  LoaderCircle,
  PackagePlus,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number | null;
  status: "active" | "hidden" | "discontinued" | "sold_out";
  category: {
    name: string;
  } | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/products");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("id, title, slug, price, stock_quantity, low_stock_threshold, status, category:categories(name)")
        .order("created_at", { ascending: false });

      setProducts((data as Product[] | null) ?? []);
      setIsLoading(false);
    }

    loadProducts();
  }, [router]);

  const filteredProducts = products.filter((product) =>
    `${product.title} ${product.category?.name ?? ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.12em]">
            AURELIA
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <Link
          href="/admin"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Admin Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
              Catalogue Management
            </p>
            <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
              Products
            </h1>
            <p className="mt-2 text-sm text-[#6E1834]/70">
              Control saree details, pricing, visibility, and true stock.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#6E1834]"
          >
            <PackagePlus size={17} /> Add Product
          </Link>
        </div>

        <div className="relative mt-8 max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
          />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products"
            className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#6E1834]"
          />
        </div>

        <div className="mt-6 overflow-hidden border border-[#E6DACA] bg-[#FFFDF9]">
          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_100px_110px_90px] gap-4 border-b border-[#E6DACA] bg-[#EDE3D5] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#4A0F22] md:grid">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Action</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-serif text-3xl text-[#4A0F22]">No products found</p>
              <p className="mt-2 text-sm text-[#6E1834]/70">
                Add a saree or change your search.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isLowStock =
                product.stock_quantity > 0 &&
                product.stock_quantity <= (product.low_stock_threshold ?? 3);

              return (
                <article
                  key={product.id}
                  className="grid gap-3 border-b border-[#E6DACA] px-5 py-5 last:border-b-0 md:grid-cols-[minmax(220px,2fr)_1fr_100px_110px_90px] md:items-center md:gap-4"
                >
                  <div>
                    <p className="font-serif text-2xl leading-tight text-[#4A0F22]">
                      {product.title}
                    </p>
                    <p className="mt-1 text-xs text-[#6E1834]/60">
                      /{product.slug}
                    </p>
                  </div>

                  <p className="text-sm text-[#6E1834]/75">
                    {product.category?.name ?? "Uncategorised"}
                  </p>

                  <p className="text-sm font-semibold text-[#4A0F22]">
                    {formatPrice(product.price)}
                  </p>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        product.stock_quantity === 0
                          ? "text-red-700"
                          : isLowStock
                            ? "text-[#A5572E]"
                            : "text-emerald-700"
                      }`}
                    >
                      {product.stock_quantity} in stock
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6E1834]/60">
                      {product.status.replace("_", " ")}
                    </p>
                  </div>

                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex min-h-10 items-center justify-center gap-2 border border-[#DCCCB9] px-3 text-xs font-bold uppercase tracking-[0.1em] text-[#6E1834] transition hover:border-[#4A0F22]"
                  >
                    <Edit3 size={15} /> Edit
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}