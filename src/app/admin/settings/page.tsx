"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  id: string;
  brand_name: string;
  tagline: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  instagram: string;
  free_shipping_above: string;
  standard_shipping_charge: string;
  return_window_days: string;
  low_stock_threshold: string;
  announcement: string;
};

const emptySettings: Settings = {
  id: "",
  brand_name: "AURELIA",
  tagline: "Timeless Elegance, Beautifully Draped",
  phone: "",
  whatsapp_number: "",
  email: "",
  address: "India",
  instagram: "",
  free_shipping_above: "1999",
  standard_shipping_charge: "99",
  return_window_days: "7",
  low_stock_threshold: "3",
  announcement: "Complimentary Shipping Across India on Orders Above ₹1,999",
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/settings");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings({
          id: data.id,
          brand_name: data.brand_name ?? "AURELIA",
          tagline: data.tagline ?? "",
          phone: data.phone ?? "",
          whatsapp_number: data.whatsapp_number ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          instagram: data.instagram ?? "",
          free_shipping_above: String(data.free_shipping_above ?? 1999),
          standard_shipping_charge: String(data.standard_shipping_charge ?? 99),
          return_window_days: String(data.return_window_days ?? 7),
          low_stock_threshold: String(data.low_stock_threshold ?? 3),
          announcement: data.announcement ?? "",
        });
      }

      setIsLoading(false);
    }

    loadSettings();
  }, [router]);

  function updateField(key: keyof Settings, value: string) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !settings.brand_name.trim() ||
      !settings.phone.trim() ||
      !settings.whatsapp_number.trim() ||
      !settings.email.trim()
    ) {
      setMessage("Please complete the required business details.");
      return;
    }

    setIsSaving(true);

    const supabase = createClient();

    const payload = {
      brand_name: settings.brand_name.trim(),
      tagline: settings.tagline.trim(),
      phone: settings.phone.trim(),
      whatsapp_number: settings.whatsapp_number.replace(/\D/g, ""),
      email: settings.email.trim(),
      address: settings.address.trim(),
      instagram: settings.instagram.trim(),
      free_shipping_above: Number(settings.free_shipping_above),
      standard_shipping_charge: Number(settings.standard_shipping_charge),
      return_window_days: Number(settings.return_window_days),
      low_stock_threshold: Number(settings.low_stock_threshold),
      announcement: settings.announcement.trim(),
    };

    let saveErrorMessage = "";

    if (settings.id) {
      const { error } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", settings.id);

      if (error) {
        saveErrorMessage = error.message;
      }
    } else {
      const { data: createdSettings, error } = await supabase
        .from("store_settings")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        saveErrorMessage = error.message;
      }

      if (createdSettings) {
        setSettings((current) => ({
          ...current,
          id: createdSettings.id,
        }));
      }
    }

    setIsSaving(false);

    if (saveErrorMessage) {
      setMessage(saveErrorMessage);
      return;
    }

    setMessage("Store settings saved successfully.");
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  const contactFields: Array<[keyof Settings, string, string, string]> = [
    ["brand_name", "Brand name", "text", "AURELIA"],
    ["tagline", "Tagline", "text", "Timeless Elegance, Beautifully Draped"],
    ["phone", "Customer support phone", "tel", "+91 90000 00000"],
    ["whatsapp_number", "WhatsApp number", "tel", "919000000000"],
    ["email", "Customer support email", "email", "hello@aurelia.com"],
    ["instagram", "Instagram", "text", "@aurelia"],
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-16 text-[#1F1B1B]">
      <header className="border-b border-[#E6DACA] bg-[#4A0F22] text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/admin"
            className="font-serif text-2xl tracking-[0.12em]"
          >
            AURELIA
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9C98B]">
            Admin Panel
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link
          href="/admin"
          className="flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Admin Dashboard
        </Link>

        <h1 className="mt-6 font-serif text-5xl text-[#4A0F22]">
          Store Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#6E1834]/70">
          These are temporary values. Update them safely when the client
          confirms final business details.
        </p>

        <form onSubmit={handleSave} className="mt-9 space-y-8">
          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Brand & Contact
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {contactFields.map(([key, label, type, placeholder]) => (
                <label
                  key={key}
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  {label}
                  <input
                    type={type}
                    value={settings[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    placeholder={placeholder}
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Business address
              <textarea
                value={settings.address}
                onChange={(event) => updateField("address", event.target.value)}
                rows={3}
                placeholder="India"
                className="mt-2 block w-full border border-[#DCCCB9] bg-white p-4 text-sm outline-none focus:border-[#6E1834]"
              />
            </label>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Shipping, Returns & Stock
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["free_shipping_above", "Free shipping above ₹"],
                ["standard_shipping_charge", "Standard shipping ₹"],
                ["return_window_days", "Return window days"],
                ["low_stock_threshold", "Low stock warning"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  {label}
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={settings[key as keyof Settings]}
                    onChange={(event) =>
                      updateField(key as keyof Settings, event.target.value)
                    }
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">
              Store Announcement
            </h2>

            <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
              Announcement bar text
              <input
                value={settings.announcement}
                onChange={(event) =>
                  updateField("announcement", event.target.value)
                }
                className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
              />
            </label>
          </section>

          {message && (
            <p
              className={`border p-4 text-sm ${
                message.includes("success")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="ml-auto flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save size={17} />
                Save Store Settings
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}