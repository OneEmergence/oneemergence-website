import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
  openGraph: {
    title: "Community | OneEmergence",
    description:
      "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
    url: "/community",
  },
  twitter: {
    title: "Community | OneEmergence",
    description:
      "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
  },
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
