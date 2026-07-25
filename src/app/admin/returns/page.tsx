"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReturnRequest = {
  id: string;
  request_type: string;
  reason: string;
  status: string;
  created_at: string;
  order: { order_number: string } | null;
  profile: { full_name: string | null } | null;
};

const formatText = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminReturnsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/returns");
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
            id,
            request_type,
            reason,
            status,
            created_at,
            order:orders(order_number),
            profile:profiles(full_name)
          `
        )
        .order("created_at", { ascending: false });

      setRequests((data as ReturnRequest[] | null) ?? []);
      setIsLoading(false);
    }

    loadRequests();
  }, [router]);

  const filteredRequests = requests.filter((request) =>
    `${request.order?.order_number ?? ""} ${request.profile?.full_name ?? ""} ${request.reason}`
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

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">
          Returns & Exchanges
        </h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Review, approve, reject, track, and complete customer return requests.
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

        {filteredRequests.length === 0 ? (
          <section className="mt-7 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <RotateCcw
              size={34}
              strokeWidth={1.3}
              className="mx-auto text-[#B68A42]"
            />
            <h2 className="mt-5 font-serif text-3xl text-[#4A0F22]">
              No return requests yet
            </h2>
            <p className="mt-3 text-sm text-[#6E1834]/70">
              Customer return and exchange requests will appear here.
            </p>
          </section>
        ) : (
          <section className="mt-7 overflow-hidden border border-[#E6DACA] bg-[#FFFDF9]">
            {filteredRequests.map((request) => (
              <article
                key={request.id}
                className="grid gap-3 border-b border-[#E6DACA] px-5 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_1fr_180px] md:items-center"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                    {request.order?.order_number ?? "Order"}
                  </p>
                  <p className="mt-2 text-sm text-[#6E1834]/70">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(request.created_at))}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-[#4A0F22]">
                    {request.profile?.full_name ?? "Customer"}
                  </p>
                  <p className="mt-1 text-sm text-[#6E1834]/70">
                    {formatText(request.request_type)}
                  </p>
                </div>

                <p className="text-sm text-[#6E1834]/75">{request.reason}</p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6E1834]">
                    {formatText(request.status)}
                  </p>

                  <Link
                    href={`/admin/returns/${request.id}`}
                    className="mt-3 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-[#4A0F22] underline underline-offset-4"
                  >
                    Review Request
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}