"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  order_number: string;
  status: string;
  delivered_at: string | null;
};

export default function ReturnRequestPage() {
  const params = useParams<{ orderNumber: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [requestType, setRequestType] = useState<"return_and_refund" | "exchange">(
    "return_and_refund"
  );
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?next=/account/orders/${params.orderNumber}/return`);
        return;
      }

      const [{ data: orderData }, { data: settingsData }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, status, delivered_at")
          .eq("order_number", params.orderNumber)
          .eq("user_id", user.id)
          .single(),
        supabase.from("store_settings").select("return_window_days").single(),
      ]);

      if (!orderData) {
        router.replace("/account/orders");
        return;
      }

      setOrder(orderData as Order);
      setReturnWindowDays(settingsData?.return_window_days ?? 7);
      setIsLoading(false);
    }

    loadOrder();
  }, [params.orderNumber, router]);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (selectedFiles.length > 3) {
      setMessage("You can upload a maximum of 3 photos.");
      return;
    }

    if (
      selectedFiles.some(
        (file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024
      )
    ) {
      setMessage("Photos must be JPG, PNG, or WEBP and smaller than 5 MB.");
      return;
    }

    setFiles(selectedFiles);
    setMessage("");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!order || !reason) {
      setMessage("Please select a reason.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: request, error: requestError } = await supabase
      .from("return_requests")
      .insert({
        order_id: order.id,
        user_id: user.id,
        request_type: requestType,
        reason,
        description: description || null,
        status:
          requestType === "exchange" ? "exchange_requested" : "return_requested",
      })
      .select("id")
      .single();

    if (requestError || !request) {
      setIsSubmitting(false);
      setMessage(requestError?.message ?? "Could not submit your request.");
      return;
    }

    for (const file of files) {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath =
        `${user.id}/${request.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("return-images")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        continue;
      }

      const { error: imageRecordError } = await supabase
        .from("return_request_images")
        .insert({
          return_request_id: request.id,
          storage_path: filePath,
        });

      if (imageRecordError) {
        await supabase.storage
          .from("return-images")
          .remove([filePath]);
      }
    }

    setIsSubmitting(false);
    router.push("/account/orders");
    router.refresh();
  }

  if (isLoading || !order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const deliveredDate = order.delivered_at ? new Date(order.delivered_at) : null;
  const lastEligibleDate = deliveredDate
    ? new Date(deliveredDate.getTime() + returnWindowDays * 24 * 60 * 60 * 1000)
    : null;

  const isEligible =
    order.status === "delivered" &&
    lastEligibleDate !== null &&
    lastEligibleDate >= new Date();

  if (!isEligible) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5 text-center">
        <div>
          <h1 className="font-serif text-4xl text-[#4A0F22]">
            Return request unavailable
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6E1834]/70">
            Returns and exchanges can only be requested for delivered orders within
            {` ${returnWindowDays} days`} of delivery.
          </p>
          <Link
            href={`/account/orders/${params.orderNumber}`}
            className="mt-7 inline-flex min-h-12 items-center bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Return to Order
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            href={`/account/orders/${params.orderNumber}`}
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> Order Details
          </Link>
          <Link href="/" className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]">
            AURELIA
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Order {order.order_number}
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          Return or Exchange
        </h1>

        <form
          onSubmit={submitRequest}
          className="mt-8 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRequestType("return_and_refund")}
              className={`min-h-16 border p-4 text-left ${
                requestType === "return_and_refund"
                  ? "border-[#4A0F22] bg-[#FAF7F2]"
                  : "border-[#DCCCB9] bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-[#4A0F22]">
                Return & Refund
              </span>
              <span className="mt-1 block text-xs text-[#6E1834]/70">
                Return the saree for a refund after approval.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRequestType("exchange")}
              className={`min-h-16 border p-4 text-left ${
                requestType === "exchange"
                  ? "border-[#4A0F22] bg-[#FAF7F2]"
                  : "border-[#DCCCB9] bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-[#4A0F22]">
                Exchange
              </span>
              <span className="mt-1 block text-xs text-[#6E1834]/70">
                Request an exchange subject to approval and stock.
              </span>
            </button>
          </div>

          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
            Reason
            <select
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
            >
              <option value="">Select a reason</option>
              <option>Product arrived damaged</option>
              <option>Wrong product received</option>
              <option>Product quality issue</option>
              <option>Product differs from description</option>
              <option>Other</option>
            </select>
          </label>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Tell us what happened."
              className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none"
            />
          </label>

          <label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-[#CDBB9F] bg-[#FAF7F2] text-center">
            <Upload size={24} className="text-[#B68A42]" />
            <span className="mt-2 text-sm font-medium text-[#4A0F22]">
              Upload up to 3 supporting photos
            </span>
            <span className="mt-1 text-xs text-[#6E1834]/60">
              JPG, PNG, or WEBP · Maximum 5 MB each
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              className="sr-only"
            />
          </label>

          {files.length > 0 && (
            <p className="mt-3 text-sm text-[#6E1834]/70">
              {files.length} photo{files.length > 1 ? "s" : ""} selected.
            </p>
          )}

          {message && <p className="mt-5 text-sm text-red-700">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
            Submit Request
          </button>
        </form>
      </div>
    </main>
  );
}