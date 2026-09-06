import { MetadataRoute } from "next";
import { getPosts, getStories, getLibraryItems } from "@/lib/content";
import { siteUrl } from "@/lib/env";

/**
 * Rules this file follows, each one a defect it used to have:
 *
 * - Never submit a `noindex` page. The two /legal/* routes set
 *   `robots: noindex`; Search Console reports a submitted-but-noindex URL as
 *   an error and distrusts the whole sitemap for it.
 * - No fabricated `lastModified`. Static routes used to stamp the build time,
 *   telling crawlers all eleven pages changed on every deploy — after which
 *   the field is simply ignored. Content routes carry real dates instead.
 * - One URL per article. Journal posts appear only as /journal/<slug>;
 *   /library/journal/<slug> permanently redirects there, so `getLibraryItems`
 *   is filtered to avoid submitting each post twice.
 * - Nothing unlisted. `listed: false` stories are private links.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/manifesto`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/library`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/journal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/s`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/experiences`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/map`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/events`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/community`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/brand`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const journalRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${siteUrl}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Sacred content only — journal entries are already covered above.
  const libraryRoutes: MetadataRoute.Sitemap = getLibraryItems()
    .filter((item) => item.libraryType !== "journal")
    .map((item) => ({
      url: `${siteUrl}/library/${item.libraryType}/${item.slug}`,
      lastModified: new Date(item.date),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const storyRoutes: MetadataRoute.Sitemap = getStories()
    .filter((s) => s.meta.listed)
    .map(({ meta }) => ({
      url: `${siteUrl}/s/${meta.slug}`,
      lastModified: new Date(meta.updated ?? meta.date),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...journalRoutes, ...libraryRoutes, ...storyRoutes];
}
