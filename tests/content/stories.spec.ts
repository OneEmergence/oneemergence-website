import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { StoryMeta } from "../../src/lib/schemas/content";

/**
 * The story system's contract: an .mdx file in src/content/stories/ is a live
 * page at /s/<filename>, and `listed: false` keeps it out of the index and the
 * sitemap without breaking the direct link.
 *
 * Frontmatter is validated here rather than only at build time so a bad field
 * fails in seconds instead of after a full `next build`.
 */
const storiesDir = path.join(process.cwd(), "src/content/stories");
const storyFiles = () =>
  fs.existsSync(storiesDir) ? fs.readdirSync(storiesDir).filter((f) => /\.mdx?$/.test(f)) : [];

function read(file: string) {
  const raw = fs.readFileSync(path.join(storiesDir, file), "utf-8");
  const { data, content } = matter(raw);
  return { meta: StoryMeta.parse({ ...data, slug: file.replace(/\.mdx?$/, "") }), content };
}

test.describe("Story pages", () => {
  test("every story has frontmatter matching StoryMeta", () => {
    const files = storyFiles();
    expect(files.length, "expected at least the reference story").toBeGreaterThan(0);
    for (const file of files) {
      expect(() => read(file), `${file} frontmatter`).not.toThrow();
    }
  });

  test("published+listed stories are reachable and indexable", async ({ page }) => {
    const listed = storyFiles()
      .map(read)
      .filter(({ meta }) => meta.published && meta.listed);

    for (const { meta } of listed) {
      const res = await page.goto(`/s/${meta.slug}`);
      expect(res?.status(), `/s/${meta.slug}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(meta.title);
    }

    const index = await page.goto("/s");
    expect(index?.status()).toBe(200);
    for (const { meta } of listed) {
      await expect(page.locator(`a[href="/s/${meta.slug}"]`).first()).toBeVisible();
    }
  });

  test("unlisted stories resolve by direct link but stay out of index and sitemap", async ({
    page,
    request,
  }) => {
    const unlisted = storyFiles()
      .map(read)
      .filter(({ meta }) => meta.published && !meta.listed);
    if (unlisted.length === 0) test.skip(true, "no unlisted stories authored yet");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    await page.goto("/s");

    for (const { meta } of unlisted) {
      expect(sitemap, `${meta.slug} must not be in the sitemap`).not.toContain(`/s/${meta.slug}`);
      await expect(page.locator(`a[href="/s/${meta.slug}"]`)).toHaveCount(0);

      const res = await page.goto(`/s/${meta.slug}`);
      expect(res?.status(), `direct link to /s/${meta.slug}`).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
  });

  test("draft stories 404", async ({ page }) => {
    const drafts = storyFiles()
      .map(read)
      .filter(({ meta }) => !meta.published);
    if (drafts.length === 0) test.skip(true, "no drafts authored");

    for (const { meta } of drafts) {
      const res = await page.goto(`/s/${meta.slug}`);
      expect(res?.status(), `/s/${meta.slug}`).toBe(404);
    }
  });
});
