"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type StoreSettings = {
  brand_name: string;
  tagline: string;
  announcement: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type ProductRecord = {
  id: string;
  category_id: string | null;
  slug: string;
  title: string;
};

type ProductImageRecord = {
  product_id: string;
  image_url: string;
};

type CollectionCard = Category & {
  image_url: string | null;
};

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  price: number;
};

const defaultSettings: StoreSettings = {
  brand_name: "AURELIA",
  tagline: "Timeless Elegance, Beautifully Draped",
  announcement: "Complimentary Shipping Across India on Orders Above ₹1,999",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [collectionCards, setCollectionCards] = useState<CollectionCard[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      const supabase = createClient();

      const [
        { data: settingsData },
        { data: categoryData },
        { data: productData },
        {
          data: { user },
        },
      ] = await Promise.all([
        supabase
          .from("store_settings")
          .select("brand_name, tagline, announcement")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("categories")
          .select("id, name, slug, description")
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("id, category_id, slug, title")
          .eq("status", "active"),
        supabase.auth.getUser(),
      ]);

      if (settingsData) {
        setSettings(settingsData);
      }

      const products = (productData ?? []) as ProductRecord[];
      const productIds = products.map((product) => product.id);

      let images: ProductImageRecord[] = [];

      if (productIds.length > 0) {
        const { data: imageData } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", productIds);

        images = (imageData ?? []) as ProductImageRecord[];
      }

      const firstImageByProduct = new Map<string, string>();

      images.forEach((image) => {
        if (!firstImageByProduct.has(image.product_id)) {
          firstImageByProduct.set(image.product_id, image.image_url);
        }
      });

      const cards = ((categoryData ?? []) as Category[]).map((category) => {
        const productForCategory = products.find(
          (product) =>
            product.category_id === category.id &&
            firstImageByProduct.has(product.id)
        );

        return {
          ...category,
          image_url: productForCategory
            ? firstImageByProduct.get(productForCategory.id) ?? null
            : null,
        };
      });

      setCollectionCards(cards);

      if (user) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setCartCount(count ?? 0);
      }
    }

    loadHomeData();
  }, []);

  useEffect(() => {
    async function searchProducts() {
      const searchTerm = searchQuery.trim();

      if (!isSearchOpen || searchTerm.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const supabase = createClient();

      const { data } = await supabase
        .from("products")
        .select("id, slug, title, price")
        .eq("status", "active")
        .ilike("title", `%${searchTerm}%`)
        .limit(6);

      setSearchResults((data ?? []) as SearchResult[]);
      setIsSearching(false);
    }

    const timeout = window.setTimeout(searchProducts, 250);

    return () => window.clearTimeout(timeout);
  }, [isSearchOpen, searchQuery]);

  const heroImage =
    collectionCards.find((collection) => collection.image_url)?.image_url ??
    null;

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  return (
    <main className="bg-[#FAF7F2] text-[#1F1B1B]">
      <div className="bg-[#4A0F22] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#FAF7F2] sm:text-xs">
        {settings.announcement}
      </div>

      <header className="absolute left-0 right-0 top-[38px] z-30">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            className="grid size-11 place-items-center text-white lg:hidden"
          >
            <Menu size={25} strokeWidth={1.7} />
          </button>

          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.14em] text-white lg:flex">
            <a href="#collections" className="transition hover:text-[#EDE3D5]">
              Collections
            </a>
            <Link href="/about" className="transition hover:text-[#EDE3D5]">
              Our Story
            </Link>
            <Link href="/contact" className="transition hover:text-[#EDE3D5]">
              Contact
            </Link>
          </nav>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-3xl tracking-[0.12em] text-white sm:text-4xl"
          >
            {settings.brand_name}
          </Link>

          <div className="flex items-center gap-1.5 text-white">
            <button
              type="button"
              aria-label="Search sarees"
              onClick={() => setIsSearchOpen(true)}
              className="grid size-11 place-items-center transition hover:text-[#EDE3D5]"
            >
              <Search size={21} strokeWidth={1.7} />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden size-11 place-items-center transition hover:text-[#EDE3D5] sm:grid"
            >
              <Heart size={20} strokeWidth={1.7} />
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative grid size-11 place-items-center transition hover:text-[#EDE3D5]"
            >
              <ShoppingBag size={21} strokeWidth={1.7} />
              <span className="absolute right-0 top-1 grid min-w-4 size-4 place-items-center rounded-full bg-[#B68A42] px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#4A0F22] px-6 py-8 text-[#FAF7F2]"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={closeMenu}
              className="font-serif text-3xl tracking-[0.12em]"
            >
              {settings.brand_name}
            </Link>

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="grid size-11 place-items-center"
            >
              <X size={27} strokeWidth={1.7} />
            </button>
          </div>

          <nav className="mt-14 flex flex-col gap-5 font-serif text-[2.55rem] leading-tight">
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>

            <a href="#collections" onClick={closeMenu}>
              Collections
            </a>

            <Link href="/shop" onClick={closeMenu}>
              Shop All Sarees
            </Link>

            <Link
              href="/account"
              onClick={closeMenu}
              className="flex items-center gap-3"
            >
              <UserRound size={28} strokeWidth={1.4} />
              My Account
            </Link>

            <Link
              href="/cart"
              onClick={closeMenu}
              className="flex items-center gap-3"
            >
              <ShoppingBag size={28} strokeWidth={1.4} />
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>

            <Link href="/account/orders" onClick={closeMenu}>
              My Orders
            </Link>

            <Link href="/contact" onClick={closeMenu}>
              Contact & Support
            </Link>
          </nav>

          <div className="mt-16 border-t border-white/20 pt-6 text-sm leading-7 text-white/70">
            {settings.tagline}
          </div>
        </motion.div>
      )}

      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF7F2] px-5 py-6 text-[#4A0F22] sm:px-8"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="font-serif text-3xl tracking-[0.1em]">
                {settings.brand_name}
              </p>

              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="grid size-11 place-items-center"
              >
                <X size={27} strokeWidth={1.7} />
              </button>
            </div>

            <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
              Search the collection
            </p>

            <div className="mt-4 flex items-center border-b-2 border-[#4A0F22]">
              <Search size={23} className="mr-3 text-[#6E1834]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sarees by name"
                className="h-16 w-full bg-transparent text-xl outline-none placeholder:text-[#6E1834]/40"
              />
            </div>

            <div className="mt-8">
              {searchQuery.trim().length < 2 && (
                <p className="text-sm text-[#6E1834]/70">
                  Type at least two letters to search the collection.
                </p>
              )}

              {isSearching && (
                <p className="text-sm text-[#6E1834]/70">
                  Searching AURELIA sarees…
                </p>
              )}

              {!isSearching &&
                searchQuery.trim().length >= 2 &&
                searchResults.length === 0 && (
                  <p className="text-sm text-[#6E1834]/70">
                    No sarees found. Try another name or view the full shop.
                  </p>
                )}

              <div className="space-y-3">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center justify-between border border-[#E6DACA] bg-white p-5 transition hover:border-[#B68A42]"
                  >
                    <span>
                      <span className="block font-serif text-2xl">
                        {product.title}
                      </span>
                      <span className="mt-1 block text-sm text-[#6E1834]/70">
                        {formatMoney(product.price)}
                      </span>
                    </span>
                    <ArrowRight size={19} />
                  </Link>
                ))}
              </div>

              <Link
                href="/shop"
                onClick={closeSearch}
                className="mt-8 inline-flex min-h-12 items-center gap-2 border border-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]"
              >
                View all sarees
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <section
        id="top"
        className="relative min-h-[640px] overflow-hidden bg-[#4A0F22] sm:min-h-[720px] lg:min-h-[760px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroImage
              ? `linear-gradient(90deg, rgba(31, 10, 16, 0.78) 0%, rgba(31, 10, 16, 0.45) 52%, rgba(31, 10, 16, 0.24) 100%), url("${heroImage}")`
              : "linear-gradient(135deg, #4A0F22 0%, #22060F 52%, #6E1834 100%)",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(182,138,66,0.22),transparent_32%)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.14, delayChildren: 0.2 }}
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-20 sm:pt-48 lg:px-12 lg:pt-56"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#E9C98B]"
          >
            <Sparkles size={13} />
            The Festive Edit 2026
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.65 }}
            className="max-w-3xl font-serif text-5xl leading-[0.95] text-[#FAF7F2] sm:text-7xl lg:text-8xl"
          >
            Elegance That
            <br />
            <span className="italic text-[#E9C98B]">Moves With You.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-6 max-w-md text-sm leading-7 text-[#FAF7F2]/85 sm:text-base"
          >
            A considered collection of timeless sarees, woven for the moments
            you will always remember.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/shop"
              className="group flex min-h-12 items-center justify-center gap-3 bg-[#FAF7F2] px-6 text-xs font-bold uppercase tracking-[0.15em] text-[#4A0F22] transition hover:bg-[#EDE3D5]"
            >
              Shop New Arrivals
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#bridal-edit"
              className="flex min-h-12 items-center justify-center border border-white/50 px-6 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-white hover:bg-white/10"
            >
              Explore Bridal Edit
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-[#E6DACA] bg-[#FFFDF9]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#E6DACA] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Authentically Curated", "Handpicked for lasting beauty"],
            ["Secure Checkout", "Payment activation pending"],
            ["Across India", "Thoughtfully packed and delivered"],
          ].map(([title, text]) => (
            <div key={title} className="px-6 py-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]">
                {title}
              </p>
              <p className="mt-1 text-xs text-[#6E1834]/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="collections"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
              Discover AURELIA
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#4A0F22] sm:text-5xl">
              Shop by Collection
            </h2>
          </div>

          <Link
            href="/shop"
            className="mb-1 hidden items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] sm:flex"
          >
            View all
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="mt-9 -mr-5 flex snap-x gap-4 overflow-x-auto pb-3 pr-5 sm:mr-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pr-0 lg:grid-cols-6">
          {collectionCards.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="min-w-[238px] snap-start sm:min-w-0"
            >
              <Link
                href="/shop"
                className="group relative block h-80 overflow-hidden bg-[#6E1834] sm:h-80"
              >
                {category.image_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 sm:group-hover:scale-105"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(31, 10, 16, 0.82), rgba(31, 10, 16, 0.08) 70%), url("${category.image_url}")`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#8B5260,#4A0F22_70%)]">
                    <Sparkles
                      size={35}
                      className="absolute right-5 top-5 text-[#E9C98B]/80"
                    />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-5 text-[#FAF7F2]">
                  <p className="font-serif text-2xl leading-none">
                    {category.name}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                    Explore
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {collectionCards.length === 0 && (
          <p className="mt-8 text-sm text-[#6E1834]/70">
            Collections will appear here shortly.
          </p>
        )}
      </section>

      <section
        id="bridal-edit"
        className="bg-[#EDE3D5] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-[420px] overflow-hidden bg-[#6E1834] sm:min-h-[560px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: heroImage
                  ? `linear-gradient(0deg, rgba(74,15,34,0.35), rgba(74,15,34,0.08)), url("${heroImage}")`
                  : "linear-gradient(145deg, #8B5260, #4A0F22)",
              }}
            />
            <p className="absolute left-6 top-6 border border-white/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              AURELIA Bridal
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
              Made for your forever
            </p>

            <h2 className="mt-4 max-w-lg font-serif text-5xl leading-[0.98] text-[#4A0F22] sm:text-6xl">
              The Bridal
              <br />
              <span className="italic">Edit</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#6E1834]/85">
              From heirloom Kanchipurams to luminous Banarasis, find the saree
              that feels as unforgettable as the day itself.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-12 items-center gap-3 border border-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
            >
              Discover Bridal Sarees
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="story"
        className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
          The AURELIA Promise
        </p>

        <h2 className="mt-5 font-serif text-4xl leading-tight text-[#4A0F22] sm:text-5xl">
          Tradition, thoughtfully
          <br />
          <span className="italic">reimagined.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#6E1834]/80">
          We believe a saree is more than an outfit. It is a memory in the
          making — a quiet expression of confidence, heritage, and grace.
        </p>

        <Link
          href="/about"
          className="mt-7 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-[#6E1834] underline underline-offset-4"
        >
          Read the AURELIA story
        </Link>
      </section>

      <section className="border-y border-[#E6DACA] bg-[#FFFDF9] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-3">
          <div>
            <Truck
              size={25}
              strokeWidth={1.3}
              className="mx-auto text-[#B68A42]"
            />
            <h3 className="mt-4 font-serif text-2xl text-[#4A0F22]">
              Complimentary Shipping
            </h3>
            <p className="mt-2 text-sm text-[#6E1834]/70">
              On orders above ₹1,999
            </p>
          </div>

          <div>
            <Star
              size={25}
              strokeWidth={1.3}
              className="mx-auto text-[#B68A42]"
            />
            <h3 className="mt-4 font-serif text-2xl text-[#4A0F22]">
              Crafted With Care
            </h3>
            <p className="mt-2 text-sm text-[#6E1834]/70">
              Curated premium collections
            </p>
          </div>

          <div>
            <Heart
              size={25}
              strokeWidth={1.3}
              className="mx-auto text-[#B68A42]"
            />
            <h3 className="mt-4 font-serif text-2xl text-[#4A0F22]">
              Here For You
            </h3>
            <p className="mt-2 text-sm text-[#6E1834]/70">
              Dedicated customer support
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#4A0F22] px-5 pb-8 pt-16 text-[#FAF7F2] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <p className="font-serif text-4xl tracking-[0.12em]">
                {settings.brand_name}
              </p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
                {settings.tagline}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
                Discover
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                <a href="#collections">Collections</a>
                <a href="#bridal-edit">Bridal Edit</a>
                <Link href="/about">About AURELIA</Link>
                <Link href="/shop">Shop Sarees</Link>
                <Link href="/contact">Contact & Support</Link>
                <Link href="/faq">Frequently Asked Questions</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
                Policies
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                <Link href="/shipping-policy">Shipping Policy</Link>
                <Link href="/return-policy">Returns & Exchanges</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms">Terms & Conditions</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
                Stay Connected
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/75"
              >
                <Camera size={17} />
                Contact AURELIA
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-[11px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.brand_name}. All rights
              reserved.
            </p>
            <p>Designed for timeless moments.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}