import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Tiefe Reflexionen, Essays und Gedanken aus dem Herzen von OneEmergence.",
  openGraph: {
    title: "Journal | OneEmergence",
    description:
      "Tiefe Reflexionen, Essays und Gedanken aus dem Herzen von OneEmergence.",
    url: "https://oneemergence.org/journal",
  },
  twitter: {
    title: "Journal | OneEmergence",
    description:
      "Tiefe Reflexionen, Essays und Gedanken aus dem Herzen von OneEmergence.",
  },
  alternates: { canonical: "https://oneemergence.org/journal" },
};

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
