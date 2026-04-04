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
import { IntensityProvider } from "@/components/providers/IntensityProvider";

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
          <IntensityProvider>
          <SmoothScroll>
            <AudioProvider>
              <CustomCursor />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-oe-aurora-violet focus:text-oe-pure-light focus:outline-none focus:ring-2 focus:ring-oe-solar-gold"
              >
                Zum Inhalt springen
              </a>
              <Navbar />
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <Footer />
            </AudioProvider>
          </SmoothScroll>
          </IntensityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
