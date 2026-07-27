"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/i18n/config";

const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Plain module-level helper (not a component/hook) so the DOM mutation is
// clearly outside render for the react-hooks/immutability lint rule.
function setLocaleCookie(next: Locale) {
  document.cookie = `${NEXT_LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Subtle DE/EN text toggle. Sets the NEXT_LOCALE cookie read by
 * `src/i18n/request.ts` and refreshes the router so the server re-renders
 * with the new locale's messages.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("footer");
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-1.5 text-xs font-medium tracking-wide"
    >
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-oe-pure-light/55">/</span>}
          <button
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            aria-pressed={loc === locale}
            className={cn(
              "uppercase transition-colors duration-200",
              loc === locale
                ? "text-oe-pure-light/70"
                : "text-oe-pure-light/50 hover:text-oe-solar-gold"
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
