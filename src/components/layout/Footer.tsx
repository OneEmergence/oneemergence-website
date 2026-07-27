"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const footerColumns = [
  {
    titleKey: "footer.columns.explore",
    links: [
      { href: "/manifesto", labelKey: "nav.manifesto" },
      { href: "/about", labelKey: "nav.about" },
      { href: "/library", labelKey: "nav.library" },
      { href: "/s", labelKey: "story.eyebrow" },
      { href: "/experiences", labelKey: "nav.experiences" },
      { href: "/brand", labelKey: "nav.brand" },
    ],
  },
  {
    titleKey: "footer.columns.join",
    links: [
      { href: "/community", labelKey: "nav.community" },
      { href: "/events", labelKey: "nav.events" },
      { href: "/contact", labelKey: "nav.contact" },
    ],
  },
  {
    titleKey: "footer.columns.legal",
    links: [
      { href: "/legal/imprint", labelKey: "footer.imprint" },
      { href: "/legal/privacy", labelKey: "footer.privacy" },
      // /legal/terms has no route — the link 404'd. Restore both together.
    ],
  },
] as const;

interface FooterColumnProps {
  title: string;
  links: { href: string; label: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  const headingId = `footer-nav-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-3">
      {/* /50 is the lowest pure-light alpha clearing WCAG AA (4.5:1) on deep
          space — /40 measured 3.64:1. */}
      <h3 id={headingId} className="text-xs font-semibold uppercase tracking-widest text-oe-pure-light/50">
        {title}
      </h3>
      <ul className="flex flex-col">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-11 items-center text-sm text-oe-pure-light/60 transition-colors duration-200 hover:text-oe-pure-light"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-oe-aurora-violet/20 bg-oe-deep-space text-oe-pure-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 gap-6 md:gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-serif text-xl sm:text-2xl text-oe-solar-gold">
                OneEmergence
              </Link>
              <LocaleSwitcher />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-oe-pure-light/50">
              {t("footer.description")}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:col-span-3 md:grid-cols-3">
            {footerColumns.map(({ titleKey, links }) => (
              <FooterColumn
                key={titleKey}
                title={t(titleKey)}
                links={links.map((link) => ({ href: link.href, label: t(link.labelKey) }))}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-oe-aurora-violet/10 pt-8 text-xs text-oe-pure-light/50 sm:flex-row">
          <span>{t("footer.copyright", { year: currentYear })}</span>
          <span>{t("footer.builtWithLove")}</span>
        </div>
      </div>
    </footer>
  );
}
