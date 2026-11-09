import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Providers } from "@/store/Providers";
import { ToastProvider } from "@/components/ToastProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
      >
        <I18nProvider initialLocale={locale}>
          <Providers>
            {children}
            <ToastProvider />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
