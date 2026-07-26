"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Box,
  ClipboardList,
  LoaderCircle,
  PackageCheck,
  RotateCcw,
  Settings,
  ShoppingBag,
  Tags,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type DashboardStats = {
  products: number;
  orders: number;
  pendingOrders: number;
  returnRequests: number;
  customers: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    pendingOrders: 0,
    returnRequests: 0,
    customers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const [
        productsResult,
        ordersResult,
        pendingOrdersResult,
        returnsResult,
        customersResult,
      ] = await Promise.all([
        supabase.from("products").select("*", {
          count: "exact",
          head: true,
        }),
        supabase.from("orders").select("*", {
          count: "exact",
          head: true,
        }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", [
            "payment_confirmed",
            "order_confirmed",
            "processing",
          ]),
        supabase
          .from("return_requests")
          .select("*", { count: "exact", head: true })
          .in("status", [
            "return_requested",
            "return_under_review",
          ]),
        supabase.from("profiles").select("*", {
          count: "exact",
          head: true,
        }),
      ]);

      setStats({
        products: productsResult.count ?? 0,
        orders: ordersResult.count ?? 0,
        pendingOrders: pendingOrdersResult.count ?? 0,
        returnRequests: returnsResult.count ?? 0,
        customers: customersResult.count ?? 0,
      });

      setIsLoading(false);
    }

    loadAdminDashboard();
  }, [router]);

  const dashboardCards = [
    {
      label: "Products",
      value: stats.products,
      description: "Manage sarees and stock",
      href: "/admin/products",
      icon: Box,
      numeric: true,
    },
    {
      label: "Inventory",
      value: "Stock",
      description: "Monitor low-stock and out-of-stock sarees",
      href: "/admin/inventory",
      icon: Warehouse,
      numeric: false,
    },
    {
      label: "Orders",
      value: stats.orders,
      description: `${stats.pendingOrders} pending to process`,
      href: "/admin/orders",
      icon: PackageCheck,
      numeric: true,
    },
    {
      label: "Return Requests",
      value: stats.returnRequests,
      description: "Requests requiring review",
      href: "/admin/returns",
      icon: RotateCcw,
      numeric: true,
    },
    {
      label: "Customers",
      value: stats.customers,
      description: "Registered AURELIA customers",
      href: "/admin/customers",
      icon: UsersRound,
      numeric: true,
    },
    {
      label: "Coupons",
      value: "Offers",
      description: "Create and manage discount codes",
      href: "/admin/coupons",
      icon: Tags,
      numeric: false,
    },
  ];

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={28}
            className="animate-spin text-[#6E1834]"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E1834]/65">
            Loading dashboard
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#B68A42]/25 bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/admin"
            className="font-serif text-[1.35rem] tracking-[0.1em] sm:text-2xl"
          >
            AURELIA
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E9C98B] sm:block">
              Admin Panel
            </span>

            <Link
              href="/"
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:text-[#E9C98B] sm:text-xs"
            >
              View Store
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
        <section className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
            Store Control Centre
          </p>

          <h1 className="mt-3 font-serif text-[2.65rem] leading-[0.95] tracking-[-0.025em] text-[#4A0F22] sm:text-6xl">
            AURELIA Admin
          </h1>

          <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#6E1834]/70 sm:text-sm">
            Manage your catalogue, orders, customers, returns, and
            store details from one place.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.label}
                href={card.href}
                className="group relative overflow-hidden border border-[#E6DACA] bg-[#FFFDF9] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#B68A42] hover:shadow-[0_18px_45px_rgba(74,15,34,0.08)] sm:p-6"
              >
                <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#B68A42] transition duration-300 group-hover:scale-x-100" />

                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center bg-[#EDE3D5] text-[#4A0F22] sm:size-11">
                    <Icon size={20} strokeWidth={1.45} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-[#6E1834]/40 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4A0F22]"
                  />
                </div>

                <div className="mt-6">
                  <p
                    className={
                      card.numeric
                        ? "font-sans text-[2rem] font-medium leading-none tracking-[-0.04em] text-[#4A0F22] [font-variant-numeric:tabular-nums]"
                        : "font-serif text-[2rem] leading-none tracking-[-0.025em] text-[#4A0F22]"
                    }
                  >
                    {card.value}
                  </p>

                  <h2 className="mt-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#4A0F22]">
                    {card.label}
                  </h2>

                  <p className="mt-2 text-[12px] leading-5 text-[#6E1834]/65">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-9 grid gap-3 md:grid-cols-3 md:gap-4">
          <Link
            href="/admin/products/new"
            className="group flex min-h-36 flex-col justify-between bg-[#4A0F22] p-5 text-white transition duration-300 hover:bg-[#6E1834] hover:shadow-[0_18px_45px_rgba(74,15,34,0.16)] sm:p-6"
          >
            <ShoppingBag size={22} strokeWidth={1.45} />

            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <p className="font-serif text-[1.7rem] leading-none tracking-[-0.02em]">
                  Add a saree
                </p>
                <ArrowUpRight
                  size={17}
                  className="text-white/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                />
              </div>

              <p className="mt-2 text-[12px] leading-5 text-white/65">
                Add a new product and set its exact stock quantity.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group flex min-h-36 flex-col justify-between border border-[#E6DACA] bg-[#FFFDF9] p-5 text-[#4A0F22] transition duration-300 hover:border-[#B68A42] hover:shadow-[0_18px_45px_rgba(74,15,34,0.08)] sm:p-6"
          >
            <Tags size={22} strokeWidth={1.45} />

            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <p className="font-serif text-[1.7rem] leading-none tracking-[-0.02em]">
                  Collections
                </p>
                <ArrowUpRight
                  size={17}
                  className="text-[#6E1834]/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4A0F22]"
                />
              </div>

              <p className="mt-2 text-[12px] leading-5 text-[#6E1834]/65">
                Organise sarees into elegant collections.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group flex min-h-36 flex-col justify-between border border-[#E6DACA] bg-[#FFFDF9] p-5 text-[#4A0F22] transition duration-300 hover:border-[#B68A42] hover:shadow-[0_18px_45px_rgba(74,15,34,0.08)] sm:p-6"
          >
            <Settings size={22} strokeWidth={1.45} />

            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <p className="font-serif text-[1.7rem] leading-none tracking-[-0.02em]">
                  Store settings
                </p>
                <ArrowUpRight
                  size={17}
                  className="text-[#6E1834]/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#4A0F22]"
                />
              </div>

              <p className="mt-2 text-[12px] leading-5 text-[#6E1834]/65">
                Update business details, shipping, and policies.
              </p>
            </div>
          </Link>
        </section>

        <section className="mt-9 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center bg-[#EDE3D5] text-[#B68A42]">
              <ClipboardList size={20} strokeWidth={1.45} />
            </div>

            <div>
              <h2 className="font-serif text-[1.65rem] leading-none tracking-[-0.02em] text-[#4A0F22]">
                Order workflow
              </h2>

              <p className="mt-3 max-w-3xl text-[12px] leading-5 text-[#6E1834]/70 sm:text-sm sm:leading-6">
                When secure payment is integrated, confirmed orders
                will appear here for packing, courier tracking, and
                delivery updates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}