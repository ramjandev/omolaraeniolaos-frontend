import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Geist_Mono,
  Hanken_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/Providers";
import { ToastProvider } from "@/components/ToastProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "McEniesVite | Events Made Effortless",
    template: "%s | McEniesVite",
  },
  description:
    "Manage events, guests, invitations, and event-day experiences in one place.",
  icons: {
    icon: "/images/logo-mark.png",
    apple: "/images/logo-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${cormorant.variable} ${hanken.variable} antialiased`}
      >
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
