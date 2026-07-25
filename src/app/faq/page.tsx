"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, CircleHelp } from "lucide-react";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse the AURELIA collection, choose a saree, select the quantity, add it to your cart, enter a delivery address, and continue to checkout. Online payments will be enabled once the payment provider is activated.",
  },
  {
    question: "How can I know whether a saree is available?",
    answer:
      "Every product page shows the latest available stock. If a saree is out of stock, it cannot be added to the cart.",
  },
  {
    question: "How do I track my order?",
    answer:
      "After dispatch, courier and tracking details appear in your AURELIA account under My Orders. Please sign in using the account used to place the order.",
  },
  {
    question: "Can I change my delivery address?",
    answer:
      "You can manage saved delivery addresses from your AURELIA account. For an order that has already been confirmed, contact support as soon as possible; address changes may not be possible after dispatch.",
  },
  {
    question: "Can I return or exchange an order?",
    answer:
      "For eligible delivered orders, open the order details in your account and select Request Return or Exchange. The available return window and request status are shown there.",
  },
  {
    question: "How do I use a discount coupon?",
    answer:
      "Coupon offers have conditions such as minimum order value, expiry date, and usage limits. Coupon application will be available during secure checkout once payments are enabled.",
  },
  {
    question: "Why might product colours look slightly different?",
    answer:
      "Saree colours can appear slightly different because of photography, lighting, device display settings, and the handcrafted nature of textile products.",
  },
  {
    question: "How can I contact AURELIA?",
    answer:
      "You can contact AURELIA through WhatsApp, phone, email, or Instagram. The latest support details are available on the Contact & Support page.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            AURELIA Help Centre
          </p>

          <h1 className="mt-3 flex items-center gap-3 font-serif text-4xl text-[#4A0F22] sm:text-5xl">
            <CircleHelp size={34} strokeWidth={1.3} />
            Frequently asked questions
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6E1834]/75">
            Quick answers about shopping with AURELIA. If you still need help,
            our support team is ready to assist you.
          </p>

          <div className="mt-9 divide-y divide-[#E6DACA] border-y border-[#E6DACA]">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-xl text-[#4A0F22]">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[#6E1834] transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="pb-5 pr-8 text-sm leading-7 text-[#6E1834]/75">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-9 border border-[#E6DACA] bg-[#FAF7F2] p-5">
            <p className="text-sm leading-7 text-[#6E1834]/75">
              Still need help? Visit{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#4A0F22] underline underline-offset-4"
              >
                Contact & Support
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}