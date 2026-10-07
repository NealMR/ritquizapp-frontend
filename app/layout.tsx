import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = { title: "RIT Quiz", description: "Live quizzes and polls for RIT classrooms" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1B2340" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
