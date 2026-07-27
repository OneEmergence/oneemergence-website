import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * `/robots.txt` used to 404, so crawlers never learned the sitemap URL and
 * nothing declared the authenticated funnel off-limits — /portal, /portal/access
 * and /portal/pending could accumulate as thin results a business contact
 * might land on instead of the page you actually sent them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/inner/", "/portal/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
