import type { Metadata } from "next";
import { Mountains_of_Christmas, Outfit } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";

const mountains = Mountains_of_Christmas({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mountains",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Commits on Christmas 🎄",
  description: "Check your GitHub contribution streak on Christmas! Did you push to prod or touch grass?",
  openGraph: {
    title: "Commits on Christmas 🎄",
    description: "Check your GitHub contribution streak on Christmas! Did you push to prod or touch grass?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mountains.variable} ${outfit.variable} antialiased font-sans bg-[#0b1026] text-white overflow-x-hidden`}>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
