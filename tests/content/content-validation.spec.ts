import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const contentDir = path.join(process.cwd(), "src/content/journal");

test.describe("Content validation", () => {
  test("all journal markdown files exist and are non-empty", () => {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = fs.readFileSync(path.join(contentDir, file), "utf-8");
      expect(content.length, `${file} should not be empty`).toBeGreaterThan(0);
    }
  });

  test("all journal files have valid frontmatter", () => {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(contentDir, file), "utf-8");

      // Check frontmatter delimiters exist
      expect(content.startsWith("---"), `${file} should start with frontmatter`).toBe(true);
      const secondDelimiter = content.indexOf("---", 3);
      expect(secondDelimiter, `${file} should have closing frontmatter delimiter`).toBeGreaterThan(3);

      // Extract frontmatter and check required fields
      const frontmatter = content.slice(3, secondDelimiter).trim();
      expect(frontmatter, `${file} frontmatter should not be empty`).toBeTruthy();

      // Check for title field
      expect(frontmatter, `${file} should have a title`).toMatch(/title:\s*.+/);
    }
  });

  test("journal slugs are unique", () => {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
    const slugs = files.map((f) => f.replace(/\.md$/, ""));
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  test("all journal articles are accessible via routes", async ({ page }) => {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      const response = await page.goto(`/journal/${slug}`, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `/journal/${slug} should be accessible`).toBeLessThan(400);
    }
  });
});
