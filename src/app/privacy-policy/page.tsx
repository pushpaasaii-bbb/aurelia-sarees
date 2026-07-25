import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#6E1834]/75">
            Your trust matters to AURELIA. This policy explains what customer
            information we collect, why we use it, and how we protect it.
          </p>

          <div className="mt-9 space-y-8">
            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <LockKeyhole size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Information we collect
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                We collect information you provide when creating an account,
                placing an order, saving an address, contacting support, or
                submitting a return request. This can include your name, email
                address, phone number, delivery address, order details, and
                return-request information.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                How we use information
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                AURELIA uses your information to provide and improve the
                store, process and deliver orders, communicate order updates,
                respond to support requests, prevent misuse, and meet legal or
                operational requirements.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Payments and delivery partners
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                When online payments are enabled, payments are handled by a
                secure payment provider. AURELIA does not store complete card,
                UPI, or banking credentials. We may share only the necessary
                delivery information with trusted courier partners to fulfil
                and track your order.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={21} className="text-[#6E1834]" />
                <h2 className="font-serif text-2xl text-[#4A0F22]">
                  Data protection
                </h2>
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                We use access controls and secure service providers to protect
                account and order information. No system can guarantee absolute
                security, so please keep your account password private and
                contact us promptly if you suspect unauthorised account access.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Your choices
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                You can update your name and phone number from your{" "}
                <Link
                  href="/account/profile"
                  className="font-semibold text-[#4A0F22] underline underline-offset-4"
                >
                  account profile
                </Link>
                . You may also contact AURELIA support with questions about the
                personal information associated with your account.
              </p>
            </section>

            <section className="border-l-2 border-[#B68A42] pl-5">
              <h2 className="font-serif text-2xl text-[#4A0F22]">
                Policy updates
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#6E1834]/75">
                This policy may be updated when the store, payment process, or
                legal requirements change. The latest version will always be
                published on this page.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}