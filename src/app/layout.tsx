import type { Metadata } from "next";
import { Inter, Cormorant } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { IntensityProvider } from "@/components/providers/IntensityProvider";
import { INTENSITY_SCRIPT } from "@/components/providers/intensity-script";
import { defaultLocale } from "@/i18n/config";
import { siteUrl } from "@/lib/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OneEmergence | Einheit, Freiheit, Liebe",
    template: "%s | OneEmergence",
  },
  description:
    "Eine Plattform, die Menschen in eine Erfahrung von Einheit, Freiheit und Liebe einlädt.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
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
  // NO `alternates.canonical` here. Metadata is inherited, so a root canonical
  // makes every route that does not declare its own tell Google "I am a
  // duplicate of the homepage" — which self-deindexed /library, /experiences
  // and every library detail page. The home page sets its own canonical.
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

/**
 * The root layout deliberately does NOT resolve a locale.
 *
 * `getLocale()` here would run before any child layout could pin one, so the
 * cookie read in `src/i18n/request.ts` would fire on every route and make the
 * whole app dynamic. Instead each route group owns its own
 * `NextIntlClientProvider`: the public tree pins `defaultLocale` and
 * prerenders, the portal reads the cookie and stays dynamic.
 *
 * `lang` is the public default; the portal re-declares it on its own wrapper.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={`${inter.variable} ${cormorant.variable}`}
      // The inline script below writes `data-intensity` before React hydrates,
      // so this element's attributes intentionally differ from the server
      // markup. Scoped to <html> only — child mismatches still surface.
      suppressHydrationWarning
    >
      <body className="bg-background font-sans text-foreground">
        {/* Resolves data-intensity before hydration so the CSS gates apply on
            the first paint. `next/script` rather than a raw <script>, which
            React warns about inside a component. See intensity-script.ts. */}
        <Script
          id="oe-intensity"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: INTENSITY_SCRIPT }}
        />
        <IntensityProvider>{children}</IntensityProvider>
      </body>
    </html>
  );
}
