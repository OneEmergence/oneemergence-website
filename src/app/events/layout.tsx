import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Gatherings, Readings und digitale Sessions — komm in Kontakt und erlebe OneEmergence live.",
  openGraph: {
    title: "Events | OneEmergence",
    description:
      "Gatherings, Readings und digitale Sessions — komm in Kontakt und erlebe OneEmergence live.",
    url: "https://oneemergence.org/events",
  },
  twitter: {
    title: "Events | OneEmergence",
    description:
      "Gatherings, Readings und digitale Sessions — komm in Kontakt und erlebe OneEmergence live.",
  },
  alternates: { canonical: "https://oneemergence.org/events" },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
