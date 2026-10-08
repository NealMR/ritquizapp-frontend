import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RIT Quiz",
    short_name: "RIT Quiz",
    description: "Live quizzes and polls for RIT classrooms",
    start_url: "/student",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    id: "/",
    scope: "/",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
