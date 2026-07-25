"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user && !data.session) {
      setMessage(
        "Account created. Please check your email and confirm your account before logging in."
      );
      return;
    }

    setMessage("Account created successfully. You can now continue shopping.");
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} /> Back to AURELIA
        </Link>

        <section className="mt-10 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            Welcome to AURELIA
          </p>
          <h1 className="mt-3 font-serif text-4xl text-[#4A0F22]">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/75">
            Save your favourites, manage addresses, and track every order in
            one place.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Full name
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                required
                className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none transition focus:border-[#6E1834]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none transition focus:border-[#6E1834]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="h-12 w-full border border-[#DCCCB9] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#6E1834]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-[#6E1834]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-[#6E1834]/60">
                Use at least 8 characters.
              </p>
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
              disabled={isSubmitting}
              className="flex min-h-13 w-full items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              {isSubmitting ? "Creating account" : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#6E1834]/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#4A0F22] underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}