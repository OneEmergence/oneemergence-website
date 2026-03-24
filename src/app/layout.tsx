import type { Metadata } from "next";
import { Inter, Cormorant } from "next/font/google";
import "./globals.css";

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
      <body className="font-sans">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
