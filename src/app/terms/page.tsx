import Link from "next/link";
import { ArrowLeft, FileText, ShoppingBag } from "lucide-react";

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#6E1834]/75">
            These terms explain the basic conditions for using the AURELIA
            website and placing an order with us.
          </p>

          <div className="mt-9 space-y-8">
            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <FileText size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Using this website
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                By accessing or using the AURELIA website, you agree to use it
                lawfully and provide accurate information when creating an
                account, adding a delivery address, or placing an order.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Products and availability
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Product images, colours, prices, descriptions, and availability
                are displayed as accurately as possible. Minor colour variation
                may occur because of lighting, photography, screen settings, or
                the handcrafted nature of textile products. Stock availability
                can change before an order is confirmed.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Orders and pricing
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                All prices are shown in Indian Rupees unless stated otherwise.
                AURELIA may correct an accidental pricing, product, or
                availability error before confirming an order. An order is
                treated as confirmed only after successful payment verification
                and the required stock is reserved.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Coupons and offers
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Promotional codes are subject to their individual conditions,
                including expiry date, minimum order value, usage limit, and
                eligibility. AURELIA may withdraw or deactivate an offer where
                required to prevent misuse or correct an error.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Shipping, returns, and exchanges
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Shipping, return, exchange, and refund requests are governed by
                the policies published on the website. Please review the{" "}
                <Link
                  href="/shipping-policy"
                  className="font-semibold text-[#4A0F22] underline underline-offset-4"
                >
                  Shipping Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/return-policy"
                  className="font-semibold text-[#4A0F22] underline underline-offset-4"
                >
                  Return Policy
                </Link>{" "}
                before placing an order.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Changes to these terms
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                AURELIA may update these terms when the store, payment process,
                policies, or legal requirements change. Continuing to use the
                website after an update means you accept the revised terms.
              </p>
            </section>
          </div>

          <div className="mt-10 border border-[#E6DACA] bg-[#FAF7F2] p-5">
            <p className="text-sm leading-7 text-[#6E1834]/75">
              For information about how customer data is handled, read our{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-[#4A0F22] underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}