import Link from "next/link";
import { ArrowLeft, ClipboardCheck, RotateCcw, ShieldCheck } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-8 text-[#1F1B1B] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to AURELIA
        </Link>

        <section className="mt-8 border border-[#E6DACA] bg-[#FFFDF9] p-6 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            AURELIA Policies
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#4A0F22] sm:text-5xl">
            Returns & Exchanges
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#6E1834]/75">
            We want every AURELIA purchase to feel special. If you need help
            after delivery, you can submit a return or exchange request from
            your order details.
          </p>

          <div className="mt-9 space-y-8">
            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <RotateCcw size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Requesting a return or exchange
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Sign in to your AURELIA account, open the relevant delivered
                order, and select <strong>Request Return or Exchange</strong>.
                The option is shown only when the order is eligible under the
                store’s current return window.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <ClipboardCheck size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Information required
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Please select the reason for your request, add a clear
                description, and upload photographs when relevant. This helps
                the AURELIA team review your request fairly and quickly.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Eligibility and product condition
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Returned items must be in their original condition, unused,
                unwashed, unaltered, and returned with original tags,
                packaging, and any included accessories. Requests are subject
                to review after the product is received and inspected.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Refunds and exchanges
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                After approval and quality review, AURELIA will update you on
                the outcome of the return, exchange, replacement, store credit,
                or refund request. Any approved refund is processed through the
                original payment method, subject to applicable payment-provider
                processing time.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Track your request
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                You can see updates for all return and exchange requests in
                your AURELIA account under{" "}
                <Link
                  href="/account/returns"
                  className="font-semibold text-[#4A0F22] underline underline-offset-4"
                >
                  Returns & Exchanges
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 border border-[#E6DACA] bg-[#FAF7F2] p-5">
            <p className="text-sm leading-7 text-[#6E1834]/75">
              Need delivery information? Read our{" "}
              <Link
                href="/shipping-policy"
                className="font-semibold text-[#4A0F22] underline underline-offset-4"
              >
                Shipping Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}