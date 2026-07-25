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
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["payment_confirmed", "order_confirmed", "processing"]),
        supabase
          .from("return_requests")
          .select("*", { count: "exact", head: true })
          .in("status", ["return_requested", "return_under_review"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
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
    },
    {
  label: "Inventory",
  value: "Stock",
  description: "Monitor low-stock and out-of-stock sarees",
  href: "/admin/inventory",
  icon: Box,
},
    {
      label: "Orders",
      value: stats.orders,
      description: `${stats.pendingOrders} pending to process`,
      href: "/admin/orders",
      icon: PackageCheck,
    },
    {
      label: "Return Requests",
      value: stats.returnRequests,
      description: "Requests requiring review",
      href: "/admin/returns",
      icon: RotateCcw,
    },
    {
      label: "Customers",
      value: stats.customers,
      description: "Registered AURELIA customers",
      href: "/admin/customers",
      icon: UsersRound,
    },
    {
  label: "Coupons",
  value: "Offers",
  description: "Create and manage discount codes",
  href: "/admin/coupons",
  icon: Tags,
},
  ];

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

          <div className="flex items-center gap-4">
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B] sm:block">
              Admin Panel
            </span>
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-[0.12em] text-white/85"
            >
              View Store
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Store Control Centre
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          AURELIA Admin
        </h1>
        <p className="mt-3 text-sm text-[#6E1834]/75">
          Manage the catalogue, orders, customers, returns, and store details.
        </p>

        <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.label}
                href={card.href}
                className="group border border-[#E6DACA] bg-[#FFFDF9] p-5 transition hover:-translate-y-1 hover:border-[#B68A42]"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center bg-[#EDE3D5] text-[#4A0F22]">
                    <Icon size={21} strokeWidth={1.5} />
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[#6E1834]/50 transition group-hover:text-[#4A0F22]"
                  />
                </div>

                <p className="mt-7 font-serif text-4xl text-[#4A0F22]">
                  {card.value}
                </p>
                <h2 className="mt-2 text-xs font-bold uppercase tracking-[0.13em] text-[#4A0F22]">
                  {card.label}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[#6E1834]/65">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/products/new"
            className="flex min-h-32 flex-col justify-between bg-[#4A0F22] p-6 text-white transition hover:bg-[#6E1834]"
          >
            <ShoppingBag size={24} strokeWidth={1.5} />
            <div>
              <p className="font-serif text-2xl">Add a saree</p>
              <p className="mt-1 text-xs text-white/70">
                Add a new product and set its exact stock quantity.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex min-h-32 flex-col justify-between border border-[#E6DACA] bg-[#FFFDF9] p-6 text-[#4A0F22] transition hover:border-[#B68A42]"
          >
            <Tags size={24} strokeWidth={1.5} />
            <div>
              <p className="font-serif text-2xl">Collections</p>
              <p className="mt-1 text-xs text-[#6E1834]/65">
                Organise sarees into elegant collections.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="flex min-h-32 flex-col justify-between border border-[#E6DACA] bg-[#FFFDF9] p-6 text-[#4A0F22] transition hover:border-[#B68A42]"
          >
            <Settings size={24} strokeWidth={1.5} />
            <div>
              <p className="font-serif text-2xl">Store settings</p>
              <p className="mt-1 text-xs text-[#6E1834]/65">
                Update business details, shipping and policies.
              </p>
            </div>
          </Link>
        </section>

        <section className="mt-10 border border-[#E6DACA] bg-[#FFFDF9] p-6">
          <div className="flex items-center gap-3">
            <ClipboardList size={21} className="text-[#B68A42]" />
            <div>
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Order workflow
              </h2>
              <p className="mt-1 text-sm text-[#6E1834]/70">
                When payment is integrated, all confirmed orders will appear here
                for packing, courier tracking, and delivery updates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}