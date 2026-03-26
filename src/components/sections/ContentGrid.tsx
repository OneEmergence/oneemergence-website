"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import type { Post } from "@/lib/content";

type PostPreview = Omit<Post, "content">;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ContentGrid({ posts }: { posts: PostPreview[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-oe-pure-light/40">
        Noch keine Beiträge vorhanden.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <motion.div
          key={post.slug}
          custom={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          className={index === 0 ? "md:col-span-2 md:row-span-1" : ""}
        >
          <Link
            href={`/journal/${post.slug}`}
            data-cursor-hover
            className="group relative block overflow-hidden rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
          >
            {/* Cover image with parallax */}
            {post.cover && (
              <ParallaxImage
                offset={20}
                className={index === 0 ? "h-48 md:h-64 lg:h-80" : "h-36 sm:h-40 md:h-48"}
              >
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-oe-deep-space/50" />
              </ParallaxImage>
            )}

            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-oe-aurora-violet/10 blur-2xl" />
            </div>

            <div className="relative p-5 sm:p-7">
              <time className="font-mono text-xs text-oe-pure-light/30 tracking-wider">
                {new Date(post.date).toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>

              <h2
                className={`mt-3 font-serif text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold leading-snug ${
                  index === 0 ? "text-2xl md:text-3xl" : "text-xl"
                }`}
              >
                {post.title}
              </h2>

              <p className="mt-3 text-sm text-oe-pure-light/50 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-[11px] text-oe-aurora-violet/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-xs text-oe-aurora-violet/70">
                <span>{post.readingTime} Min. Lesezeit</span>
                <span className="ml-auto transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
