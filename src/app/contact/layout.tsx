import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Schreib uns — Anfragen, Kooperationen, Presse. Wir lesen jede Nachricht persönlich.",
  openGraph: {
    title: "Kontakt | OneEmergence",
    description:
      "Schreib uns — Anfragen, Kooperationen, Presse. Wir lesen jede Nachricht persönlich.",
    url: "https://oneemergence.org/contact",
  },
  twitter: {
    title: "Kontakt | OneEmergence",
    description:
      "Schreib uns — Anfragen, Kooperationen, Presse. Wir lesen jede Nachricht persönlich.",
  },
  alternates: { canonical: "https://oneemergence.org/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
