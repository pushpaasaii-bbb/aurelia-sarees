"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  LoaderCircle,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type InventoryProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminInventoryPage() {
  const router = useRouter();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out" | "healthy">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInventory() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/inventory");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin"
      );

      if (adminError || !isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const { data, error: productsError } = await supabase
        .from("products")
        .select(
          "id, title, slug, price, stock_quantity, low_stock_threshold, is_active"
        )
        .order("stock_quantity", { ascending: true });

      if (productsError) {
        setError(productsError.message);
      } else {
        setProducts((data ?? []) as InventoryProduct[]);
      }

      setLoading(false);
    }

    loadInventory();
  }, [router]);

  const stats = useMemo(() => {
    const outOfStock = products.filter(
      (product) => product.stock_quantity <= 0
    ).length;

    const lowStock = products.filter(
      (product) =>
        product.stock_quantity > 0 &&
        product.stock_quantity <= product.low_stock_threshold
    ).length;

    const healthy = products.filter(
      (product) => product.stock_quantity > product.low_stock_threshold
    ).length;

    return {
      total: products.length,
      outOfStock,
      lowStock,
      healthy,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.title.toLowerCase().includes(searchTerm) ||
        product.slug.toLowerCase().includes(searchTerm);

      const matchesFilter =
        filter === "all" ||
        (filter === "out" && product.stock_quantity <= 0) ||
        (filter === "low" &&
          product.stock_quantity > 0 &&
          product.stock_quantity <= product.low_stock_threshold) ||
        (filter === "healthy" &&
          product.stock_quantity > product.low_stock_threshold);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  function getStockStatus(product: InventoryProduct) {
    if (product.stock_quantity <= 0) {
      return {
        label: "Out of stock",
        className: "bg-red-50 text-red-700",
      };
    }

    if (product.stock_quantity <= product.low_stock_threshold) {
      return {
        label: "Low stock",
        className: "bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Healthy",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5">
        <section className="w-full max-w-md border border-[#E6DACA] bg-[#FFFDF9] p-8 text-center">
          <ShieldAlert className="mx-auto text-[#6E1834]" size={34} />
          <h1 className="mt-4 font-serif text-3xl text-[#4A0F22]">
            Admin access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            You do not have permission to view AURELIA inventory.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex bg-[#4A0F22] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            Return to store
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 text-[#1F1B1B] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to admin
        </Link>

        <section className="mt-7 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            AURELIA Admin
          </p>

          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-[#4A0F22]">
            <Boxes size={31} strokeWidth={1.4} />
            Inventory
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            Monitor stock quantities and quickly identify sarees that need
            restocking.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`border p-5 text-left transition ${
                filter === "all"
                  ? "border-[#4A0F22] bg-[#F3E7D8]"
                  : "border-[#E6DACA] bg-white"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]/70">
                All products
              </p>
              <p className="mt-2 font-serif text-4xl text-[#4A0F22]">
                {stats.total}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFilter("healthy")}
              className={`border p-5 text-left transition ${
                filter === "healthy"
                  ? "border-emerald-700 bg-emerald-50"
                  : "border-[#E6DACA] bg-white"
              }`}
            >
              <CheckCircle2 size={20} className="text-emerald-700" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]/70">
                Healthy stock
              </p>
              <p className="mt-2 font-serif text-4xl text-[#4A0F22]">
                {stats.healthy}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFilter("low")}
              className={`border p-5 text-left transition ${
                filter === "low"
                  ? "border-amber-600 bg-amber-50"
                  : "border-[#E6DACA] bg-white"
              }`}
            >
              <AlertTriangle size={20} className="text-amber-700" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]/70">
                Low stock
              </p>
              <p className="mt-2 font-serif text-4xl text-[#4A0F22]">
                {stats.lowStock}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFilter("out")}
              className={`border p-5 text-left transition ${
                filter === "out"
                  ? "border-red-600 bg-red-50"
                  : "border-[#E6DACA] bg-white"
              }`}
            >
              <XCircle size={20} className="text-red-700" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]/70">
                Out of stock
              </p>
              <p className="mt-2 font-serif text-4xl text-[#4A0F22]">
                {stats.outOfStock}
              </p>
            </button>
          </div>

          <div className="relative mt-8 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search saree name"
              className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#6E1834]"
            />
          </div>

          {error && (
            <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-7 overflow-x-auto border border-[#E6DACA]">
            <table className="min-w-[850px] w-full text-left">
              <thead className="bg-[#F3E7D8]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Available stock</th>
                  <th className="px-5 py-4">Low-stock alert at</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6DACA] bg-white">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr key={product.id} className="text-sm text-[#4A0F22]">
                      <td className="px-5 py-5">
                        <p className="font-medium">{product.title}</p>
                        <p className="mt-1 text-xs text-[#6E1834]/65">
                          /{product.slug}
                        </p>
                      </td>

                      <td className="px-5 py-5">{formatMoney(product.price)}</td>

                      <td className="px-5 py-5 font-semibold">
                        {product.stock_quantity}
                      </td>

                      <td className="px-5 py-5">
                        {product.low_stock_threshold}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex border border-[#DCCCB9] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6E1834] transition hover:border-[#4A0F22] hover:text-[#4A0F22]"
                        >
                          Update stock
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {!error && filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center text-sm text-[#6E1834]/70"
                    >
                      No products match this inventory filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}