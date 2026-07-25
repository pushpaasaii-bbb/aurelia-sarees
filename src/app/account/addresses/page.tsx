"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, MapPin, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  full_name: string;
  phone: string;
  house_flat: string;
  street_locality: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
  is_default: boolean;
};

const blankAddress = {
  full_name: "",
  phone: "",
  house_flat: "",
  street_locality: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "Home",
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(blankAddress);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?next=/account/addresses");
      return;
    }

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    setAddresses(data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function updateForm(key: keyof typeof blankAddress, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      !form.full_name ||
      !form.phone ||
      !form.house_flat ||
      !form.street_locality ||
      !form.city ||
      !form.state ||
      !/^\d{6}$/.test(form.pincode)
    ) {
      setMessage("Please complete all required fields with a valid 6-digit pincode.");
      return;
    }

    setIsSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      ...form,
      landmark: form.landmark || null,
      is_default: addresses.length === 0,
    });

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm(blankAddress);
    setShowForm(false);
    setMessage("");
    loadAddresses();
  }

  async function setDefault(addressId: string) {
    const supabase = createClient();

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("is_default", true);

    await supabase.from("addresses").update({ is_default: true }).eq("id", addressId);

    loadAddresses();
  }

  async function removeAddress(addressId: string) {
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", addressId);
    loadAddresses();
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
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
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

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
              My Account
            </p>
            <h1 className="mt-2 font-serif text-5xl text-[#4A0F22]">
              Delivery Addresses
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.13em] text-white"
          >
            <Plus size={17} /> Add Address
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="mt-8 border border-[#E6DACA] bg-[#FFFDF9] p-5 sm:p-7">
            <h2 className="font-serif text-3xl text-[#4A0F22]">New Address</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                ["full_name", "Full name", "text"],
                ["phone", "Phone number", "tel"],
                ["house_flat", "House / Flat", "text"],
                ["street_locality", "Street / Locality", "text"],
                ["landmark", "Landmark (optional)", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "Pincode", "text"],
              ].map(([key, label, type]) => (
                <label key={key} className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                  {label}
                  <input
                    type={type}
                    inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined}
                    value={form[key as keyof typeof blankAddress]}
                    onChange={(event) =>
                      updateForm(key as keyof typeof blankAddress, event.target.value)
                    }
                    className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </label>
              ))}

              <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
                Address type
                <select
                  value={form.address_type}
                  onChange={(event) => updateForm("address_type", event.target.value)}
                  className="mt-2 block h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none"
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            {message && <p className="mt-5 text-sm text-red-700">{message}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 flex min-h-12 items-center gap-2 bg-[#4A0F22] px-6 text-xs font-bold uppercase tracking-[0.13em] text-white disabled:opacity-70"
            >
              {isSaving && <LoaderCircle size={17} className="animate-spin" />}
              Save Address
            </button>
          </form>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {addresses.length === 0 ? (
            <div className="border border-dashed border-[#DCCCB9] bg-[#FFFDF9] p-10 text-center md:col-span-2">
              <MapPin size={28} className="mx-auto text-[#B68A42]" />
              <p className="mt-4 font-serif text-3xl text-[#4A0F22]">No saved addresses</p>
              <p className="mt-2 text-sm text-[#6E1834]/70">
                Add an address now to make checkout faster.
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <article key={address.id} className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-2xl text-[#4A0F22]">{address.full_name}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#B68A42]">
                      {address.address_type} {address.is_default ? "· Default" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    aria-label="Delete address"
                    className="grid size-10 place-items-center text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="mt-5 text-sm leading-6 text-[#6E1834]/80">
                  {address.house_flat}, {address.street_locality}
                  {address.landmark ? `, ${address.landmark}` : ""}
                  <br />
                  {address.city}, {address.state} — {address.pincode}
                  <br />
                  {address.phone}
                </p>

                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefault(address.id)}
                    className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834] underline underline-offset-4"
                  >
                    Make default
                  </button>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}