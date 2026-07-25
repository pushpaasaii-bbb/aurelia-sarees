"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type WishlistButtonProps = {
  productId: string;
  productTitle: string;
  compact?: boolean;
};

export default function WishlistButton({
  productId,
  productTitle,
  compact = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleWishlist() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsSaving(true);

    const { data: existingItem } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItem) {
      await supabase.from("wishlist_items").delete().eq("id", existingItem.id);
      setIsSaved(false);
    } else {
      await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: productId,
      });
      setIsSaved(true);
    }

    setIsSaving(false);
  }

  return (
    <button
      type="button"
      aria-label={
        isSaved
          ? `Remove ${productTitle} from wishlist`
          : `Add ${productTitle} to wishlist`
      }
      onClick={handleWishlist}
      disabled={isSaving}
      className={
        compact
          ? "grid size-9 place-items-center bg-white/90 text-[#4A0F22] transition hover:bg-white disabled:opacity-60"
          : "grid size-11 place-items-center text-[#4A0F22] disabled:opacity-60"
      }
    >
      {isSaving ? (
        <LoaderCircle size={compact ? 16 : 20} className="animate-spin" />
      ) : (
        <Heart
          size={compact ? 16 : 20}
          strokeWidth={1.6}
          className={isSaved ? "fill-[#6E1834] text-[#6E1834]" : ""}
        />
      )}
    </button>
  );
}