"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_address: {
    full_name?: string;
    phone?: string;
    house_flat?: string;
    street_locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
  courier_partner: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  shipment_notes: string | null;
};

type MessageType = "success" | "error" | "";

const statuses = [
  "payment_pending",
  "payment_confirmed",
  "order_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

const formatStatus = (status: string) =>
  status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function isValidTrackingUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [savedStatus, setSavedStatus] = useState("");
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/admin/orders/${params.id}`);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.replace("/admin/orders");
        return;
      }

      const loadedOrder = data as Order;

      setAdminUserId(user.id);
      setOrder(loadedOrder);
      setSavedStatus(loadedOrder.status);
      setIsLoading(false);
    }

    loadOrder();
  }, [params.id, router]);

  function updateField(key: keyof Order, value: string) {
    setOrder((current) =>
      current ? { ...current, [key]: value } : current
    );

    setMessage("");
    setMessageType("");
  }

  async function saveOrder() {
    if (!order || !adminUserId || isSaving) return;

    const trackingUrl = order.tracking_url?.trim() ?? "";

    if (!isValidTrackingUrl(trackingUrl)) {
      setMessage(
        "Enter a complete tracking link beginning with https:// or http://."
      );
      setMessageType("error");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setMessageType("");

    const supabase = createClient();
    const statusChanged = order.status !== savedStatus;

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: order.status,
        courier_partner: order.courier_partner?.trim() || null,
        tracking_id: order.tracking_id?.trim() || null,
        tracking_url: trackingUrl || null,
        estimated_delivery_date:
          order.estimated_delivery_date || null,
        shipment_notes: order.shipment_notes?.trim() || null,
      })
      .eq("id", order.id);

    if (updateError) {
      setIsSaving(false);
      setMessage(updateError.message);
      setMessageType("error");
      return;
    }

    if (statusChanged) {
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
          status: order.status,
          note: order.shipment_notes?.trim() || null,
          created_by: adminUserId,
        });

      if (historyError) {
        setSavedStatus(order.status);
        setIsSaving(false);
        setMessage(
          `Order was saved, but its timeline update failed: ${historyError.message}`
        );
        setMessageType("error");
        return;
      }

      setSavedStatus(order.status);
    }

    setIsSaving(false);
    setMessage(
      statusChanged
        ? "Order status and delivery details saved successfully."
        : "Delivery details saved successfully. No duplicate status update was created."
    );
    setMessageType("success");
  }

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

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#B68A42]/25 bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/admin"
            className="font-serif text-2xl tracking-[0.12em]"
          >
            AURELIA
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        <Link
          href="/admin/orders"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Orders
        </Link>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Order {order.order_number}
        </p>

        <h1 className="mt-2 font-serif text-[2.7rem] leading-none tracking-[-0.025em] text-[#4A0F22] sm:text-5xl">
          Delivery Management
        </h1>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Customer Delivery Address
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#6E1834]/80">
              <strong className="font-semibold text-[#4A0F22]">
                {address.full_name ?? "Customer"}
              </strong>
              <br />
              {address.house_flat || "Address not available"}
              {address.street_locality
                ? `, ${address.street_locality}`
                : ""}
              <br />
              {[address.city, address.state]
                .filter(Boolean)
                .join(", ")}
              {address.pincode ? ` — ${address.pincode}` : ""}
              <br />
              {address.phone}
            </p>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Payment
            </h2>

            <p className="mt-5 text-sm text-[#6E1834]/75">
              Payment status:{" "}
              <strong className="font-semibold text-[#4A0F22]">
                {formatStatus(order.payment_status)}
              </strong>
            </p>

            <p className="mt-2 text-sm text-[#6E1834]/75">
              Order total:{" "}
              <strong className="font-semibold text-[#4A0F22]">
                ₹
                {Number(order.total_amount).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </p>
          </section>
        </div>

        <section className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center bg-[#EDE3D5]">
              <Truck
                size={21}
                strokeWidth={1.5}
                className="text-[#B68A42]"
              />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B68A42]">
                Manual fulfilment
              </p>
              <h2 className="mt-1 font-serif text-3xl leading-none text-[#4A0F22]">
                Order & Tracking Details
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Order status
              <select
                value={order.status}
                onChange={(event) =>
                  updateField("status", event.target.value)
                }
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm normal-case tracking-normal outline-none focus:border-[#6E1834]"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Courier partner
              <select
                value={order.courier_partner ?? ""}
                onChange={(event) =>
                  updateField(
                    "courier_partner",
                    event.target.value
                  )
                }
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm normal-case tracking-normal outline-none focus:border-[#6E1834]"
              >
                <option value="">Select courier</option>
                <option value="Shiprocket">Shiprocket</option>
                <option value="Delhivery">Delhivery</option>
                <option value="Blue Dart">Blue Dart</option>
                <option value="DTDC">DTDC</option>
                <option value="Xpressbees">Xpressbees</option>
                <option value="India Post">India Post</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Tracking ID / AWB
              <input
                value={order.tracking_id ?? ""}
                onChange={(event) =>
                  updateField("tracking_id", event.target.value)
                }
                placeholder="Enter courier AWB number"
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm normal-case tracking-normal outline-none placeholder:text-[#6E1834]/35 focus:border-[#6E1834]"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Estimated delivery date
              <input
                type="date"
                value={order.estimated_delivery_date ?? ""}
                onChange={(event) =>
                  updateField(
                    "estimated_delivery_date",
                    event.target.value
                  )
                }
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm normal-case tracking-normal outline-none focus:border-[#6E1834]"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22] sm:col-span-2">
              Courier tracking link
              <input
                type="url"
                value={order.tracking_url ?? ""}
                onChange={(event) =>
                  updateField(
                    "tracking_url",
                    event.target.value
                  )
                }
                placeholder="https://courier-website.com/track/..."
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm normal-case tracking-normal outline-none placeholder:text-[#6E1834]/35 focus:border-[#6E1834]"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22] sm:col-span-2">
              Customer-visible delivery note
              <textarea
                value={order.shipment_notes ?? ""}
                onChange={(event) =>
                  updateField(
                    "shipment_notes",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Example: Your order has been packed securely and handed to the courier."
                className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm font-normal normal-case leading-6 tracking-normal outline-none placeholder:text-[#6E1834]/35 focus:border-[#6E1834]"
              />
              <span className="mt-2 block text-[11px] font-normal normal-case leading-5 tracking-normal text-[#6E1834]/55">
                Do not enter private staff notes here. Customers may
                see this update in their order history.
              </span>
            </label>
          </div>

          {message && (
            <p
              className={`mt-5 border px-4 py-3 text-sm ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={saveOrder}
            disabled={isSaving}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSaving ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Saving
              </>
            ) : (
              <>
                <Save size={17} />
                Save Delivery Details
              </>
            )}
          </button>
        </section>
      </div>
    </main>
  );
}