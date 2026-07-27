import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifest",
  description:
    "Das Fundament von OneEmergence — Einheit, Freiheit, Liebe. Unsere Werte und Prinzipien.",
  openGraph: {
    title: "Manifest | OneEmergence",
    description:
      "Das Fundament von OneEmergence — Einheit, Freiheit, Liebe. Unsere Werte und Prinzipien.",
    url: "/manifesto",
  },
  twitter: {
    title: "Manifest | OneEmergence",
    description:
      "Das Fundament von OneEmergence — Einheit, Freiheit, Liebe. Unsere Werte und Prinzipien.",
  },
  alternates: { canonical: "/manifesto" },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
