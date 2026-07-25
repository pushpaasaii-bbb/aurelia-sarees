"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type StoreSettings = {
  brand_name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  instagram: string;
};

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreSettings() {
      const supabase = createClient();

      const { data } = await supabase
        .from("store_settings")
        .select(
          "brand_name, phone, whatsapp_number, email, address, instagram"
        )
        .limit(1)
        .maybeSingle();

      setSettings(data as StoreSettings | null);
      setLoading(false);
    }

    loadStoreSettings();
  }, []);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const brandName = settings?.brand_name ?? "AURELIA";
  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
    : null;

  const instagramUrl = settings?.instagram
    ? `https://instagram.com/${settings.instagram.replace("@", "")}`
    : null;

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-8 text-[#1F1B1B] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to {brandName}
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-[#4A0F22] p-7 text-[#FFFDF9] sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E9C98B]">
              AURELIA Support
            </p>

            <h1 className="mt-3 font-serif text-5xl leading-tight">
              We are here to help.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
              Need help with an order, delivery update, product enquiry, or
              return request? Choose the contact method that works best for
              you.
            </p>

            <div className="mt-10 border-t border-white/15 pt-6 text-sm leading-7 text-white/70">
              <p>
                For existing orders, please keep your order number ready so our
                support team can help you faster.
              </p>
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
              Contact details
            </p>

            <div className="mt-6 space-y-4">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex gap-4 border border-[#E6DACA] bg-white p-4 transition hover:border-[#B68A42]"
                >
                  <Phone
                    size={20}
                    className="mt-0.5 shrink-0 text-[#6E1834]"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#B68A42]">
                      Call us
                    </span>
                    <span className="mt-1 block text-sm font-medium text-[#4A0F22]">
                      {settings.phone}
                    </span>
                  </span>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 border border-[#E6DACA] bg-white p-4 transition hover:border-[#B68A42]"
                >
                  <MessageCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-[#6E1834]"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#B68A42]">
                      WhatsApp
                    </span>
                    <span className="mt-1 block text-sm font-medium text-[#4A0F22]">
                      Message {brandName} support
                    </span>
                  </span>
                </a>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex gap-4 border border-[#E6DACA] bg-white p-4 transition hover:border-[#B68A42]"
                >
                  <Mail
                    size={20}
                    className="mt-0.5 shrink-0 text-[#6E1834]"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#B68A42]">
                      Email
                    </span>
                    <span className="mt-1 block text-sm font-medium text-[#4A0F22]">
                      {settings.email}
                    </span>
                  </span>
                </a>
              )}

              {settings?.address && (
                <div className="flex gap-4 border border-[#E6DACA] bg-white p-4">
                  <MapPin
                    size={20}
                    className="mt-0.5 shrink-0 text-[#6E1834]"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#B68A42]">
                      Location
                    </span>
                    <span className="mt-1 block text-sm font-medium leading-6 text-[#4A0F22]">
                      {settings.address}
                    </span>
                  </span>
                </div>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 border border-[#E6DACA] bg-white p-4 transition hover:border-[#B68A42]"
                >
                  <Camera
                    size={20}
                    className="mt-0.5 shrink-0 text-[#6E1834]"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#B68A42]">
                      Instagram
                    </span>
                    <span className="mt-1 block text-sm font-medium text-[#4A0F22]">
                      {settings?.instagram}
                    </span>
                  </span>
                </a>
              )}
            </div>

            <Link
              href="/account/orders"
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834]"
            >
              View my orders
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}