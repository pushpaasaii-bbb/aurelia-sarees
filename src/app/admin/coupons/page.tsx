"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  Search,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminCouponsPage() {
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoupons() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/coupons");
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

      const { data, error: couponsError } = await supabase
        .from("coupons")
        .select(
          "id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, usage_count, starts_at, expires_at, is_active, created_at"
        )
        .order("created_at", { ascending: false });

      if (couponsError) {
        setError(couponsError.message);
      } else {
        setCoupons((data ?? []) as Coupon[]);
      }

      setLoading(false);
    }

    loadCoupons();
  }, [router]);

  const filteredCoupons = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      return (
        coupon.code.toLowerCase().includes(searchTerm) ||
        coupon.description?.toLowerCase().includes(searchTerm)
      );
    });
  }, [coupons, search]);

  function getDiscountLabel(coupon: Coupon) {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% OFF`;
    }

    return `${formatMoney(coupon.discount_value)} OFF`;
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
            You do not have permission to manage AURELIA coupons.
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} />
            Back to admin
          </Link>

          <Link
            href="/admin/coupons/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#6E1834]"
          >
            <Plus size={17} />
            Create coupon
          </Link>
        </div>

        <section className="mt-7 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            AURELIA Admin
          </p>

          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-[#4A0F22]">
            <Tag size={30} strokeWidth={1.4} />
            Discount Coupons
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            Create and manage promotional coupon codes for your customers.
          </p>

          <div className="relative mt-8 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coupon code"
              className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#6E1834]"
            />
          </div>

          {error && (
            <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-7 overflow-x-auto border border-[#E6DACA]">
            <table className="min-w-[980px] w-full text-left">
              <thead className="bg-[#F3E7D8]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]">
                  <th className="px-5 py-4">Coupon</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">Minimum order</th>
                  <th className="px-5 py-4">Usage</th>
                  <th className="px-5 py-4">Expiry</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6DACA] bg-white">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="text-sm text-[#4A0F22]">
                    <td className="px-5 py-5">
                      <p className="font-bold uppercase tracking-[0.1em]">
                        {coupon.code}
                      </p>

                      {coupon.description && (
                        <p className="mt-1 max-w-xs text-xs text-[#6E1834]/65">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-5 font-medium">
                      {getDiscountLabel(coupon)}

                      {coupon.maximum_discount_amount && (
                        <p className="mt-1 text-xs font-normal text-[#6E1834]/65">
                          Max {formatMoney(coupon.maximum_discount_amount)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-5">
                      {formatMoney(coupon.minimum_order_amount)}
                    </td>

                    <td className="px-5 py-5">
                      {coupon.usage_count}
                      {coupon.usage_limit
                        ? ` / ${coupon.usage_limit}`
                        : " / Unlimited"}
                    </td>

                    <td className="px-5 py-5 text-[#6E1834]/75">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "No expiry"}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                          coupon.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="inline-flex border border-[#DCCCB9] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6E1834] transition hover:border-[#4A0F22] hover:text-[#4A0F22]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}

                {!error && filteredCoupons.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center text-sm text-[#6E1834]/70"
                    >
                      No coupons yet. Click Create coupon to add your first
                      offer.
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