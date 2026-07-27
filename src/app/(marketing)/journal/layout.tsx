import type { Metadata } from "next";

/**
 * Defaults for the journal tree.
 *
 * Deliberately no `alternates.canonical` and no `openGraph.url`: metadata is
 * inherited, and `[slug]/generateMetadata` used to return only title +
 * description — so every article emitted a canonical and an og:url pointing at
 * the index, and all three articles unfurled as the same card. Per-article
 * canonical/OG now live in `[slug]/page.tsx`; the index sets its own.
 */
export const metadata: Metadata = {
  title: "Journal",
  description:
    "Tiefe Reflexionen, Essays und Gedanken aus dem Herzen von OneEmergence.",
};

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
