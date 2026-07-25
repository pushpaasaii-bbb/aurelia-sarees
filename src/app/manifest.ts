import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AURELIA — Timeless Elegance, Beautifully Draped",
    short_name: "AURELIA",
    description:
      "Discover timeless Indian sarees, beautifully curated for every celebration.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#4A0F22",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}