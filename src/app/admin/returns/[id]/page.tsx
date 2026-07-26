"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReturnRequest = {
  id: string;
  request_type: string;
  reason: string;
  description: string | null;
  status: string;
  admin_note: string | null;
  rejection_reason: string | null;
  pickup_date: string | null;
  return_courier_partner: string | null;
  return_tracking_id: string | null;
  return_tracking_url: string | null;
  quality_check_passed: boolean | null;
  quality_check_note: string | null;
  refund_reference_id: string | null;
  refund_amount: number | null;
  exchange_tracking_id: string | null;
  exchange_tracking_url: string | null;
  order: {
    order_number: string;
  } | null;
  profile: {
    full_name: string | null;
  } | null;
};
type ReturnPhoto = {
  id: string;
  signedUrl: string;
};

const returnStatuses = [
  "return_requested",
  "return_under_review",
  "return_approved",
  "return_rejected",
  "pickup_scheduled",
  "return_in_transit",
  "return_received",
  "quality_check",
  "refund_processing",
  "refunded",
  "exchange_requested",
  "exchange_approved",
  "exchange_rejected",
  "exchange_shipped",
  "exchange_delivered",
];

const formatText = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminReturnDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [photos, setPhotos] = useState<ReturnPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRequest() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/admin/returns/${params.id}`);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("return_requests")
        .select(
          `
            *,
            order:orders(order_number),
            profile:profiles(full_name)
          `
        )
        .eq("id", params.id)
        .single();

      if (!data) {
        router.replace("/admin/returns");
        return;
      }

      const { data: photoRecords } = await supabase
        .from("return_request_images")
        .select("id, storage_path")
        .eq("return_request_id", params.id);

      const signedPhotos: ReturnPhoto[] = [];

      for (const photo of photoRecords ?? []) {
        const { data: signedUrlData } = await supabase.storage
          .from("return-images")
          .createSignedUrl(photo.storage_path, 60 * 60);

        if (signedUrlData?.signedUrl) {
          signedPhotos.push({
            id: photo.id,
            signedUrl: signedUrlData.signedUrl,
          });
        }
      }

      setPhotos(signedPhotos);
      setRequest(data as ReturnRequest);
      setIsLoading(false);
    }

    loadRequest();
  }, [params.id, router]);

  function updateField(key: keyof ReturnRequest, value: string | boolean | null) {
    setRequest((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveRequest() {
    if (!request) return;

    setIsSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("return_requests")
      .update({
        status: request.status,
        admin_note: request.admin_note || null,
        rejection_reason: request.rejection_reason || null,
        pickup_date: request.pickup_date || null,
        return_courier_partner: request.return_courier_partner || null,
        return_tracking_id: request.return_tracking_id || null,
        return_tracking_url: request.return_tracking_url || null,
        quality_check_passed: request.quality_check_passed,
        quality_check_note: request.quality_check_note || null,
        refund_reference_id: request.refund_reference_id || null,
        refund_amount: request.refund_amount || null,
        exchange_tracking_id: request.exchange_tracking_id || null,
        exchange_tracking_url: request.exchange_tracking_url || null,
      })
      .eq("id", request.id);

    if (!error) {
      await supabase.from("return_status_history").insert({
        return_request_id: request.id,
        status: request.status,
        note: request.admin_note || request.quality_check_note || null,
      });
    }

    setIsSaving(false);
    setMessage(error ? error.message : "Return request saved successfully.");
  }

  if (isLoading || !request) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.12em]">
            AURELIA
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link
          href="/admin/returns"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Returns & Exchanges
        </Link>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          {request.order?.order_number ?? "Order"} · {formatText(request.request_type)}
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          Return Request Review
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Customer Request</h2>
            <p className="mt-5 text-sm text-[#6E1834]/75">
              Customer:{" "}
              <strong className="text-[#4A0F22]">
                {request.profile?.full_name ?? "Customer"}
              </strong>
            </p>
            <p className="mt-3 text-sm text-[#6E1834]/75">
              Reason: <strong className="text-[#4A0F22]">{request.reason}</strong>
            </p>
            {request.description && (
              <p className="mt-3 text-sm leading-6 text-[#6E1834]/75">
                {request.description}
              </p>
            )}
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Request Status</h2>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Status
              <select
                value={request.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              >
                {returnStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatText(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Admin note
              <textarea
                value={request.admin_note ?? ""}
                onChange={(event) => updateField("admin_note", event.target.value)}
                rows={4}
                className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none"
              />
            </label>
          </section>
        </div>

        {photos.length > 0 && (
          <section className="mt-6 border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Customer Photos
            </h2>

            <p className="mt-2 text-sm text-[#6E1834]/65">
              Review the customer&apos;s supporting photos before approving
              the return or exchange.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <a
                  key={photo.id}
                  href={photo.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  aria-label={`Open customer return photo ${index + 1}`}
                >
                  <span
                    role="img"
                    aria-label={`Customer return photo ${index + 1}`}
                    className="block aspect-square border border-[#E6DACA] bg-[#FAF7F2] bg-cover bg-center transition group-hover:border-[#B68A42]"
                    style={{
                      backgroundImage: `url("${photo.signedUrl}")`,
                    }}
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 border border-[#E6DACA] bg-[#FFFDF9] p-6">
          <h2 className="font-serif text-3xl text-[#4A0F22]">Pickup & Return Courier</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Pickup date
              <input
                type="date"
                value={request.pickup_date ?? ""}
                onChange={(event) => updateField("pickup_date", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Courier partner
              <input
                value={request.return_courier_partner ?? ""}
                onChange={(event) =>
                  updateField("return_courier_partner", event.target.value)
                }
                placeholder="Shiprocket, Delhivery, DTDC..."
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Return tracking ID
              <input
                value={request.return_tracking_id ?? ""}
                onChange={(event) => updateField("return_tracking_id", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Return tracking URL
              <input
                type="url"
                value={request.return_tracking_url ?? ""}
                onChange={(event) => updateField("return_tracking_url", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 border border-[#E6DACA] bg-[#FFFDF9] p-6">
          <h2 className="font-serif text-3xl text-[#4A0F22]">Quality Check & Resolution</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Quality check
              <select
                value={
                  request.quality_check_passed === null
                    ? ""
                    : request.quality_check_passed
                      ? "passed"
                      : "failed"
                }
                onChange={(event) =>
                  updateField(
                    "quality_check_passed",
                    event.target.value === "" ? null : event.target.value === "passed"
                  )
                }
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              >
                <option value="">Not completed</option>
                <option value="passed">Passed — eligible for restock/refund</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Refund reference ID
              <input
                value={request.refund_reference_id ?? ""}
                onChange={(event) => updateField("refund_reference_id", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Exchange tracking ID
              <input
                value={request.exchange_tracking_id ?? ""}
                onChange={(event) => updateField("exchange_tracking_id", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Exchange tracking URL
              <input
                type="url"
                value={request.exchange_tracking_url ?? ""}
                onChange={(event) => updateField("exchange_tracking_url", event.target.value)}
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
              />
            </label>
          </div>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
            Quality-check note
            <textarea
              value={request.quality_check_note ?? ""}
              onChange={(event) => updateField("quality_check_note", event.target.value)}
              rows={3}
              className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none"
            />
          </label>
        </section>

        {message && (
          <p
            className={`mt-5 text-sm ${
              message.includes("success") ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={saveRequest}
          disabled={isSaving}
          className="mt-6 flex min-h-12 items-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <LoaderCircle size={17} className="animate-spin" /> Saving
            </>
          ) : (
            <>
              <Save size={17} /> Save Return Request
            </>
          )}
        </button>
      </div>
    </main>
  );
}