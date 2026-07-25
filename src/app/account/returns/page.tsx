"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, RotateCcw, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReturnRequest = {
  id: string;
  request_type: string;
  reason: string;
  status: string;
  created_at: string;
  refund_reference_id: string | null;
  exchange_tracking_id: string | null;
  order: {
    order_number: string;
  } | null;
};

const formatText = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

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

      const { data } = await supabase
        .from("return_requests")
        .select(
          `
            id,
            request_type,
            reason,
            status,
            created_at,
            refund_reference_id,
            exchange_tracking_id,
            order:orders(order_number)
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setRequests((data as ReturnRequest[] | null) ?? []);
      setIsLoading(false);
    }

    loadRequests();
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
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          Returns & Exchanges
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Follow every return, exchange, pickup, and refund update.
        </p>

        {requests.length === 0 ? (
          <section className="mt-9 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <RotateCcw size={34} strokeWidth={1.3} className="mx-auto text-[#B68A42]" />
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
              <ShoppingBag size={16} /> Shop Sarees
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {requests.map((request) => (
              <article
                key={request.id}
                className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                      {request.order?.order_number ?? "Order"}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-[#4A0F22]">
                      {formatText(request.request_type)}
                    </h2>
                    <p className="mt-2 text-sm text-[#6E1834]/70">
                      Reason: {request.reason}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6E1834]">
                      {formatText(request.status)}
                    </p>
                    <p className="mt-2 text-sm text-[#6E1834]/60">
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                      }).format(new Date(request.created_at))}
                    </p>
                  </div>
                </div>

                {request.refund_reference_id && (
                  <p className="mt-5 border-t border-[#E6DACA] pt-4 text-sm text-[#6E1834]/75">
                    Refund reference:{" "}
                    <strong className="text-[#4A0F22]">
                      {request.refund_reference_id}
                    </strong>
                  </p>
                )}

                {request.exchange_tracking_id && (
                  <p className="mt-5 border-t border-[#E6DACA] pt-4 text-sm text-[#6E1834]/75">
                    Exchange tracking ID:{" "}
                    <strong className="text-[#4A0F22]">
                      {request.exchange_tracking_id}
                    </strong>
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}