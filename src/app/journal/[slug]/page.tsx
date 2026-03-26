import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getPosts, getAdjacentPosts } from "@/lib/content";

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | OneEmergence`,
    description: post.excerpt,
  };
}

export default async function JournalPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <div className="min-h-screen bg-oe-deep-space">
      {/* Hero Cover */}
      {post.cover && (
        <div className="relative h-[220px] sm:h-[300px] md:h-[400px] w-full">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
          {/* Gradient overlay: transparent top → oe-deep-space bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1F]" />
        </div>
      )}

      <div className={`mx-auto max-w-3xl px-6 ${post.cover ? "relative -mt-20 pb-24" : "pt-28 pb-24"}`}>
        <Link
          href="/content"
          className="mb-10 inline-flex items-center gap-2 text-sm text-oe-pure-light/40 transition-colors hover:text-oe-pure-light/70"
        >
          ← Zurück zur Übersicht
        </Link>

        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-oe-aurora-violet uppercase">
          Journal
        </p>

        <h1 className="font-serif text-4xl leading-tight text-oe-pure-light md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-oe-pure-light/40">
          <time>
            {new Date(post.date).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime} Min. Lesezeit</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-xs text-oe-aurora-violet/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-oe-aurora-violet/30 via-oe-spirit-cyan/20 to-transparent" />

        {/* Prose */}
        <article
          className="prose prose-invert prose-base sm:prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-oe-pure-light
            prose-h2:text-3xl prose-h3:text-xl
            prose-p:text-oe-pure-light/70 prose-p:leading-relaxed
            prose-a:text-oe-aurora-violet prose-a:no-underline hover:prose-a:text-oe-solar-gold
            prose-blockquote:border-oe-aurora-violet/50 prose-blockquote:text-oe-pure-light/60
            prose-strong:text-oe-pure-light
            prose-hr:border-oe-pure-light/10
            prose-ol:text-oe-pure-light/70 prose-ul:text-oe-pure-light/70
            prose-li:marker:text-oe-aurora-violet"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Prev/Next Navigation */}
        {(prev || next) && (
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/journal/${prev.slug}`}
                className="group rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
              >
                <span className="text-xs text-oe-pure-light/30 uppercase tracking-wider">
                  ← Vorheriger
                </span>
                <p className="mt-2 font-serif text-lg text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold leading-snug">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/journal/${next.slug}`}
                className="group rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 text-right transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
              >
                <span className="text-xs text-oe-pure-light/30 uppercase tracking-wider">
                  Nächster →
                </span>
                <p className="mt-2 font-serif text-lg text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold leading-snug">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 p-8 text-center">
          <p className="font-serif text-xl text-oe-pure-light">
            Bereit, tiefer einzutauchen?
          </p>
          <p className="mt-2 text-sm text-oe-pure-light/50">
            Entdecke unsere Community und kommende Gatherings.
          </p>
          <Link
            href="/community"
            data-cursor-hover
            className="mt-5 inline-block rounded-full bg-oe-aurora-violet px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Community beitreten
          </Link>
        </div>
      </div>
    </div>
  );
}
