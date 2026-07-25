"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  product_images: ProductImage[] | null;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Product | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState("");

  async function loadCart() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/cart");
      return;
    }

    const { data } = await supabase
      .from("cart_items")
      .select(
        `
          id,
          quantity,
          product:products(
            id,
            title,
            slug,
            price,
            original_price,
            stock_quantity,
            product_images(image_url, sort_order)
          )
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setCartItems((data as CartItem[] | null) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(cartItem: CartItem, nextQuantity: number) {
    if (!cartItem.product) return;

    if (nextQuantity < 1) {
      await removeItem(cartItem.id);
      return;
    }

    if (nextQuantity > cartItem.product.stock_quantity) return;

    setUpdatingItemId(cartItem.id);

    const supabase = createClient();

    await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", cartItem.id);

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === cartItem.id ? { ...item, quantity: nextQuantity } : item
      )
    );

    setUpdatingItemId("");
  }

  async function removeItem(cartItemId: string) {
    setUpdatingItemId(cartItemId);

    const supabase = createClient();

    await supabase.from("cart_items").delete().eq("id", cartItemId);

    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== cartItemId)
    );

    setUpdatingItemId("");
  }

  const validCartItems = cartItems.filter(
    (item) => item.product && item.product.stock_quantity > 0
  );

  const subtotal = useMemo(
    () =>
      validCartItems.reduce(
        (total, item) => total + (item.product?.price ?? 0) * item.quantity,
        0
      ),
    [validCartItems]
  );

  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5 text-center">
        <div>
          <ShoppingBag
            size={42}
            strokeWidth={1.3}
            className="mx-auto text-[#B68A42]"
          />
          <h1 className="mt-5 font-serif text-4xl text-[#4A0F22]">
            Your bag is waiting
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            Discover a saree made for your next beautiful moment.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-12 items-center bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Shop Sarees
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/shop"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> Continue Shopping
          </Link>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>

          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <h1 className="font-serif text-5xl text-[#4A0F22]">Your Bag</h1>
        <p className="mt-2 text-sm text-[#6E1834]/70">
          Your selected AURELIA pieces are reserved until checkout.
        </p>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="divide-y divide-[#E6DACA] border-y border-[#E6DACA]">
            {cartItems.map((item) => {
              const product = item.product;

              if (!product) {
                return null;
              }

              const image = [...(product.product_images ?? [])].sort(
                (firstImage, secondImage) =>
                  firstImage.sort_order - secondImage.sort_order
              )[0];

              const isOutOfStock = product.stock_quantity === 0;
              const isUpdating = updatingItemId === item.id;

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[104px_1fr] gap-4 py-5 sm:grid-cols-[130px_1fr] sm:gap-6"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative aspect-[3/4] overflow-hidden bg-[#EDE3D5]"
                  >
                    {image ? (
                      <span
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${image.image_url}")` }}
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-serif text-xl text-[#6E1834]/50">
                        AURELIA
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="font-serif text-2xl leading-tight text-[#4A0F22] sm:text-3xl"
                        >
                          {product.title}
                        </Link>
                        <p className="mt-2 text-sm font-semibold text-[#4A0F22]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${product.title}`}
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                        className="grid size-10 place-items-center text-[#6E1834]/70 transition hover:text-red-700 disabled:opacity-40"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>

                    {isOutOfStock ? (
                      <p className="mt-4 text-xs font-semibold text-red-700">
                        This saree is now out of stock. Remove it before checkout.
                      </p>
                    ) : (
                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex h-11 w-32 items-center justify-between border border-[#DCCCB9] bg-white">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            disabled={isUpdating}
                            className="grid h-full w-10 place-items-center disabled:opacity-40"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="text-sm font-semibold">{item.quantity}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            disabled={
                              isUpdating || item.quantity >= product.stock_quantity
                            }
                            className="grid h-full w-10 place-items-center disabled:opacity-40"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-[#4A0F22]">
                          {formatPrice(product.price * item.quantity)}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit border border-[#E6DACA] bg-[#FFFDF9] p-6">
            <h2 className="font-serif text-3xl text-[#4A0F22]">Order Summary</h2>

            <div className="mt-6 space-y-3 border-b border-[#E6DACA] pb-5 text-sm">
              <div className="flex justify-between gap-4 text-[#6E1834]/75">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-4 text-[#6E1834]/75">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-emerald-700">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                Total
              </span>
              <span className="font-serif text-3xl text-[#4A0F22]">
                {formatPrice(total)}
              </span>
            </div>

            {subtotal < 1999 && subtotal > 0 && (
              <p className="mt-4 border border-[#E6DACA] bg-[#FAF7F2] p-3 text-xs leading-5 text-[#6E1834]/75">
                Add {formatPrice(1999 - subtotal)} more to receive complimentary
                shipping.
              </p>
            )}

            <Link
              href={validCartItems.length > 0 ? "/checkout" : "/cart"}
              className={`mt-6 flex min-h-13 items-center justify-center text-xs font-bold uppercase tracking-[0.14em] text-white ${
                validCartItems.length > 0
                  ? "bg-[#4A0F22] transition hover:bg-[#6E1834]"
                  : "cursor-not-allowed bg-[#A78B93]"
              }`}
            >
              Secure Checkout
            </Link>

            <p className="mt-4 text-center text-xs leading-5 text-[#6E1834]/60">
              Final stock and price are securely verified before payment.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}