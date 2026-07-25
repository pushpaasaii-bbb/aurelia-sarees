"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type ProductImageGalleryManagerProps = {
  productId: string;
  productTitle: string;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maximumSize = 5 * 1024 * 1024;

function getStoragePathFromPublicUrl(imageUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

export default function ProductImageGalleryManager({
  productId,
  productTitle,
}: ProductImageGalleryManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState("");

  async function loadImages() {
    const supabase = createClient();

    const { data, error: imagesError } = await supabase
      .from("product_images")
      .select("id, image_url, alt_text, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (imagesError) {
      setError(imagesError.message);
      return;
    }

    setImages(data ?? []);
  }

  useEffect(() => {
    async function initialise() {
      setIsLoading(true);
      await loadImages();
      setIsLoading(false);
    }

    initialise();
  }, [productId]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image only.");
      return;
    }

    if (file.size > maximumSize) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `products/${productId}/${crypto.randomUUID()}.${extension}`;

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

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: productId,
      image_url: publicUrlData.publicUrl,
      alt_text: productTitle,
      sort_order: images.length + 1,
    });

    if (insertError) {
      await supabase.storage.from("product-images").remove([filePath]);
      setError(insertError.message);
      setIsUploading(false);
      return;
    }

    await loadImages();
    setIsUploading(false);
    event.target.value = "";
  }

  async function removeImage(image: ProductImage) {
    const confirmed = window.confirm(
      "Remove this product photo permanently? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setBusyImageId(image.id);

    const supabase = createClient();

    const { error: deleteRowError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (deleteRowError) {
      setError(deleteRowError.message);
      setBusyImageId("");
      return;
    }

    const storagePath = getStoragePathFromPublicUrl(image.image_url);

    if (storagePath) {
      await supabase.storage.from("product-images").remove([storagePath]);
    }

    await loadImages();
    setBusyImageId("");
  }

  async function moveImage(image: ProductImage, direction: "left" | "right") {
    const currentIndex = images.findIndex(
      (currentImage) => currentImage.id === image.id
    );

    const targetIndex =
      direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const targetImage = images[targetIndex];

    setError("");
    setBusyImageId(image.id);

    const supabase = createClient();

    const [firstUpdate, secondUpdate] = await Promise.all([
      supabase
        .from("product_images")
        .update({ sort_order: targetImage.sort_order })
        .eq("id", image.id),
      supabase
        .from("product_images")
        .update({ sort_order: image.sort_order })
        .eq("id", targetImage.id),
    ]);

    if (firstUpdate.error || secondUpdate.error) {
      setError(
        firstUpdate.error?.message ??
          secondUpdate.error?.message ??
          "Could not rearrange product photos."
      );
      setBusyImageId("");
      return;
    }

    await loadImages();
    setBusyImageId("");
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4A0F22]">
            Product photos
          </p>
          <p className="mt-1 text-xs text-[#6E1834]/65">
            Add different angles and close-up fabric details. Dragging is not
            needed — use the arrow buttons to choose the display order.
          </p>
        </div>

        <span className="border border-[#DCCCB9] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6E1834]">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-[#CDBB9F] bg-[#FAF7F2] px-5 text-center transition hover:border-[#6E1834]">
        {isUploading ? (
          <>
            <LoaderCircle
              size={25}
              className="animate-spin text-[#6E1834]"
            />
            <span className="mt-3 text-sm text-[#6E1834]">
              Uploading photo…
            </span>
          </>
        ) : (
          <>
            <ImagePlus
              size={27}
              strokeWidth={1.4}
              className="text-[#B68A42]"
            />
            <span className="mt-3 text-sm font-medium text-[#4A0F22]">
              Add another saree photo
            </span>
            <span className="mt-1 text-xs text-[#6E1834]/60">
              JPG, PNG, or WEBP · Maximum 5 MB each
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

      {isLoading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[#6E1834]/70">
          <LoaderCircle size={17} className="animate-spin" />
          Loading product photos…
        </div>
      ) : images.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden border border-[#E6DACA] bg-white"
            >
              <img
                src={image.image_url}
                alt={image.alt_text ?? `${productTitle} photo ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />

              <div className="flex items-center justify-between gap-2 p-3">
                <p className="text-xs text-[#6E1834]/70">
                  Photo {index + 1}
                  {index === 0 ? " · Main photo" : ""}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(image, "left")}
                    disabled={index === 0 || busyImageId === image.id}
                    aria-label="Move photo left"
                    className="grid size-9 place-items-center border border-[#DCCCB9] text-[#6E1834] disabled:opacity-35"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveImage(image, "right")}
                    disabled={
                      index === images.length - 1 || busyImageId === image.id
                    }
                    aria-label="Move photo right"
                    className="grid size-9 place-items-center border border-[#DCCCB9] text-[#6E1834] disabled:opacity-35"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    disabled={busyImageId === image.id}
                    aria-label={`Remove photo ${index + 1}`}
                    className="grid size-9 place-items-center border border-red-200 text-red-700 disabled:opacity-50"
                  >
                    {busyImageId === image.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[#6E1834]/70">
          No photos yet. Add a clear front photo first.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}