"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "Password reset link sent. Please check your email inbox and spam folder."
    );
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
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6E1834]/75">
            Enter your registered email address. We will send you a secure
            password reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#4A0F22]"
              >
                Email address
              </label>

              <div className="flex items-center border border-[#EBDAC4] bg-[#FFFBF7] px-3 focus-within:border-[#8A3C50]">
                <Mail size={18} className="mr-3 text-[#8A3C50]" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
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
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A0F22] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#6E1834]/75">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#8A3C50] underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}