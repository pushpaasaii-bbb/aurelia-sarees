"use client";
import WishlistButton from "@/components/wishlist/WishlistButton";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  fabric: string | null;
  colour: string | null;
  occasion: string | null;
  work_details: string | null;
  saree_length: string | null;
  blouse_piece: string | null;
  care_instructions: string | null;
  dispatch_timeline: string | null;
  category: {
    name: string;
    slug: string;
  } | null;
  product_images: ProductImage[] | null;
};

type StoreSettings = {
  whatsapp_number: string;
  return_window_days: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({
    whatsapp_number: "919000000000",
    return_window_days: 7,
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const supabase = createClient();

      const [{ data: productData }, { data: settingsData }] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
              id,
              title,
              slug,
              description,
              price,
              original_price,
              stock_quantity,
              low_stock_threshold,
              fabric,
              colour,
              occasion,
              work_details,
              saree_length,
              blouse_piece,
              care_instructions,
              dispatch_timeline,
              category:categories(name, slug),
              product_images(id, image_url, alt_text, sort_order)
            `
          )
          .eq("slug", params.slug)
          .eq("status", "active")
          .single(),
        supabase
          .from("store_settings")
          .select("whatsapp_number, return_window_days")
          .single(),
      ]);

      setProduct((productData as Product | null) ?? null);

      if (settingsData) {
        setSettings(settingsData);
      }

      setIsLoading(false);
    }

    loadProduct();
  }, [params.slug]);

  const images = useMemo(
    () =>
      [...(product?.product_images ?? [])].sort(
        (firstImage, secondImage) => firstImage.sort_order - secondImage.sort_order
      ),
    [product]
  );

  function checkPincode() {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    setPincodeMessage(
      "We will confirm delivery availability during secure checkout."
    );
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-2 border-[#EDE3D5] border-t-[#6E1834]" />
          <p className="mt-4 text-sm text-[#6E1834]/70">Loading saree details…</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5 text-center">
        <div>
          <h1 className="font-serif text-4xl text-[#4A0F22]">
            This saree is unavailable
          </h1>
          <p className="mt-3 text-sm text-[#6E1834]/70">
            It may have been removed or is no longer available.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-12 items-center bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  const selectedProductImage = images[selectedImage];
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock =
    product.stock_quantity > 0 &&
    product.stock_quantity <= (product.low_stock_threshold ?? 3);

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : null;

  const whatsappMessage = encodeURIComponent(
    `Hello AURELIA, I would like to know more about ${product.title}.`
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/shop"
            className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
          >
            <ArrowLeft size={17} /> Shop
          </Link>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl tracking-[0.12em] text-[#4A0F22]"
          >
            AURELIA
          </Link>

          <WishlistButton
  productId={product.id}
  productTitle={product.title}
/>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-12">
        <p className="text-[11px] text-[#6E1834]/60">
          <Link href="/" className="hover:text-[#4A0F22]">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:text-[#4A0F22]">
            Shop
          </Link>{" "}
          / <span className="text-[#6E1834]">{product.title}</span>
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-14">
          <section>
            <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE3D5]">
              {selectedProductImage ? (
                <div
                  role="img"
                  aria-label={selectedProductImage.alt_text ?? product.title}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${selectedProductImage.image_url}")`,
                  }}
                />
              ) : (
                <div className="grid h-full place-items-center font-serif text-4xl text-[#6E1834]/50">
                  AURELIA
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 grid place-items-center bg-[#1F1B1B]/55">
                  <span className="border border-white px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 w-18 shrink-0 overflow-hidden border ${
                      selectedImage === index
                        ? "border-[#4A0F22]"
                        : "border-transparent"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <span
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${image.image_url}")` }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B68A42]">
              {product.category?.name ?? product.fabric ?? "AURELIA"}
            </p>

            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#4A0F22] sm:text-5xl">
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-2xl font-semibold text-[#4A0F22]">
                {formatPrice(product.price)}
              </span>

              {product.original_price && (
                <span className="pb-1 text-sm text-[#6E1834]/50 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}

              {discount && (
                <span className="mb-1 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="mt-5 border-y border-[#E6DACA] py-4">
              {isOutOfStock ? (
                <p className="text-sm font-semibold text-[#6E1834]">
                  Currently out of stock
                </p>
              ) : isLowStock ? (
                <p className="text-sm font-semibold text-[#A5572E]">
                  Only {product.stock_quantity} left — order soon.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Check size={16} /> In stock and ready to be beautifully packed
                </p>
              )}
            </div>

            <p className="mt-5 text-sm leading-7 text-[#6E1834]/80">
              {product.description}
            </p>

            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]">
                Quantity
              </p>

              <div className="mt-3 flex h-12 w-34 items-center justify-between border border-[#DCCCB9] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={isOutOfStock}
                  className="grid h-full w-11 place-items-center disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <span className="text-sm font-semibold">{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(product.stock_quantity, current + 1)
                    )
                  }
                  disabled={isOutOfStock || quantity >= product.stock_quantity}
                  className="grid h-full w-11 place-items-center disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <AddToCartButton
                productId={product.id}
                productTitle={product.title}
                quantity={quantity}
                availableStock={product.stock_quantity}
                disabled={isOutOfStock}
              />

              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-13 items-center justify-center border border-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
              >
                WhatsApp Enquiry
              </a>
            </div>

            <div className="mt-6 border border-[#DCCCB9] bg-[#FFFDF9] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4A0F22]">
                Check delivery to your pincode
              </p>

              <div className="mt-3 flex gap-2">
                <input
                  value={pincode}
                  onChange={(event) =>
                    setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Enter 6-digit pincode"
                  className="h-11 min-w-0 flex-1 border border-[#DCCCB9] bg-white px-3 text-sm outline-none focus:border-[#6E1834]"
                />

                <button
                  type="button"
                  onClick={checkPincode}
                  className="h-11 bg-[#4A0F22] px-4 text-xs font-bold uppercase tracking-[0.1em] text-white"
                >
                  Check
                </button>
              </div>

              {pincodeMessage && (
                <p className="mt-3 text-xs leading-5 text-[#6E1834]/75">
                  {pincodeMessage}
                </p>
              )}
            </div>

            <div className="mt-5 divide-y divide-[#E6DACA] border-y border-[#E6DACA]">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((current) => !current)}
                className="flex min-h-14 w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Saree Details
                <ChevronDown
                  size={17}
                  className={isDetailsOpen ? "rotate-180 transition" : "transition"}
                />
              </button>

              {isDetailsOpen && (
                <dl className="grid grid-cols-2 gap-x-5 gap-y-3 pb-5 text-sm">
                  {[
                    ["Fabric", product.fabric],
                    ["Colour", product.colour],
                    ["Work / Weave", product.work_details],
                    ["Occasion", product.occasion],
                    ["Saree Length", product.saree_length],
                    ["Blouse Piece", product.blouse_piece],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label}>
                        <dt className="text-xs text-[#6E1834]/60">{label}</dt>
                        <dd className="mt-1 text-[#4A0F22]">{value}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              )}

              <button
                type="button"
                onClick={() => setIsShippingOpen((current) => !current)}
                className="flex min-h-14 w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Shipping & Care
                <ChevronDown
                  size={17}
                  className={isShippingOpen ? "rotate-180 transition" : "transition"}
                />
              </button>

              {isShippingOpen && (
                <div className="pb-5 text-sm leading-6 text-[#6E1834]/80">
                  <p>
                    {product.dispatch_timeline ??
                      "Dispatch timeline will be confirmed at checkout."}
                  </p>

                  {product.care_instructions && (
                    <p className="mt-2">
                      <strong className="font-semibold text-[#4A0F22]">
                        Care:
                      </strong>{" "}
                      {product.care_instructions}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsReturnsOpen((current) => !current)}
                className="flex min-h-14 w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Returns & Exchanges
                <ChevronDown
                  size={17}
                  className={isReturnsOpen ? "rotate-180 transition" : "transition"}
                />
              </button>

              {isReturnsOpen && (
                <p className="pb-5 text-sm leading-6 text-[#6E1834]/80">
                  Eligible delivered orders can request a return or exchange within{" "}
                  {settings.return_window_days} days, subject to our return policy.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3 border-t border-[#E6DACA] pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-xs leading-5 text-[#6E1834]/75">
                <Truck size={20} className="shrink-0 text-[#B68A42]" />
                Carefully packed and shipped across India
              </div>

              <div className="flex items-center gap-3 text-xs leading-5 text-[#6E1834]/75">
                <ShieldCheck size={20} className="shrink-0 text-[#B68A42]" />
                Safe, secure payments at checkout
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}