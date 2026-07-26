"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Package,
  PackageCheck,
  RotateCcw,
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

type OrderHistory = {
  id: string;
  status: string;
  created_at: string;
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
    phone?: string;
    house_flat?: string;
    street_locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
};

const trackingSteps = [
  {
    label: "Order Confirmed",
    statuses: ["payment_confirmed", "order_confirmed"],
  },
  {
    label: "Processing",
    statuses: ["processing"],
  },
  {
    label: "Packed",
    statuses: ["packed"],
  },
  {
    label: "Shipped",
    statuses: ["shipped"],
  },
  {
    label: "Out for Delivery",
    statuses: ["out_for_delivery"],
  },
  {
    label: "Delivered",
    statuses: ["delivered", "returned", "refunded"],
  },
];

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function getCurrentStepIndex(status: string) {
  if (status === "payment_pending" || status === "cancelled") {
    return -1;
  }

  return trackingSteps.findIndex((step) =>
    step.statuses.includes(status)
  );
}

export default function CustomerOrderDetailsPage() {
  const params = useParams<{ orderNumber: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(
          `/login?next=/account/orders/${params.orderNumber}`
        );
        return;
      }

      const { data: orderData, error: orderError } =
        await supabase
          .from("orders")
          .select("*")
          .eq("order_number", params.orderNumber)
          .eq("user_id", user.id)
          .single();

      if (orderError || !orderData) {
        router.replace("/account/orders");
        return;
      }

      const [itemsResult, historyResult] = await Promise.all([
        supabase
          .from("order_items")
          .select(
            "id, product_title, product_image_url, quantity, unit_price"
          )
          .eq("order_id", orderData.id),
        supabase
          .from("order_status_history")
          .select("id, status, created_at")
          .eq("order_id", orderData.id)
          .order("created_at", { ascending: true }),
      ]);

      setOrder(orderData as Order);
      setItems(
        (itemsResult.data as OrderItem[] | null) ?? []
      );
      setHistory(
        (historyResult.data as OrderHistory[] | null) ?? []
      );
      setIsLoading(false);
    }

    loadOrder();
  }, [params.orderNumber, router]);

  if (isLoading || !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle
          size={28}
          className="animate-spin text-[#6E1834]"
        />
      </main>
    );
  }

  const address = order.shipping_address ?? {};
  const currentStepIndex = getCurrentStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const isPaymentPending = order.status === "payment_pending";

  function getStepDate(statuses: string[]) {
    const matchingUpdates = history.filter((update) =>
      statuses.includes(update.status)
    );

    const latestUpdate =
      matchingUpdates[matchingUpdates.length - 1];

    return latestUpdate?.created_at ?? null;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/account/orders"
            className="flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834] sm:text-xs"
          >
            <ArrowLeft size={17} />
            My Orders
          </Link>

          <Link
            href="/"
            className="font-serif text-[1.35rem] tracking-[0.1em] text-[#4A0F22] sm:text-2xl"
          >
            AURELIA
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Order {order.order_number}
        </p>

        <h1 className="mt-2 font-serif text-[2.7rem] leading-none tracking-[-0.025em] text-[#4A0F22] sm:text-5xl">
          Order Details
        </h1>

        <p className="mt-3 text-sm text-[#6E1834]/70">
          Placed on {formatDate(order.created_at)}
        </p>

        <section className="mt-8 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center bg-[#EDE3D5]">
              <PackageCheck
                size={23}
                strokeWidth={1.5}
                className="text-[#B68A42]"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B68A42]">
                Current Status
              </p>

              <h2 className="mt-2 font-serif text-3xl leading-none text-[#4A0F22]">
                {formatStatus(order.status)}
              </h2>

              <p className="mt-3 text-sm text-[#6E1834]/70">
                Payment: {formatStatus(order.payment_status)}
              </p>
            </div>
          </div>
        </section>

        {isCancelled ? (
          <section className="mt-5 border border-red-200 bg-red-50 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-700">
              Order cancelled
            </p>
            <p className="mt-2 text-sm leading-6 text-red-700/80">
              This order has been cancelled. Contact AURELIA
              support if you need assistance.
            </p>
          </section>
        ) : isPaymentPending ? (
          <section className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B68A42]">
              Awaiting payment confirmation
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6E1834]/70">
              Tracking will begin only after payment is securely
              verified and the order is confirmed.
            </p>
          </section>
        ) : (
          <section className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Truck
                size={21}
                strokeWidth={1.5}
                className="text-[#B68A42]"
              />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B68A42]">
                  Live progress
                </p>
                <h2 className="mt-1 font-serif text-3xl leading-none text-[#4A0F22]">
                  Delivery Timeline
                </h2>
              </div>
            </div>

            <div className="mt-7">
              {trackingSteps.map((step, index) => {
                const isCompleted =
                  index <= currentStepIndex;
                const isCurrent =
                  index === currentStepIndex;
                const stepDate = getStepDate(step.statuses);
                const isLast =
                  index === trackingSteps.length - 1;

                return (
                  <div
                    key={step.label}
                    className="relative flex gap-4"
                  >
                    {!isLast && (
                      <span
                        className={`absolute left-[15px] top-8 h-full w-px ${
                          index < currentStepIndex
                            ? "bg-[#B68A42]"
                            : "bg-[#E6DACA]"
                        }`}
                      />
                    )}

                    <span
                      className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border ${
                        isCompleted
                          ? "border-[#4A0F22] bg-[#4A0F22] text-white"
                          : "border-[#DCCCB9] bg-[#FFFDF9] text-transparent"
                      }`}
                    >
                      {isCompleted && (
                        <Check size={15} strokeWidth={2} />
                      )}
                    </span>

                    <div
                      className={`min-h-16 flex-1 pb-5 ${
                        isLast ? "pb-0" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted
                              ? "text-[#4A0F22]"
                              : "text-[#6E1834]/40"
                          }`}
                        >
                          {step.label}
                        </p>

                        {isCurrent && (
                          <span className="bg-[#EDE3D5] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#6E1834]">
                            Current
                          </span>
                        )}
                      </div>

                      {stepDate && (
                        <p className="mt-1 text-xs text-[#6E1834]/55">
                          {formatDate(stepDate)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {order.tracking_id && (
          <section className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center bg-[#EDE3D5]">
                <Truck
                  size={23}
                  strokeWidth={1.5}
                  className="text-[#B68A42]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B68A42]">
                  Courier Tracking
                </p>

                <h2 className="mt-2 font-serif text-3xl leading-none text-[#4A0F22]">
                  {order.courier_partner ?? "Courier Partner"}
                </h2>

                <p className="mt-3 break-all text-sm text-[#6E1834]/75">
                  Tracking ID:{" "}
                  <strong className="text-[#4A0F22]">
                    {order.tracking_id}
                  </strong>
                </p>

                {order.estimated_delivery_date && (
                  <p className="mt-2 text-sm text-[#6E1834]/75">
                    Estimated delivery:{" "}
                    {formatDate(
                      `${order.estimated_delivery_date}T00:00:00`
                    )}
                  </p>
                )}

                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center gap-2 border border-[#4A0F22] px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
                  >
                    Track Shipment
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {order.status === "delivered" && (
          <Link
            href={`/account/orders/${order.order_number}/return`}
            className="mt-5 flex min-h-12 items-center justify-center gap-2 border border-[#4A0F22] bg-[#FFFDF9] px-6 text-xs font-bold uppercase tracking-[0.13em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
          >
            <RotateCcw size={16} />
            Request Return or Exchange
          </Link>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Package
                size={21}
                strokeWidth={1.5}
                className="text-[#B68A42]"
              />
              <h2 className="font-serif text-3xl text-[#4A0F22]">
                Your Sarees
              </h2>
            </div>

            {items.length === 0 ? (
              <p className="mt-5 text-sm text-[#6E1834]/65">
                Product information is unavailable for this order.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-[#E6DACA] pb-4 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.product_image_url ? (
                        <span
                          role="img"
                          aria-label={item.product_title}
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

                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#4A0F22]">
                          {item.product_title}
                        </p>
                        <p className="mt-1 text-sm text-[#6E1834]/70">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#4A0F22]">
                      {formatPrice(
                        item.unit_price * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-[#E6DACA] pt-5">
              <span className="font-serif text-2xl text-[#4A0F22]">
                Total
              </span>
              <span className="font-sans text-xl font-semibold tracking-[-0.03em] text-[#4A0F22]">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <MapPin
                size={22}
                strokeWidth={1.5}
                className="mt-1 shrink-0 text-[#B68A42]"
              />

              <div>
                <h2 className="font-serif text-3xl text-[#4A0F22]">
                  Delivery Address
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#6E1834]/80">
                  <strong className="font-semibold text-[#4A0F22]">
                    {address.full_name ?? "Customer"}
                  </strong>
                  <br />
                  {address.house_flat ||
                    "Address not available"}
                  {address.street_locality
                    ? `, ${address.street_locality}`
                    : ""}
                  <br />
                  {[address.city, address.state]
                    .filter(Boolean)
                    .join(", ")}
                  {address.pincode
                    ? ` — ${address.pincode}`
                    : ""}
                  {address.phone && (
                    <>
                      <br />
                      {address.phone}
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}