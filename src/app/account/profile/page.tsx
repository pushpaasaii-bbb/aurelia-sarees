"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("We could not load your profile details.");
      } else {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      }

      setLoadingProfile(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
        },
        { onConflict: "id" }
      );

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Your profile has been updated successfully.");
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to account
        </Link>

        <section className="mt-10 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F3E7D8] text-[#6E1834]">
              <UserRound size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
                AURELIA Account
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#4A0F22]">
                Your profile
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6E1834]/75">
                Keep your contact information up to date for a smoother order
                and delivery experience.
              </p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="flex items-center gap-3 py-14 text-sm text-[#6E1834]/70">
              <LoaderCircle size={19} className="animate-spin" />
              Loading your profile…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none transition focus:border-[#6E1834]"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none transition focus:border-[#6E1834]"
                />
              </div>

              {error && (
                <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {message && (
                <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex min-h-13 w-full items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving && <LoaderCircle size={17} className="animate-spin" />}
                {saving ? "Saving changes" : "Save profile"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}