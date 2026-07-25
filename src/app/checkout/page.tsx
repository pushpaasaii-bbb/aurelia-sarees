"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  full_name: string;
  phone: string;
  house_flat: string;
  street_locality: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

type CartItem = {
  id: string;
  quantity: number;
  product: {
    title: string;
    price: number;
    stock_quantity: number;
  } | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCheckout() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/checkout");
        return;
      }

      const [addressesResult, cartResult] = await Promise.all([
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false }),
        supabase
          .from("cart_items")
          .select("id, quantity, product:products(title, price, stock_quantity)")
          .eq("user_id", user.id),
      ]);

      const loadedAddresses = (addressesResult.data as Address[] | null) ?? [];
      const loadedCart = (cartResult.data as CartItem[] | null) ?? [];

      setAddresses(loadedAddresses);
      setCartItems(loadedCart);

      const defaultAddress = loadedAddresses.find((address) => address.is_default);
      setSelectedAddressId(defaultAddress?.id ?? loadedAddresses[0]?.id ?? "");
      setIsLoading(false);
    }

    loadCheckout();
  }, [router]);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, cartItems.length, router]);

  const validItems = cartItems.filter(
    (item) => item.product && item.quantity <= item.product.stock_quantity
  );

  const subtotal = useMemo(
    () =>
      validItems.reduce(
        (total, item) => total + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [validItems]
  );

  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (isLoading || cartItems.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/cart"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> Cart
          </Link>

          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          Secure Checkout
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
          Delivery & Payment
        </h1>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-3xl text-[#4A0F22]">
                  Delivery Address
                </h2>

                <Link
                  href="/account/addresses"
                  className="text-xs font-bold uppercase tracking-[0.11em] text-[#6E1834] underline underline-offset-4"
                >
                  Manage
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-6 border border-dashed border-[#DCCCB9] p-6 text-center">
                  <MapPin size={25} className="mx-auto text-[#B68A42]" />
                  <p className="mt-3 text-sm text-[#6E1834]">
                    Add a delivery address before continuing.
                  </p>

                  <Link
                    href="/account/addresses"
                    className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22] underline underline-offset-4"
                  >
                    Add Address
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`cursor-pointer border p-4 transition ${
                        selectedAddressId === address.id
                          ? "border-[#4A0F22] bg-[#FAF7F2]"
                          : "border-[#E6DACA] bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery-address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="sr-only"
                      />

                      <div className="flex gap-3">
                        <span
                          className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border ${
                            selectedAddressId === address.id
                              ? "border-[#4A0F22] bg-[#4A0F22]"
                              : "border-[#DCCCB9]"
                          }`}
                        >
                          {selectedAddressId === address.id && (
                            <Check size={11} className="text-white" />
                          )}
                        </span>

                        <p className="text-sm leading-6 text-[#6E1834]/80">
                          <strong className="font-semibold text-[#4A0F22]">
                            {address.full_name}
                          </strong>{" "}
                          · {address.phone}
                          <br />
                          {address.house_flat}, {address.street_locality}
                          <br />
                          {address.city}, {address.state} — {address.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-[#B68A42]" />

                <div>
                  <h2 className="font-serif text-2xl text-[#4A0F22]">
                    Secure Payment
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#6E1834]/70">
                    UPI, cards, net banking, and wallets will be processed
                    securely through Razorpay after the client activates their
                    merchant account.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 border-b border-[#E6DACA] pb-5">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <p className="text-[#6E1834]/75">
                    {item.product?.title ?? "Unavailable product"} × {item.quantity}
                  </p>
                  <p className="shrink-0 font-medium text-[#4A0F22]">
                    {formatPrice((item.product?.price ?? 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-[#6E1834]/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#6E1834]/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>

              <div className="flex justify-between border-t border-[#E6DACA] pt-4 font-serif text-3xl text-[#4A0F22]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedAddressId || validItems.length !== cartItems.length}
              className="mt-7 min-h-13 w-full bg-[#A78B93] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed"
            >
              Payment Activation Pending
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#6E1834]/60">
              Payment is intentionally disabled until the client’s Razorpay
              account is verified. No customer money can be collected before that.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}