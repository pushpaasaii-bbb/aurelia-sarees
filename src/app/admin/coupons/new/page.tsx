"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  ShieldAlert,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewAdminCouponPage() {
  const router = useRouter();

  const [accessDenied, setAccessDenied] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("0");
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdminAccess() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=/admin/coupons/new");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin"
      );

      if (adminError || !isAdmin) {
        setAccessDenied(true);
      }

      setLoadingPage(false);
    }

    checkAdminAccess();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanCode = code.trim().toUpperCase();
    const parsedDiscountValue = Number(discountValue);
    const parsedMinimumOrderAmount = Number(minimumOrderAmount || 0);

    if (!cleanCode) {
      setError("Please enter a coupon code.");
      return;
    }

    if (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0) {
      setError("Discount value must be greater than zero.");
      return;
    }

    if (discountType === "percentage" && parsedDiscountValue > 100) {
      setError("Percentage discount cannot be more than 100.");
      return;
    }

    if (
      !Number.isFinite(parsedMinimumOrderAmount) ||
      parsedMinimumOrderAmount < 0
    ) {
      setError("Minimum order amount cannot be negative.");
      return;
    }

    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      setError("Expiry date must be after the start date.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error: insertError } = await supabase.from("coupons").insert({
      code: cleanCode,
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: parsedDiscountValue,
      minimum_order_amount: parsedMinimumOrderAmount,
      maximum_discount_amount: maximumDiscountAmount
        ? Number(maximumDiscountAmount)
        : null,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    });

    setSaving(false);

    if (insertError) {
      if (insertError.message.toLowerCase().includes("duplicate")) {
        setError("This coupon code already exists. Please choose another code.");
      } else {
        setError(insertError.message);
      }
      return;
    }

    setMessage("Coupon created successfully.");

    window.setTimeout(() => {
      router.push("/admin/coupons");
      router.refresh();
    }, 900);
  }

  if (loadingPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2]">
        <LoaderCircle size={28} className="animate-spin text-[#6E1834]" />
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5">
        <section className="w-full max-w-md border border-[#E6DACA] bg-[#FFFDF9] p-8 text-center">
          <ShieldAlert className="mx-auto text-[#6E1834]" size={34} />
          <h1 className="mt-4 font-serif text-3xl text-[#4A0F22]">
            Admin access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            You do not have permission to create AURELIA coupons.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex bg-[#4A0F22] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            Return to store
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-6 text-[#1F1B1B] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/coupons"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to coupons
        </Link>

        <section className="mt-7 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            AURELIA Admin
          </p>

          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-[#4A0F22]">
            <Tag size={30} strokeWidth={1.4} />
            Create coupon
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6E1834]/70">
            Set the offer rules carefully. Customers will be able to use only
            active coupons during checkout once payments are enabled.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-7">
            <section className="border border-[#E6DACA] bg-[#FFFBF7] p-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Coupon details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="code"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Coupon code *
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="AURELIA10"
                    required
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] outline-none focus:border-[#6E1834]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discountType"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Discount type *
                  </label>
                  <select
                    id="discountType"
                    value={discountType}
                    onChange={(event) => setDiscountType(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="discountValue"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    {discountType === "percentage"
                      ? "Discount percentage *"
                      : "Discount amount (₹) *"}
                  </label>
                  <input
                    id="discountValue"
                    type="number"
                    min="1"
                    step="0.01"
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                    placeholder={discountType === "percentage" ? "10" : "500"}
                    required
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="minimumOrderAmount"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Minimum order amount (₹)
                  </label>
                  <input
                    id="minimumOrderAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={minimumOrderAmount}
                    onChange={(event) =>
                      setMinimumOrderAmount(event.target.value)
                    }
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label
                      htmlFor="maximumDiscountAmount"
                      className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                    >
                      Maximum discount (₹)
                    </label>
                    <input
                      id="maximumDiscountAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={maximumDiscountAmount}
                      onChange={(event) =>
                        setMaximumDiscountAmount(event.target.value)
                      }
                      placeholder="Optional"
                      className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="usageLimit"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Total usage limit
                  </label>
                  <input
                    id="usageLimit"
                    type="number"
                    min="1"
                    step="1"
                    value={usageLimit}
                    onChange={(event) => setUsageLimit(event.target.value)}
                    placeholder="Optional — unlimited"
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="description"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                >
                  Customer-facing description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Example: 10% off on your first AURELIA order."
                  rows={3}
                  className="mt-2 w-full border border-[#DCCCB9] bg-white px-4 py-3 text-sm outline-none focus:border-[#6E1834]"
                />
              </div>
            </section>

            <section className="border border-[#E6DACA] bg-[#FFFBF7] p-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Validity & status
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startsAt"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Starts at
                  </label>
                  <input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="expiresAt"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]"
                  >
                    Expires at
                  </label>
                  <input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="mt-2 h-12 w-full border border-[#DCCCB9] bg-white px-4 text-sm outline-none focus:border-[#6E1834]"
                  />
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 border border-[#E6DACA] bg-white p-4">
                <span>
                  <span className="block text-sm font-semibold text-[#4A0F22]">
                    Coupon is active
                  </span>
                  <span className="mt-1 block text-xs text-[#6E1834]/65">
                    Turn this off to keep the coupon saved but unavailable.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="size-5 accent-[#4A0F22]"
                />
              </label>
            </section>

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
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Creating coupon
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create coupon
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}