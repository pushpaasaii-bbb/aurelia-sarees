"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Both passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(
        "This reset link is invalid or has expired. Please request a new password reset link."
      );
      return;
    }

    setMessage("Your password has been changed successfully.");

    window.setTimeout(() => {
      router.push("/login");
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7] px-5 py-12 text-[#4A0F22]">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/login"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#8A3C50] transition hover:text-[#4A0F22]"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <section className="border border-[#EBDAC4] bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B8854A]">
            AURELIA Account
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#4A0F22]">
            Choose a new password
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6E1834]/75">
            Create a strong new password for your AURELIA account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]"
              >
                New password
              </label>

              <div className="flex items-center border border-[#EBDAC4] bg-[#FFFBF7] px-3 focus-within:border-[#8A3C50]">
                <LockKeyhole size={18} className="mr-3 text-[#8A3C50]" />
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#6E1834]/40"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]"
              >
                Confirm new password
              </label>

              <div className="flex items-center border border-[#EBDAC4] bg-[#FFFBF7] px-3 focus-within:border-[#8A3C50]">
                <LockKeyhole size={18} className="mr-3 text-[#8A3C50]" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[#6E1834]/40"
                />
              </div>
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message} Redirecting to sign in…
              </p>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(message)}
              className="w-full bg-[#4A0F22] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Save new password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}