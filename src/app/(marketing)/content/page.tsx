import { getPosts } from "@/lib/content";
import { ContentGrid } from "@/components/sections/ContentGrid";

export const metadata = {
  title: "Inhalte | OneEmergence",
  description: "Philosophische Texte, Reflexionen und Einladungen zum Erwachen.",
};

export default function ContentPage() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-oe-deep-space pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 md:mb-16 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-oe-aurora-violet uppercase">
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

        {/* Grid with parallax cover images */}
        <ContentGrid posts={posts} />
      </div>
    </div>
  );
}
