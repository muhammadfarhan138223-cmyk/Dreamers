import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://dreamers-sooty.vercel.app"),
  title: "Dreamers — Offline FSc Study and Punjab Board Practice",
  description:
    "Study FSc Class 11 and 12 with an offline textbook library, chapter practice, learning games and an online AI tutor.",
  openGraph: {
    type: "website",
    siteName: "Dreamers",
    title: "Dreamers — Offline FSc Study",
    description:
      "Read Punjab textbooks, practise chapters and study on your phone.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dreamers",
  },
  icons: { icon: "/brand/favicon.svg", apple: "/brand/icon-192.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07152F",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
