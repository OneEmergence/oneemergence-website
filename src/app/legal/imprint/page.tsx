import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Angaben gemäß § 5 TMG — Impressum der OneEmergence Website.",
  robots: { index: false, follow: false },
};

export default function ImprintPage() {
  const page = getPage("imprint");
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-oe-deep-space text-oe-pure-light px-5 sm:px-6 py-20 md:py-32 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-oe-solar-gold mb-8 md:mb-10">
          Impressum
        </h1>
        <div
          className="prose prose-invert prose-headings:font-serif prose-headings:text-oe-spirit-cyan prose-p:text-oe-pure-light/80 prose-p:leading-relaxed prose-a:text-oe-aurora-violet prose-strong:text-oe-pure-light max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
