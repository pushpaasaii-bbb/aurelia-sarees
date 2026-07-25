"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  product_title: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  courier_partner: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  shipping_address: {
    full_name?: string;
    house_flat?: string;
    street_locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function CustomerOrderDetailsPage() {
  const params = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/account/orders/${params.orderNumber}`);
        return;
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", params.orderNumber)
        .eq("user_id", user.id)
        .single();

      if (!orderData) {
        router.replace("/account/orders");
        return;
      }

      const { data: itemData } = await supabase
        .from("order_items")
        .select("id, product_title, product_image_url, quantity, unit_price")
        .eq("order_id", orderData.id);

      setOrder(orderData as Order);
      setItems((itemData as OrderItem[] | null) ?? []);
      setIsLoading(false);
    }

    loadOrder();
  }, [params.orderNumber, router]);

  if (isLoading || !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const address = order.shipping_address ?? {};

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/account/orders"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> My Orders
          </Link>

          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Order {order.order_number}
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          Order Details
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Placed on{" "}
          {new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
          }).format(new Date(order.created_at))}
        </p>

        <section className="mt-8 border border-[#E6DACA] bg-[#FFFDF9] p-6">
          <div className="flex items-start gap-4">
            <PackageCheck size={26} className="mt-1 text-[#B68A42]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                Current Status
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#4A0F22]">
                {formatStatus(order.status)}
              </h2>
              <p className="mt-2 text-sm text-[#6E1834]/70">
                Payment: {formatStatus(order.payment_status)}
              </p>
            </div>
          </div>
        </section>

        {order.tracking_id && (
          <section className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <div className="flex items-start gap-4">
              <Truck size={26} className="mt-1 text-[#B68A42]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                  Delivery Tracking
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#4A0F22]">
                  {order.courier_partner ?? "Courier Partner"}
                </h2>
                <p className="mt-2 text-sm text-[#6E1834]/75">
                  Tracking ID:{" "}
                  <strong className="text-[#4A0F22]">{order.tracking_id}</strong>
                </p>

                {order.estimated_delivery_date && (
                  <p className="mt-2 text-sm text-[#6E1834]/75">
                    Estimated delivery:{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(order.estimated_delivery_date))}
                  </p>
                )}

                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] underline underline-offset-4"
                  >
                    Track Shipment <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {order.status === "delivered" && (
          <Link
            href={`/account/orders/${order.order_number}/return`}
            className="mt-5 flex min-h-12 items-center justify-center border border-[#4A0F22] bg-[#FFFDF9] px-6 text-xs font-bold uppercase tracking-[0.13em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
          >
            Request Return or Exchange
          </Link>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Your Sarees
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-[#E6DACA] pb-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.product_image_url ? (
                      <span
                        className="size-14 shrink-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${item.product_image_url}")`,
                        }}
                      />
                    ) : (
                      <span className="grid size-14 shrink-0 place-items-center bg-[#EDE3D5] font-serif text-xs text-[#6E1834]">
                        A
                      </span>
                    )}

                    <div>
                      <p className="font-medium text-[#4A0F22]">
                        {item.product_title}
                      </p>
                      <p className="mt-1 text-sm text-[#6E1834]/70">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-[#4A0F22]">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between border-t border-[#E6DACA] pt-5 font-serif text-3xl text-[#4A0F22]">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <div className="flex items-start gap-3">
              <MapPin size={22} className="mt-1 text-[#B68A42]" />
              <div>
                <h2 className="font-serif text-3xl text-[#4A0F22]">
                  Delivery Address
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#6E1834]/80">
                  <strong className="font-semibold text-[#4A0F22]">
                    {address.full_name}
                  </strong>
                  <br />
                  {address.house_flat}
                  {address.street_locality ? `, ${address.street_locality}` : ""}
                  <br />
                  {address.city}, {address.state} — {address.pincode}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}