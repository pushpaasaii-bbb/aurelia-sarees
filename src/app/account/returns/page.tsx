"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReturnHistory = {
  id: string;
  return_request_id: string;
  status: string;
  created_at: string;
};

type ReturnRequest = {
  id: string;
  request_type: string;
  reason: string;
  status: string;
  created_at: string;
  pickup_date: string | null;
  return_courier_partner: string | null;
  return_tracking_id: string | null;
  return_tracking_url: string | null;
  refund_reference_id: string | null;
  exchange_tracking_id: string | null;
  exchange_tracking_url: string | null;
  order: {
    order_number: string;
  } | null;
  history: ReturnHistory[];
};

const formatText = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));

const completedStatuses = new Set([
  "refunded",
  "exchange_delivered",
]);

const rejectedStatuses = new Set([
  "return_rejected",
  "exchange_rejected",
]);

export default function CustomerReturnsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/account/returns");
        return;
      }

      const { data: requestData } = await supabase
        .from("return_requests")
        .select(
          `
            id,
            request_type,
            reason,
            status,
            created_at,
            pickup_date,
            return_courier_partner,
            return_tracking_id,
            return_tracking_url,
            refund_reference_id,
            exchange_tracking_id,
            exchange_tracking_url,
            order:orders(order_number)
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const baseRequests =
        (requestData as Omit<ReturnRequest, "history">[] | null) ?? [];

      if (baseRequests.length === 0) {
        setRequests([]);
        setIsLoading(false);
        return;
      }

      const { data: historyData } = await supabase
        .from("return_status_history")
        .select("id, return_request_id, status, created_at")
        .in(
          "return_request_id",
          baseRequests.map((request) => request.id)
        )
        .order("created_at", { ascending: true });

      const allHistory =
        (historyData as ReturnHistory[] | null) ?? [];

      setRequests(
        baseRequests.map((request) => ({
          ...request,
          history: allHistory.filter(
            (update) => update.return_request_id === request.id
          ),
        }))
      );

      setIsLoading(false);
    }

    loadRequests();
  }, [router]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle
          size={28}
          className="animate-spin text-[#6E1834]"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/account"
            className="flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834] sm:text-xs"
          >
            <ArrowLeft size={17} />
            Account
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
          My Account
        </p>

        <h1 className="mt-2 font-serif text-[2.7rem] leading-none tracking-[-0.025em] text-[#4A0F22] sm:text-5xl">
          Returns & Exchanges
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6E1834]/70">
          Follow every review, pickup, quality check, refund, and
          exchange update.
        </p>

        {requests.length === 0 ? (
          <section className="mt-9 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <RotateCcw
              size={34}
              strokeWidth={1.3}
              className="mx-auto text-[#B68A42]"
            />

            <h2 className="mt-5 font-serif text-3xl text-[#4A0F22]">
              No return requests
            </h2>

            <p className="mt-3 text-sm text-[#6E1834]/70">
              Your return and exchange requests will appear here.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              <ShoppingBag size={16} />
              Shop Sarees
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {requests.map((request) => {
              const isCompleted = completedStatuses.has(
                request.status
              );
              const isRejected = rejectedStatuses.has(
                request.status
              );

              return (
                <article
                  key={request.id}
                  className="border border-[#E6DACA] bg-[#FFFDF9]"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#B68A42]">
                          Order{" "}
                          {request.order?.order_number ?? "Unavailable"}
                        </p>

                        <h2 className="mt-2 font-serif text-3xl leading-none text-[#4A0F22]">
                          {formatText(request.request_type)}
                        </h2>

                        <p className="mt-3 text-sm text-[#6E1834]/70">
                          Reason: {request.reason}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <span
                          className={`inline-flex px-3 py-2 text-[9px] font-bold uppercase tracking-[0.13em] ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700"
                              : isRejected
                                ? "bg-red-50 text-red-700"
                                : "bg-[#EDE3D5] text-[#6E1834]"
                          }`}
                        >
                          {formatText(request.status)}
                        </span>

                        <p className="mt-2 text-xs text-[#6E1834]/55">
                          Requested {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    {(request.return_tracking_id ||
                      request.pickup_date) && (
                      <div className="mt-5 border border-[#E6DACA] bg-[#FAF7F2] p-4">
                        <div className="flex items-start gap-3">
                          <Truck
                            size={20}
                            strokeWidth={1.5}
                            className="mt-0.5 shrink-0 text-[#B68A42]"
                          />

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A0F22]">
                              Return Pickup
                            </p>

                            {request.pickup_date && (
                              <p className="mt-2 text-sm text-[#6E1834]/70">
                                Pickup date:{" "}
                                {formatDate(
                                  `${request.pickup_date}T00:00:00`
                                )}
                              </p>
                            )}

                            {request.return_courier_partner && (
                              <p className="mt-1 text-sm text-[#6E1834]/70">
                                Courier:{" "}
                                {request.return_courier_partner}
                              </p>
                            )}

                            {request.return_tracking_id && (
                              <p className="mt-1 break-all text-sm text-[#6E1834]/70">
                                Tracking ID:{" "}
                                <strong className="text-[#4A0F22]">
                                  {request.return_tracking_id}
                                </strong>
                              </p>
                            )}

                            {request.return_tracking_url && (
                              <a
                                href={request.return_tracking_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#6E1834] underline underline-offset-4"
                              >
                                Track Return
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(request.refund_reference_id ||
                      request.exchange_tracking_id) && (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {request.refund_reference_id && (
                          <div className="border border-[#E6DACA] p-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#B68A42]">
                              Refund Reference
                            </p>
                            <p className="mt-2 break-all text-sm font-semibold text-[#4A0F22]">
                              {request.refund_reference_id}
                            </p>
                          </div>
                        )}

                        {request.exchange_tracking_id && (
                          <div className="border border-[#E6DACA] p-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#B68A42]">
                              Exchange Tracking
                            </p>
                            <p className="mt-2 break-all text-sm font-semibold text-[#4A0F22]">
                              {request.exchange_tracking_id}
                            </p>

                            {request.exchange_tracking_url && (
                              <a
                                href={request.exchange_tracking_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#6E1834] underline underline-offset-4"
                              >
                                Track Exchange
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E6DACA] bg-[#FAF7F2] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <Clock3
                        size={19}
                        strokeWidth={1.5}
                        className="text-[#B68A42]"
                      />
                      <h3 className="font-serif text-2xl text-[#4A0F22]">
                        Request Timeline
                      </h3>
                    </div>

                    <div className="mt-5">
                      <div className="relative flex gap-4">
                        {request.history.length > 0 && (
                          <span className="absolute left-[15px] top-8 h-full w-px bg-[#B68A42]" />
                        )}
                        <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-[#4A0F22] text-white">
                          <Check size={15} />
                        </span>

                        <div className="min-h-16 flex-1 pb-5">
                          <p className="text-sm font-semibold text-[#4A0F22]">
                            Request Submitted
                          </p>
                          <p className="mt-1 text-xs text-[#6E1834]/55">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>

                      {request.history.map((update, index) => {
                        const isLast =
                          index === request.history.length - 1;

                        return (
                          <div
                            key={update.id}
                            className="relative flex gap-4"
                          >
                            {!isLast && (
                              <span className="absolute left-[15px] top-8 h-full w-px bg-[#B68A42]" />
                            )}

                            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-[#4A0F22] text-white">
                              <Check size={15} />
                            </span>

                            <div className="min-h-16 flex-1 pb-5 last:pb-0">
                              <p className="text-sm font-semibold text-[#4A0F22]">
                                {formatText(update.status)}
                              </p>
                              <p className="mt-1 text-xs text-[#6E1834]/55">
                                {formatDate(update.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}