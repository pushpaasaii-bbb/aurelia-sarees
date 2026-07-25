"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Search,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export default function AdminCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin"
      );

      if (adminError || !isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const { data, error: customersError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false });

      if (customersError) {
        setError(customersError.message);
      } else {
        setCustomers((data ?? []) as Customer[]);
      }

      setLoading(false);
    }

    loadCustomers();
  }, [router]);

  const filteredCustomers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.full_name?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm) ||
        customer.id.toLowerCase().includes(searchTerm)
      );
    });
  }, [customers, search]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5">
        <section className="w-full max-w-md border border-[#E6DACA] bg-[#FFFDF9] p-8 text-center">
          <ShieldAlert className="mx-auto text-[#6E1834]" size={34} />
          <h1 className="mt-4 font-serif text-3xl text-[#4A0F22]">
            Admin access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            You do not have permission to view the customer directory.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex bg-[#4A0F22] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            Return to store
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 text-[#1F1B1B] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to admin
        </Link>

        <section className="mt-7 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
                AURELIA Admin
              </p>

              <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-[#4A0F22]">
                <UsersRound size={31} strokeWidth={1.4} />
                Customers
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
                View customers registered on your AURELIA store.
              </p>
            </div>

            <div className="border border-[#E6DACA] bg-[#FAF7F2] px-5 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B68A42]">
                Total customers
              </p>
              <p className="mt-1 font-serif text-3xl text-[#4A0F22]">
                {customers.length}
              </p>
            </div>
          </div>

          <div className="relative mt-8 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E1834]/60"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, or customer ID"
              className="h-12 w-full border border-[#DCCCB9] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#6E1834]"
            />
          </div>

          {error && (
            <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-7 overflow-x-auto border border-[#E6DACA]">
            <table className="min-w-[720px] w-full text-left">
              <thead className="bg-[#F3E7D8]">
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E1834]">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Customer ID</th>
                  <th className="px-5 py-4">Joined</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E6DACA] bg-white">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="text-sm text-[#4A0F22]">
                    <td className="px-5 py-5 font-medium">
                      {customer.full_name || "Unnamed customer"}
                    </td>
                    <td className="px-5 py-5 text-[#6E1834]/75">
                      {customer.phone || "—"}
                    </td>
                    <td className="max-w-[210px] truncate px-5 py-5 font-mono text-xs text-[#6E1834]/65">
                      {customer.id}
                    </td>
                    <td className="px-5 py-5 text-[#6E1834]/75">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                ))}

                {!error && filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-[#6E1834]/70"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}