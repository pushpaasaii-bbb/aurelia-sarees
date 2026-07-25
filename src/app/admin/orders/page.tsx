"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, PackageCheck, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/orders");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, total_amount, created_at, profile:profiles(full_name, phone)"
        )
        .order("created_at", { ascending: false });

      setOrders((data as Order[] | null) ?? []);
      setIsLoading(false);
    }

    loadOrders();
  }, [router]);

  const filteredOrders = orders.filter((order) =>
    `${order.order_number} ${order.profile?.full_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.12em]">
            AURELIA
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          href="/admin"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Admin Dashboard
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">Orders</h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Paid customer orders, payment status, and delivery workflow.
        </p>

        <div className="relative mt-8 max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number or customer"
            className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#6E1834]"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <section className="mt-7 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <PackageCheck size={34} strokeWidth={1.3} className="mx-auto text-[#B68A42]" />
            <h2 className="mt-5 font-serif text-3xl text-[#4A0F22]">
              No orders yet
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
              Confirmed Razorpay payments will create orders here automatically.
            </p>
          </section>
        ) : (
          <section className="mt-7 overflow-hidden border border-[#E6DACA] bg-[#FFFDF9]">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-3 border-b border-[#E6DACA] px-5 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_130px_130px] md:items-center"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                    {order.order_number}
                  </p>
                  <p className="mt-2 text-sm text-[#6E1834]/70">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(order.created_at))}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-[#4A0F22]">
                    {order.profile?.full_name ?? "Customer"}
                  </p>
                  <p className="mt-1 text-sm text-[#6E1834]/70">
                    {order.profile?.phone ?? ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-[#4A0F22]">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                    {formatStatus(order.payment_status)}
                  </p>
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6E1834]">
                  {formatStatus(order.status)}
                </p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}