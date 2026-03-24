import type { Metadata } from "next";
import { Inter, Cormorant } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AudioProvider } from "@/components/layout/AudioProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneEmergence | Einheit, Freiheit, Liebe",
  description: "Eine Plattform, die Menschen in eine Erfahrung von Einheit, Freiheit und Liebe einlädt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-oe-deep-space">
        <AudioProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AudioProvider>
      </body>
    </html>
  );
}
