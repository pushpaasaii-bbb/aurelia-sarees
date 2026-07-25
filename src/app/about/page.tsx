import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] px-5 py-8 text-[#1F1B1B] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6E1834]"
        >
          <ArrowLeft size={17} />
          Back to AURELIA
        </Link>

        <section className="mt-8 grid overflow-hidden border border-[#E6DACA] bg-[#FFFDF9] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[#4A0F22] p-7 text-[#FFFDF9] sm:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E9C98B]">
              The AURELIA Story
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
              Timeless elegance, beautifully draped.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/75">
              AURELIA celebrates the grace, artistry, and emotion woven into
              every saree. We curate pieces for quiet moments, cherished
              celebrations, and every unforgettable occasion in between.
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
              Our collection is designed to make choosing a saree feel
              personal, effortless, and special—from discovering the perfect
              drape to receiving it at your doorstep.
            </p>
          </div>

          <div className="flex flex-col justify-center bg-[#F3E7D8] p-7 sm:p-12">
            <p className="font-serif text-4xl leading-tight text-[#4A0F22]">
              A saree is never just fabric.
            </p>

            <p className="mt-5 text-sm leading-7 text-[#6E1834]/75">
              It carries craftsmanship, confidence, celebration, and memory.
              That is the feeling AURELIA wants to bring to every customer.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-12 w-fit items-center justify-center bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834]"
            >
              Explore the collection
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
            Our promise
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
              <Sparkles size={24} className="text-[#B68A42]" />
              <h2 className="mt-7 font-serif text-3xl text-[#4A0F22]">
                Curated elegance
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/70">
                Sarees selected for their colour, craft, drape, and ability to
                make every occasion feel extraordinary.
              </p>
            </article>

            <article className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
              <Heart size={24} className="text-[#B68A42]" />
              <h2 className="mt-7 font-serif text-3xl text-[#4A0F22]">
                Made personal
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/70">
                A considered shopping experience with clear details, saved
                favourites, delivery support, and order updates.
              </p>
            </article>

            <article className="border border-[#E6DACA] bg-[#FFFDF9] p-6">
              <ShieldCheck size={24} className="text-[#B68A42]" />
              <h2 className="mt-7 font-serif text-3xl text-[#4A0F22]">
                Care beyond checkout
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6E1834]/70">
                From secure order handling to return support, AURELIA is built
                to give customers confidence at every step.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 border border-[#E6DACA] bg-[#FFFDF9] p-7 text-center sm:p-10">
          <h2 className="font-serif text-4xl text-[#4A0F22]">
            Find a saree for your next moment.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6E1834]/70">
            Explore the AURELIA collection or speak with our support team for
            help choosing a piece.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834]"
            >
              Shop sarees
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-[#DCCCB9] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#6E1834] transition hover:border-[#4A0F22]"
            >
              Contact support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}