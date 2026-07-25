import Link from "next/link";
import { ArrowLeft, SearchX, ShoppingBag } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-5 py-10 text-[#1F1B1B]">
      <section className="w-full max-w-2xl border border-[#E6DACA] bg-[#FFFDF9] p-8 text-center sm:p-14">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F3E7D8] text-[#6E1834]">
          <SearchX size={31} strokeWidth={1.4} />
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B68A42]">
          AURELIA
        </p>

        <p className="mt-3 font-serif text-7xl text-[#4A0F22]">404</p>

        <h1 className="mt-3 font-serif text-4xl text-[#4A0F22]">
          This page has slipped away.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6E1834]/75">
          The page you are looking for does not exist, may have moved, or may
          no longer be available.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#6E1834]"
          >
            <ArrowLeft size={17} />
            Back to home
          </Link>

          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#DCCCB9] px-5 text-xs font-bold uppercase tracking-[0.13em] text-[#6E1834] transition hover:border-[#4A0F22]"
          >
            <ShoppingBag size={17} />
            Shop sarees
          </Link>
        </div>
      </section>
    </main>
  );
}