"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const formatStatus = (status: string) =>
  status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/account/orders");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total_amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setIsLoading(false);
    }

    loadOrders();
  }, [router]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/account"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> Account
          </Link>
          <Link href="/" className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]">
            AURELIA
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          My Account
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">My Orders</h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Track every AURELIA order, delivery update, and return request.
        </p>

        {orders.length === 0 ? (
          <section className="mt-9 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <Package size={34} strokeWidth={1.3} className="mx-auto text-[#B68A42]" />
            <h2 className="mt-5 font-serif text-3xl text-[#4A0F22]">
              No orders yet
            </h2>
            <p className="mt-3 text-sm text-[#6E1834]/70">
              When you place an order, every update will appear here.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              <ShoppingBag size={16} /> Shop Sarees
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className="block border border-[#E6DACA] bg-[#FFFDF9] p-5 transition hover:border-[#B68A42]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                      Order {order.order_number}
                    </p>
                    <p className="mt-2 text-sm text-[#6E1834]/70">
                      Placed on{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                      }).format(new Date(order.created_at))}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-serif text-3xl text-[#4A0F22]">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
                      {formatStatus(order.status)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}