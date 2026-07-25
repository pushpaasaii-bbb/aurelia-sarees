import Link from "next/link";
import { ArrowLeft, PackageCheck, Truck } from "lucide-react";

export default function ShippingPolicyPage() {
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
            Shipping Policy
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#6E1834]/75">
            Every AURELIA saree is prepared with care and securely packed before
            dispatch. This page explains how shipping and delivery updates work.
          </p>

          <div className="mt-9 space-y-8">
            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <Truck size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Delivery coverage
                </h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                AURELIA currently delivers across India. Delivery availability
                for your location will be confirmed during checkout.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Shipping charges
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Complimentary shipping applies to eligible orders, including
                orders above ₹1,999. Any applicable shipping charge will always
                be shown clearly before you place an order.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Dispatch and delivery time
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Orders are generally prepared after payment confirmation.
                Delivery timelines can vary by destination, courier availability,
                public holidays, weather conditions, and other operational
                circumstances. Your order page will show delivery updates once
                your order has been dispatched.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <PackageCheck size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Tracking your order
                </h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                Once dispatched, the courier and tracking details will appear in
                your AURELIA account under{" "}
                <Link
                  href="/account/orders"
                  className="font-semibold text-[#4A0F22] underline underline-offset-4"
                >
                  My Orders
                </Link>
                . Please ensure that your delivery address and phone number are
                accurate when placing an order.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Delivery concerns
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                If a parcel is delayed, damaged in transit, or marked delivered
                but has not reached you, please contact AURELIA support promptly
                with your order number so the team can assist you.
              </p>
            </section>
          </div>

          <div className="mt-10 border border-[#E6DACA] bg-[#FAF7F2] p-5">
            <p className="text-sm leading-7 text-[#6E1834]/75">
              For return and exchange eligibility, please read the{" "}
              <Link
                href="/return-policy"
                className="font-semibold text-[#4A0F22] underline underline-offset-4"
              >
                Return Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}