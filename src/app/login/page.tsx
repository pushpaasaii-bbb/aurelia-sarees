"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/account");
    router.refresh();
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
            Welcome back
          </p>
          <h1 className="mt-3 font-serif text-4xl text-[#4A0F22]">
            Sign in to AURELIA
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/75">
            Access your saved sarees, delivery addresses, and order history.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#6E1834] underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
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
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-13 w-full items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              {isSubmitting ? "Signing in" : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#6E1834]/70">
            New to AURELIA?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#4A0F22] underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}