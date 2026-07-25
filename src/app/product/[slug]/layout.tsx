import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type ProductLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const fallbackTitle = "Saree | AURELIA";
  const fallbackDescription =
    "Discover timeless Indian sarees, beautifully curated by AURELIA.";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: product } = await supabase
    .from("products")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const title = product?.title
    ? `${product.title} Saree`
    : "Saree unavailable";

  const description = product?.description || fallbackDescription;
  const productUrl = `${baseUrl}/product/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${title} | AURELIA`,
      description,
      url: productUrl,
      type: "website",
      siteName: "AURELIA",
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}