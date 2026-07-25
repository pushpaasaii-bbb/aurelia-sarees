"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Camera,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
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

const collectionImages = [
  "https://images.unsplash.com/photo-1610189020386-8f6972e539ee?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1594736797933-d0e501ba2fe6?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1585488434455-0b3e54cfc4f2?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=85",
];

const defaultSettings: StoreSettings = {
  brand_name: "AURELIA",
  tagline: "Timeless Elegance, Beautifully Draped",
  announcement: "Complimentary Shipping Across India on Orders Above ₹1,999",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      const supabase = createClient();

      const [{ data: settingsData }, { data: categoryData }] =
        await Promise.all([
          supabase
            .from("store_settings")
            .select("brand_name, tagline, announcement")
            .single(),
          supabase
            .from("categories")
            .select("id, name, slug, description")
            .order("sort_order", { ascending: true }),
        ]);

      if (settingsData) {
        setSettings(settingsData);
      }

      if (categoryData) {
        setCategories(categoryData);
      }
    }

    loadHomeData();
  }, []);

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
            <Menu size={23} strokeWidth={1.7} />
          </button>

          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.14em] text-white lg:flex">
            <a href="#collections" className="transition hover:text-[#EDE3D5]">
              Collections
            </a>
            <a href="#story" className="transition hover:text-[#EDE3D5]">
              Our Story
            </a>
          </nav>

          <a
            href="#top"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-3xl tracking-[0.12em] text-white sm:text-4xl"
          >
            {settings.brand_name}
          </a>

          <div className="flex items-center gap-1.5 text-white">
            <button
              type="button"
              aria-label="Search"
              className="grid size-11 place-items-center transition hover:text-[#EDE3D5]"
            >
              <Search size={20} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="hidden size-11 place-items-center transition hover:text-[#EDE3D5] sm:grid"
            >
              <Heart size={20} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label="Shopping bag"
              className="relative grid size-11 place-items-center transition hover:text-[#EDE3D5]"
            >
              <ShoppingBag size={20} strokeWidth={1.7} />
              <span className="absolute right-0 top-1 grid size-4 place-items-center rounded-full bg-[#B68A42] text-[9px] font-bold text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#4A0F22] px-6 py-8 text-[#FAF7F2]"
        >
          <div className="flex items-center justify-between">
            <p className="font-serif text-3xl tracking-[0.12em]">
              {settings.brand_name}
            </p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="grid size-11 place-items-center"
            >
              <X size={25} strokeWidth={1.7} />
            </button>
          </div>

          <nav className="mt-18 flex flex-col gap-6 font-serif text-4xl">
            <a href="#collections" onClick={() => setIsMenuOpen(false)}>
              Collections
            </a>
            <a href="#story" onClick={() => setIsMenuOpen(false)}>
              Our Story
            </a>
            <a href="#journal" onClick={() => setIsMenuOpen(false)}>
              The Aurelia Journal
            </a>
            <Link href="/shop" onClick={() => setIsMenuOpen(false)}>
              Shop All
            </Link>
          </nav>

          <div className="absolute bottom-10 left-6 right-6 border-t border-white/20 pt-6 text-sm text-white/70">
            Timeless Elegance, Beautifully Draped
          </div>
        </motion.div>
      )}

      <section
        id="top"
        className="relative flex min-h-[720px] items-end overflow-hidden bg-[#4A0F22] sm:min-h-[760px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(31, 10, 16, 0.72) 0%, rgba(31, 10, 16, 0.35) 50%, rgba(31, 10, 16, 0.15) 100%), url('https://images.unsplash.com/photo-1610189020386-8f6972e539ee?auto=format&fit=crop&w=1800&q=90')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(182,138,66,0.22),transparent_32%)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15, delayChildren: 0.25 }}
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-18 pt-44 sm:px-8 sm:pb-22 lg:px-12"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#E9C98B]"
          >
            <Sparkles size={13} />
            The Festive Edit 2026
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="max-w-3xl font-serif text-5xl leading-[0.95] text-[#FAF7F2] sm:text-7xl lg:text-8xl"
          >
            Elegance That
            <br />
            <span className="italic text-[#E9C98B]">Moves With You.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.65 }}
            className="mt-6 max-w-md text-sm leading-7 text-[#FAF7F2]/85 sm:text-base"
          >
            A considered collection of timeless sarees, woven for the moments
            you will always remember.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.65 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#collections"
              className="group flex min-h-12 items-center justify-center gap-3 bg-[#FAF7F2] px-6 text-xs font-bold uppercase tracking-[0.15em] text-[#4A0F22] transition hover:bg-[#EDE3D5]"
            >
              Shop New Arrivals
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
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
            ["Secure Payments", "Protected checkout, every time"],
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

      <section id="collections" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B68A42]">
              Discover AURELIA
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#4A0F22] sm:text-5xl">
              Shop by Collection
            </h2>
          </div>
          <a
            href="#collections"
            className="mb-1 hidden items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] sm:flex"
          >
            View all <ChevronRight size={15} />
          </a>
        </div>

        <div className="mt-10 -mr-5 flex snap-x gap-4 overflow-x-auto pb-3 pr-5 sm:mr-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pr-0 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.a
              key={category.id}
              href="#collections"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="group relative h-72 min-w-48 snap-start overflow-hidden bg-[#EDE3D5] sm:h-80 sm:min-w-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 sm:group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(31, 10, 16, 0.74), transparent 60%), url('${collectionImages[index % collectionImages.length]}')`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 text-[#FAF7F2]">
                <p className="font-serif text-2xl leading-none">{category.name}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <section id="bridal-edit" className="bg-[#EDE3D5] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-[460px] overflow-hidden bg-[#6E1834] sm:min-h-[560px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(74,15,34,0.25), rgba(74,15,34,0.05)), url('https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=1100&q=90')",
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
            <a
              href="#collections"
              className="mt-8 inline-flex min-h-12 items-center gap-3 border border-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22] transition hover:bg-[#4A0F22] hover:text-white"
            >
              Discover Bridal Sarees <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 lg:py-28">
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
      </section>

      <section className="border-y border-[#E6DACA] bg-[#FFFDF9] px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-3">
          {[
            [Truck, "Complimentary Shipping", "On orders above ₹1,999"],
            [Star, "Crafted With Care", "Curated premium collections"],
            [Heart, "Here For You", "Dedicated customer support"],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Truck;

            return (
              <div key={title as string}>
                <FeatureIcon
                  size={25}
                  strokeWidth={1.3}
                  className="mx-auto text-[#B68A42]"
                />
                <h3 className="mt-4 font-serif text-2xl text-[#4A0F22]">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm text-[#6E1834]/70">
                  {text as string}
                </p>
              </div>
            );
          })}
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
          <a href="#story">Our Story</a>
          <a href="/shop">Shop Sarees</a>
          <a href="/contact">Contact & Support</a>
          <a href="/faq">Frequently Asked Questions</a>
          <a href="/about">About AURELIA</a>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
          Policies
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
          <a href="/shipping-policy">Shipping Policy</a>
          <a href="/return-policy">Returns & Exchanges</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
          Stay Connected
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-white/75"
        >
          <Camera size={17} />
          Instagram
        </a>
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