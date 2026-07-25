"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, LoaderCircle, ShoppingBag, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type WishlistItem = {
  id: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    stock_quantity: number;
    product_images: { image_url: string; sort_order: number }[] | null;
  } | null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadWishlist() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/wishlist");
      return;
    }

    const { data } = await supabase
      .from("wishlist_items")
      .select(
        "id, product:products(id, title, slug, price, stock_quantity, product_images(image_url, sort_order))"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems((data as WishlistItem[] | null) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("wishlist_items").delete().eq("id", itemId);
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
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

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          My Account
        </p>
        <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">Wishlist</h1>

        {items.length === 0 ? (
          <section className="mt-9 border border-dashed border-[#DCCCB9] bg-[#FFFDF9] px-6 py-16 text-center">
            <Heart size={34} strokeWidth={1.3} className="mx-auto text-[#B68A42]" />
            <h2 className="mt-5 font-serif text-3xl text-[#4A0F22]">
              Your wishlist is empty
            </h2>
            <p className="mt-3 text-sm text-[#6E1834]/70">
              Save the sarees you love and return to them anytime.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              <ShoppingBag size={16} /> Shop Sarees
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              const image = [...(product.product_images ?? [])].sort(
                (first, second) => first.sort_order - second.sort_order
              )[0];

              return (
                <article key={item.id} className="group">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative block aspect-[3/4] overflow-hidden bg-[#EDE3D5]"
                  >
                    {image ? (
                      <span
                        className="absolute inset-0 bg-cover bg-center transition duration-700 lg:group-hover:scale-105"
                        style={{ backgroundImage: `url("${image.image_url}")` }}
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-serif text-xl text-[#6E1834]/50">
                        AURELIA
                      </span>
                    )}

                    {product.stock_quantity === 0 && (
                      <span className="absolute inset-0 grid place-items-center bg-black/45 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        Out of Stock
                      </span>
                    )}
                  </Link>

                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-serif text-xl leading-tight text-[#4A0F22] sm:text-2xl"
                      >
                        {product.title}
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${product.title} from wishlist`}
                        className="grid size-9 shrink-0 place-items-center text-[#6E1834] hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#4A0F22]">
                      {formatPrice(product.price)}
                    </p>
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