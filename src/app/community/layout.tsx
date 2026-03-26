import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
  openGraph: {
    title: "Community | OneEmergence",
    description:
      "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
    url: "https://oneemergence.org/community",
  },
  twitter: {
    title: "Community | OneEmergence",
    description:
      "Werde Teil von OneEmergence — lerne die Community kennen, finde deinen Platz und gestalte mit.",
  },
  alternates: { canonical: "https://oneemergence.org/community" },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
