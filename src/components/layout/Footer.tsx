import Link from "next/link";
import { cn } from "@/lib/utils";

const footerLinks = {
  Erkunden: [
    { href: "/manifesto", label: "Manifesto" },
    { href: "/about", label: "Über uns" },
    { href: "/content", label: "Inhalte" },
    { href: "/journal", label: "Journal" },
  ],
  Mitmachen: [
    { href: "/community", label: "Community" },
    { href: "/events", label: "Events" },
    { href: "/contact", label: "Kontakt" },
  ],
  Rechtliches: [
    { href: "/legal/imprint", label: "Impressum" },
    { href: "/legal/privacy", label: "Datenschutz" },
    { href: "/legal/terms", label: "Nutzungsbedingungen" },
  ],
};

interface FooterColumnProps {
  title: string;
  links: { href: string; label: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-oe-pure-light/40">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-oe-pure-light/60 transition-colors duration-200 hover:text-oe-pure-light"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-oe-aurora-violet/20 bg-oe-deep-space text-oe-pure-light">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 md:gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="font-serif text-2xl text-oe-solar-gold">
              OneEmergence
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-oe-pure-light/50">
              Eine digitale Heimat für Einheit, Freiheit und Liebe — ohne Dogma,
              mit Klarheit und Integrität.
            </p>
          </div>

          {/* Link columns */}
          <div
            className={cn(
              "grid grid-cols-2 gap-6 sm:gap-8 md:col-span-3 md:grid-cols-3"
            )}
          >
            {Object.entries(footerLinks).map(([title, links]) => (
              <FooterColumn key={title} title={title} links={links} />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-oe-aurora-violet/10 pt-8 text-xs text-oe-pure-light/30 sm:flex-row">
          <span>© {currentYear} OneEmergence. Alle Rechte vorbehalten.</span>
          <span>Mit Liebe gebaut.</span>
        </div>
      </div>
    </footer>
  );
}
