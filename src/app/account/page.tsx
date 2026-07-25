"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
};

type AccountStats = {
  orders: number;
  addresses: number;
  wishlist: number;
};

export default function AccountPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<AccountStats>({
    orders: 0,
    addresses: 0,
    wishlist: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [profileResult, ordersResult, addressesResult, wishlistResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single(),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("addresses")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("wishlist_items")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

      const profile = profileResult.data as Profile | null;

      setName(profile?.full_name || "AURELIA Customer");
      setEmail(user.email ?? "");
      setStats({
        orders: ordersResult.count ?? 0,
        addresses: addressesResult.count ?? 0,
        wishlist: wishlistResult.count ?? 0,
      });
      setIsLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const dashboardCards = [
    {
      href: "/account/profile",
      icon: UserRound,
      label: "My Profile",
      value: "Edit",
      description: "Update your name and phone number",
    },
    {
      href: "/account/orders",
      icon: Package,
      label: "My Orders",
      value: stats.orders,
      description: "Track and manage your orders",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: "Saved Addresses",
      value: stats.addresses,
      description: "Manage your delivery addresses",
    },
    {
      href: "/wishlist",
      icon: Heart,
      label: "Wishlist",
      value: stats.wishlist,
      description: "Your saved AURELIA favourites",
    },
    {
      href: "/account/returns",
      icon: Package,
      label: "Returns & Exchanges",
      value: 0,
      description: "Track return, exchange, and refund updates",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>

          <Link
            href="/shop"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-full bg-[#EDE3D5] text-[#4A0F22]">
                <UserRound size={26} strokeWidth={1.4} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B68A42]">
                  My AURELIA Account
                </p>
                <h1 className="mt-1 font-serif text-3xl text-[#4A0F22]">
                  Welcome, {name}
                </h1>
                <p className="mt-1 text-sm text-[#6E1834]/70">{email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 items-center justify-center gap-2 border border-[#DCCCB9] px-4 text-xs font-bold uppercase tracking-[0.11em] text-[#6E1834] transition hover:border-[#4A0F22]"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </section>

        <section className="mt-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B68A42]">
            Your account
          </p>

          <h2 className="mt-2 font-serif text-4xl text-[#4A0F22]">
            Everything in one place
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group border border-[#E6DACA] bg-[#FFFDF9] p-6 transition hover:-translate-y-1 hover:border-[#B68A42]"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid size-11 place-items-center bg-[#EDE3D5] text-[#4A0F22]">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>

                    <span className="font-serif text-3xl text-[#4A0F22]">
                      {card.value}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-2xl text-[#4A0F22]">
                    {card.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6E1834]/70">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}