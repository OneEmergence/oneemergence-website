import type { Metadata } from "next";
import { Inter, Cormorant } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AudioProvider } from "@/components/layout/AudioProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const baseUrl = "https://oneemergence.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OneEmergence | Einheit, Freiheit, Liebe",
    template: "%s | OneEmergence",
  },
  description:
    "Eine Plattform, die Menschen in eine Erfahrung von Einheit, Freiheit und Liebe einlädt.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: baseUrl,
    siteName: "OneEmergence",
    title: "OneEmergence | Einheit, Freiheit, Liebe",
    description:
      "Eine Plattform, die Menschen in eine Erfahrung von Einheit, Freiheit und Liebe einlädt.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OneEmergence — Einheit, Freiheit, Liebe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OneEmergence | Einheit, Freiheit, Liebe",
    description:
      "Eine Plattform, die Menschen in eine Erfahrung von Einheit, Freiheit und Liebe einlädt.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-oe-deep-space cursor-none">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <AudioProvider>
              <CustomCursor />
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </AudioProvider>
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
