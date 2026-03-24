import Link from "next/link";
import { getPosts } from "@/lib/content";

export const metadata = {
  title: "Inhalte | OneEmergence",
  description: "Philosophische Texte, Reflexionen und Einladungen zum Erwachen.",
};

export default function ContentPage() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-oe-deep-space pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.3em] text-oe-aurora-violet uppercase">
            Journal
          </p>
          <h1 className="font-serif text-5xl text-oe-pure-light md:text-6xl">
            Inhalte & Reflexionen
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-oe-pure-light/55 leading-relaxed">
            Philosophische Texte, Meditationsimpulse und Einladungen — als
            Begleitung auf dem Weg zur inneren Einheit.
          </p>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <p className="text-center text-oe-pure-light/40">
            Noch keine Beiträge vorhanden.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                data-cursor-hover
                className="group relative overflow-hidden rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-7 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
              >
                {/* Glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-oe-aurora-violet/10 blur-2xl" />
                </div>

                <div className="relative">
                  <time className="font-mono text-xs text-oe-pure-light/30 tracking-wider">
                    {new Date(post.date).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>

                  <h2 className="mt-3 font-serif text-xl text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold leading-snug">
                    {post.title}
                  </h2>

                  <p className="mt-3 text-sm text-oe-pure-light/50 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-oe-aurora-violet/70">
                    <span>{post.readingTime} Min. Lesezeit</span>
                    <span className="ml-auto transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
