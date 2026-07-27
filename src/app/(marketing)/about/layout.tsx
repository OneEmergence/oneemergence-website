import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Wer steckt hinter OneEmergence? Ursprung, Team und die Haltung, die uns antreibt.",
  openGraph: {
    title: "Über uns | OneEmergence",
    description:
      "Wer steckt hinter OneEmergence? Ursprung, Team und die Haltung, die uns antreibt.",
    url: "/about",
  },
  twitter: {
    title: "Über uns | OneEmergence",
    description:
      "Wer steckt hinter OneEmergence? Ursprung, Team und die Haltung, die uns antreibt.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
