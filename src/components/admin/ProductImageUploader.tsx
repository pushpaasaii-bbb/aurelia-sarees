"use client";

import { ChangeEvent, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProductImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumSize = 5 * 1024 * 1024;

export default function ProductImageUploader({
  value,
  onChange,
}: ProductImageUploaderProps) {
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image only.");
      return;
    }

    if (file.size > maximumSize) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `products/${crypto.randomUUID()}.${extension}`;

    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    onChange(data.publicUrl);
    setIsUploading(false);
  }

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
        Product photo
      </label>

      {value ? (
        <div className="mt-2 overflow-hidden border border-[#DCCCB9] bg-white">
          <div
            className="aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: `url("${value}")` }}
          />
          <div className="flex items-center justify-between gap-3 p-3">
            <p className="truncate text-xs text-[#6E1834]/70">
              Product image uploaded
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex min-h-10 items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-red-700"
            >
              <Trash2 size={15} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="mt-2 flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-[#CDBB9F] bg-[#FAF7F2] px-5 text-center transition hover:border-[#6E1834]">
          {isUploading ? (
            <>
              <LoaderCircle size={25} className="animate-spin text-[#6E1834]" />
              <span className="mt-3 text-sm text-[#6E1834]">Uploading photo…</span>
            </>
          ) : (
            <>
              <ImagePlus size={27} strokeWidth={1.4} className="text-[#B68A42]" />
              <span className="mt-3 text-sm font-medium text-[#4A0F22]">
                Click to upload a saree photo
              </span>
              <span className="mt-1 text-xs text-[#6E1834]/60">
                JPG, PNG, or WEBP · Maximum 5 MB
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}