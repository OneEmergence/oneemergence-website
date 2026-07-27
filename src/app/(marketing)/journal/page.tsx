import { getPosts } from "@/lib/content";
import { ContentGrid } from "@/components/sections/ContentGrid";
import { LayerAtmosphere } from "@/components/motion/LayerAtmosphere";

/**
 * The journal index.
 *
 * It has to exist: every article canonicalises to `/journal/<slug>` and links
 * back here, and the sitemap advertises it. Previously this route 404'd while
 * `journal/layout.tsx` still told search engines the articles lived under it.
 *
 * This is the old `/content` page, which was an orphaned duplicate of exactly
 * this view; `/content` now redirects to `/library` (see next.config.ts).
 */
export const metadata = {
  title: "Journal",
  description:
    "Philosophische Texte, Reflexionen und Einladungen zum Erwachen.",
  alternates: { canonical: "/journal" },
  openGraph: { url: "/journal" },
};

export default function JournalIndexPage() {
  const posts = getPosts();

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-oe-deep-space pt-24 pb-16 md:pt-28 md:pb-20">
      <LayerAtmosphere variant="solarpunk" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 md:mb-16 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-oe-living-green uppercase">
            Journal
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-oe-pure-light md:text-6xl">
            Inhalte & Reflexionen
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-oe-pure-light/55 leading-relaxed">
            Philosophische Texte, Meditationsimpulse und Einladungen — als
            Begleitung auf dem Weg zur inneren Einheit.
          </p>
        </div>

        <ContentGrid posts={posts} />
      </div>
    </div>
  );
}
