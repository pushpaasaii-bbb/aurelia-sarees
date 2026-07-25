"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, LoaderCircle, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AddToCartButtonProps = {
  productId: string;
  productTitle: string;
  quantity: number;
  availableStock: number;
  disabled?: boolean;
};

export default function AddToCartButton({
  productId,
  productTitle,
  quantity,
  availableStock,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    setMessage("");

    if (disabled || availableStock < 1) {
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsAdding(true);

    const { data: existingCartItem, error: existingItemError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItemError) {
      setIsAdding(false);
      setMessage("We could not update your cart. Please try again.");
      return;
    }

    const updatedQuantity = Math.min(
      availableStock,
      (existingCartItem?.quantity ?? 0) + quantity
    );

    const { error: cartError } = existingCartItem
      ? await supabase
          .from("cart_items")
          .update({ quantity: updatedQuantity })
          .eq("id", existingCartItem.id)
      : await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

    setIsAdding(false);

    if (cartError) {
      setMessage("We could not update your cart. Please try again.");
      return;
    }

    setMessage(`${productTitle} was added to your cart.`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className="flex min-h-13 w-full items-center justify-center gap-3 bg-[#4A0F22] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#6E1834] disabled:cursor-not-allowed disabled:bg-[#A78B93]"
      >
        {isAdding ? (
          <>
            <LoaderCircle size={17} className="animate-spin" /> Adding
          </>
        ) : message ? (
          <>
            <Check size={17} /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag size={17} /> Add to Cart
          </>
        )}
      </button>

      {message && (
        <p className="mt-2 text-center text-xs text-emerald-700">{message}</p>
      )}
    </div>
  );
}