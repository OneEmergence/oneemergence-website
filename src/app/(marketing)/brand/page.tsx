import type { Metadata } from "next";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BreathingOrb } from "@/components/motion/BreathingOrb";
import { JumpNav } from "./JumpNav";
import { MotionDemos } from "./MotionDemos";

export const metadata: Metadata = {
  title: { absolute: "Brand — OneEmergence" },
  description:
    "The OneEmergence brand system: essence, the three depths, logo, colors, typography, motion, voice, and imagery — the single source of truth, rendered from the live design tokens.",
  openGraph: {
    title: "Brand — OneEmergence",
    description:
      "The OneEmergence brand system: essence, three depths, logo, colors, typography, motion, voice, and imagery.",
    url: "https://oneemergence.org/brand",
  },
  twitter: {
    title: "Brand — OneEmergence",
    description:
      "The OneEmergence brand system, rendered from the live design tokens.",
  },
  alternates: { canonical: "https://oneemergence.org/brand" },
};

const CHAPTERS = [
  { id: "essence", num: "01", label: "Essence" },
  { id: "depths", num: "02", label: "The Three Depths" },
  { id: "logo", num: "03", label: "Logo" },
  { id: "colors", num: "04", label: "Colors" },
  { id: "typography", num: "05", label: "Typography" },
  { id: "motion", num: "06", label: "Motion" },
  { id: "voice", num: "07", label: "Voice & Tone" },
  { id: "imagery", num: "08", label: "Imagery & Assets" },
];

const LOGO_TRANSPARENT = "/images/logo-cosmic-yinyang.png";
const LOGO_TRIMMED = "/images/logo-cosmic-yinyang-trimmed.png";
const LOGO_ORIGINAL = "/images/Gemini_OneEmergence.jpeg";

/* ─── Shared building blocks ─── */

function ChapterHeading({
  num,
  kicker,
  title,
}: {
  num: string;
  kicker: string;
  title: string;
}) {
  return (
    <header className="mb-10 md:mb-14">
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
        <span className="font-mono text-oe-pure-light/30">{num}</span>
        {kicker}
      </p>
      <h2 className="font-serif text-4xl leading-tight text-oe-solar-gold md:text-5xl lg:text-6xl">
        {title}
      </h2>
    </header>
  );
}

function Chapter({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 border-t border-oe-aurora-violet/10 px-4 py-20 sm:px-6 md:py-28",
        className
      )}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

/* ─── Chapter data ─── */

const DEPTHS = [
  {
    name: "Cosmic",
    depth: "Outer",
    surface: "bg-oe-depth-cosmic",
    title: "text-oe-aurora-violet",
    glow: "bg-[radial-gradient(circle_at_30%_20%,rgba(124,92,255,0.22),transparent_60%)]",
    accents: [
      { label: "Aurora Violet", dot: "bg-oe-aurora-violet" },
      { label: "Spirit Cyan", dot: "bg-oe-spirit-cyan" },
    ],
    feeling: "Awe · Stillness · Threshold",
    where:
      "Home / Living Portal, Manifesto, first contact, all marketing surfaces.",
  },
  {
    name: "Solarpunk",
    depth: "Middle",
    surface: "bg-oe-depth-solarpunk",
    title: "text-oe-living-green",
    glow: "bg-[radial-gradient(circle_at_30%_20%,rgba(110,219,143,0.2),transparent_60%)]",
    accents: [
      { label: "Living Green", dot: "bg-oe-living-green" },
      { label: "Solar Gold", dot: "bg-oe-solar-gold" },
    ],
    feeling: "Growth · Aliveness · Hope",
    where: "Community, Events, Experiences, Library.",
  },
  {
    name: "Human Warmth",
    depth: "Inner",
    surface: "bg-oe-depth-warm",
    title: "text-oe-warm-sand",
    glow: "bg-[radial-gradient(circle_at_30%_20%,rgba(232,201,168,0.18),transparent_60%)]",
    accents: [
      { label: "Warm Sand", dot: "bg-oe-warm-sand" },
      { label: "Solar Gold", dot: "bg-oe-solar-gold" },
    ],
    feeling: "Intimacy · Groundedness",
    where: "Portal / Inner space: Journal, Practice, Guide, Map.",
  },
];

const SWATCHES = [
  {
    name: "Deep Space",
    hex: "#0A0F1F",
    swatch: "bg-oe-deep-space",
    specimen: "text-oe-pure-light",
    border: true,
    usage: "Primary background — the void. Every screen begins here.",
    wcag: "Pure-light text ≈ 18:1 (AAA). Gold, cyan, green & sand accents all ≈ 11–12:1. Never place dark text here.",
  },
  {
    name: "Aurora Violet",
    hex: "#7C5CFF",
    swatch: "bg-oe-aurora-violet",
    specimen: "text-white",
    usage: "Primary accent — mystery, consciousness. Cosmic layer, primary buttons, focus rings.",
    wcag: "Mid-tone: white ≈ 4.1:1, deep-space ≈ 4.4:1 — both AA for large / bold text only. Use for headings, fills & UI, not body copy.",
  },
  {
    name: "Solar Gold",
    hex: "#F6C453",
    swatch: "bg-oe-solar-gold",
    specimen: "text-oe-deep-space",
    usage: "Secondary accent — light, emergence. The connective thread across all three depths.",
    wcag: "Deep-space text ≈ 11.8:1 (AAA). White text fails (1.5:1). Always pair with dark text.",
  },
  {
    name: "Spirit Cyan",
    hex: "#54E2E9",
    swatch: "bg-oe-spirit-cyan",
    specimen: "text-oe-deep-space",
    usage: "Tertiary accent — clarity, spirit. Cosmic-layer counterpoint to violet.",
    wcag: "Deep-space text ≈ 12.2:1 (AAA). White text fails. Dark text only.",
  },
  {
    name: "Pure Light",
    hex: "#F7F8FB",
    swatch: "bg-oe-pure-light",
    specimen: "text-oe-deep-space",
    usage: "Foreground on dark — body text, headlines, the light that emerges.",
    wcag: "As a rare light surface, deep-space text ≈ 18:1 (AAA). White fails; use dark text.",
  },
  {
    name: "Living Green",
    hex: "#6EDB8F",
    swatch: "bg-oe-living-green",
    specimen: "text-oe-deep-space",
    usage: "Solarpunk-layer accent — growth, nature. Community, Events, Experiences, Library.",
    wcag: "Deep-space text ≈ 11.1:1 (AAA). White text fails. Dark text only.",
  },
  {
    name: "Warm Sand",
    hex: "#E8C9A8",
    swatch: "bg-oe-warm-sand",
    specimen: "text-oe-deep-space",
    usage: "Human-warmth-layer accent — skin, earth, intimacy. Inner / Portal space.",
    wcag: "Deep-space text ≈ 12.1:1 (AAA). White text fails. Dark text only.",
  },
  {
    name: "Depth Solarpunk",
    hex: "#101B2E",
    swatch: "bg-oe-depth-solarpunk",
    specimen: "text-oe-pure-light",
    border: true,
    usage: "Middle-layer surface — teal-shifted dark. Still space, warmer temperature.",
    wcag: "Pure-light text ≈ 16:1 (AAA). Living-green & gold accents read cleanly. Light text only.",
  },
  {
    name: "Depth Warm",
    hex: "#1A1610",
    swatch: "bg-oe-depth-warm",
    specimen: "text-oe-pure-light",
    border: true,
    usage: "Inner-layer surface — warm-shifted dark. Intimate, grounded, still dark.",
    wcag: "Pure-light text ≈ 17:1 (AAA). Sand & gold accents read cleanly. Light text only.",
  },
];

const TYPE_SCALE = [
  { role: "Display", cls: "font-serif text-5xl md:text-6xl text-oe-solar-gold", sample: "Emergence" },
  { role: "Heading 1", cls: "font-serif text-4xl md:text-5xl text-oe-pure-light", sample: "The journey inward" },
  { role: "Heading 2", cls: "font-serif text-3xl md:text-4xl text-oe-pure-light", sample: "Three depths, one field" },
  { role: "Heading 3", cls: "font-serif text-2xl md:text-3xl text-oe-pure-light", sample: "Darkness is space" },
  { role: "Lead", cls: "font-sans text-lg md:text-xl text-oe-pure-light/80", sample: "A space to arrive as you are." },
  { role: "Body", cls: "font-sans text-base text-oe-pure-light/70", sample: "We hold the conditions; you meet the moment." },
  { role: "Small", cls: "font-sans text-sm text-oe-pure-light/60", sample: "Move inward at your own pace." },
  { role: "Eyebrow", cls: "font-sans text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet", sample: "Brand System" },
];

const VOICE_PAIRS = [
  {
    context: "Invitation · web",
    good: "A space to arrive as you are.",
    bad: "Unlock your highest self in 30 days.",
  },
  {
    context: "Emergence · web",
    good: "Emergence isn't forced. We hold the conditions; you meet the moment.",
    bad: "This will completely transform your entire life — guaranteed.",
  },
  {
    context: "Announcement · social",
    good: "A new reflection is in the Journal — on the space between breaths.",
    bad: "🔥 You WON'T believe what happens when you go within!!! 🔥",
  },
  {
    context: "Explaining · web",
    good: "Three depths, one field. Move inward at your own pace.",
    bad: "Tap into the quantum vibrational frequency of pure oneness.",
  },
  {
    context: "Events · social",
    good: "Doors open Thursday. Come if it calls you.",
    bad: "Last chance! Spots are running out — don't miss out!",
  },
  {
    context: "About us · web",
    good: "We built this slowly, on purpose.",
    bad: "The #1 revolutionary platform for spiritual awakening.",
  },
];

const APPROVED_BACKGROUNDS = [
  { label: "Deep Space", surface: "bg-oe-deep-space", border: true },
  { label: "Depth Solarpunk", surface: "bg-oe-depth-solarpunk", border: true },
  { label: "Depth Warm", surface: "bg-oe-depth-warm", border: true },
  { label: "Pure Light", surface: "bg-oe-pure-light", border: false },
];

const LOGO_DONTS = [
  {
    title: "No recolour",
    caption: "The blue↔orange balance is the meaning. Never tint or theme it.",
    filter: "hue-rotate(140deg) saturate(1.6)",
    transform: undefined,
  },
  {
    title: "No distortion",
    caption: "Scale uniformly. Never stretch, squash or skew the emblem.",
    filter: undefined,
    transform: "scaleX(1.5)",
  },
  {
    title: "No drop shadows",
    caption: "No glows, bevels or effects. The emblem carries its own light.",
    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.9))",
    transform: undefined,
  },
];

const IMAGERY_DO = [
  "Deep, dark backgrounds — space is the ground, not a backdrop.",
  "Luminous accents in brand colours; light emerges against the void.",
  "Sacred geometry, orbits, mandalas and fine linework are welcome.",
  "Atmosphere and depth — nebulae, grain, real astrophotography texture.",
  "Layer-matched palettes: violet/cyan for cosmic, green/gold for solarpunk, sand/gold for warmth.",
];

const IMAGERY_DONT = [
  "Kitsch mysticism — rainbow chakras, glowing gurus, cartoon auras.",
  "Stock-photo spirituality — silhouettes on mountaintops, lotus-on-water, hands cupping light.",
  "Oversaturated neon or laser gradients that flatten the depth.",
  "Literal religious iconography or brand-external symbols.",
  "Bright, evenly-lit scenes — nothing should read as a generic 'light theme'.",
];

/* ─── Page ─── */

export default function BrandPage() {
  return (
    <div className="bg-oe-deep-space text-oe-pure-light">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-32 md:pb-24 md:pt-40">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <BreathingOrb color="violet" size={420} breathRate={10} className="-mt-24 opacity-60" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
            Brand System · v1
          </p>
          <h1 className="font-serif text-4xl leading-[1.05] text-oe-pure-light sm:text-5xl md:text-6xl lg:text-7xl">
            The OneEmergence
            <br />
            <span className="text-oe-solar-gold text-glow-gold">Brand Guide</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70 md:text-xl">
            A living style guide — the single source of truth for anyone
            producing OneEmergence work. Rendered from the same design tokens
            the product ships. The guide is the proof the system holds.
          </p>
          <div className="mx-auto mt-8 h-px w-16 bg-oe-solar-gold/40" />
        </div>
      </section>

      <JumpNav sections={CHAPTERS} />

      {/* 01 — Essence */}
      <Chapter id="essence" className="border-t-0">
        <ChapterHeading num="01" kicker="Essence" title="What OneEmergence is" />
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 text-lg leading-relaxed text-oe-pure-light/80">
            <p>
              OneEmergence is a{" "}
              <span className="text-oe-pure-light">field, not a product</span> — a
              living space where genuine connection becomes possible.
            </p>
            <p>
              We treat emergence as a{" "}
              <span className="text-oe-pure-light">journey inward</span>: from the
              awe of the cosmos to the warmth of the human heart.
            </p>
            <p>
              Darkness here is{" "}
              <span className="text-oe-pure-light">space, not absence</span>. Light
              emerges intentionally — never by default.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-oe-aurora-violet/20 bg-white/[0.02] p-6">
              <h3 className="font-serif text-xl text-oe-solar-gold">
                The emergence principle
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-oe-pure-light/65">
                Nothing here is manufactured. Meaning, connection and beauty
                emerge when the conditions are right. Our work is to hold the
                conditions — not to force the outcome.
              </p>
            </div>
            <div className="rounded-2xl border border-oe-aurora-violet/20 bg-white/[0.02] p-6">
              <h3 className="font-serif text-xl text-oe-solar-gold">
                Darkness is space
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-oe-pure-light/65">
                Our canvas begins in deep space. Black is not a dark theme laid
                over a light one — it is the ground from which everything
                luminous appears. Every accent is a deliberate act of light.
              </p>
            </div>
          </div>
        </div>

        <figure className="mt-14 border-l-2 border-oe-solar-gold/40 pl-6 md:pl-10">
          <blockquote className="font-serif text-2xl leading-snug text-oe-pure-light/90 md:text-3xl">
            &ldquo;We don&rsquo;t build the light. We hold the dark still enough
            that light can appear.&rdquo;
          </blockquote>
        </figure>
      </Chapter>

      {/* 02 — The Three Depths */}
      <Chapter id="depths">
        <ChapterHeading
          num="02"
          kicker="The Three Depths"
          title="One field, three moods"
        />
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70">
          The brand is structured as three depth layers. The visual world shifts
          with the user&rsquo;s proximity to their own inner space — what changes
          is temperature and accent, never the fact that darkness is space. The
          inner layer stays dark and intimate. Gold is the thread that runs
          through all three.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {DEPTHS.map((d) => (
            <article
              key={d.name}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border border-oe-pure-light/10 p-6",
                d.surface
              )}
            >
              <div className={cn("pointer-events-none absolute inset-0", d.glow)} />
              <div className="relative flex flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-widest text-oe-pure-light/40">
                  {d.depth} depth
                </p>
                <h3 className={cn("mt-2 font-serif text-2xl", d.title)}>
                  {d.name}
                </h3>

                <div className="mt-5 flex flex-wrap gap-2">
                  {d.accents.map((a) => (
                    <span
                      key={a.label}
                      className="inline-flex items-center gap-2 rounded-full bg-oe-pure-light/5 px-3 py-1 text-xs text-oe-pure-light/70"
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full", a.dot)} />
                      {a.label}
                    </span>
                  ))}
                </div>

                <dl className="mt-6 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-oe-pure-light/35">
                      Feeling
                    </dt>
                    <dd className="mt-1 text-oe-pure-light/80">{d.feeling}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-oe-pure-light/35">
                      Where it lives
                    </dt>
                    <dd className="mt-1 text-oe-pure-light/70">{d.where}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-oe-pure-light/45">
          Surfaces: <span className="font-mono">oe-depth-cosmic</span> (alias of
          deep space), <span className="font-mono">oe-depth-solarpunk</span>,{" "}
          <span className="font-mono">oe-depth-warm</span>.
        </p>
      </Chapter>

      {/* 03 — Logo */}
      <Chapter id="logo">
        <ChapterHeading num="03" kicker="Logo" title="The cosmic emblem" />

        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="flex items-center justify-center rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-10">
            <Image
              src={LOGO_TRANSPARENT}
              alt="OneEmergence emblem — a cosmic yin-yang of a blue and an orange half"
              width={220}
              height={220}
              className="h-auto w-40 md:w-52"
              priority
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-oe-pure-light/75">
            <p>
              The emblem is a cosmic yin-yang. The{" "}
              <span className="text-oe-spirit-cyan">blue half</span> is the
              cosmos and structure; the{" "}
              <span className="text-oe-warm-sand">orange half</span> is life and
              warmth. They mirror the outer↔inner journey — and each half carries
              the seed of the other.
            </p>
            <p className="text-oe-pure-light/60">
              It is the fixed point of the identity. Everything else — colour,
              motion, depth — moves around it; the emblem does not.
            </p>
          </div>
        </div>

        {/* Approved backgrounds */}
        <h3 className="mb-5 mt-14 font-serif text-2xl text-oe-solar-gold">
          Approved backgrounds
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {APPROVED_BACKGROUNDS.map((bg) => (
            <div key={bg.label} className="text-center">
              <div
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl",
                  bg.surface,
                  bg.border && "border border-oe-pure-light/10"
                )}
              >
                <Image
                  src={LOGO_TRANSPARENT}
                  alt={`OneEmergence emblem on ${bg.label}`}
                  width={96}
                  height={96}
                  className="h-auto w-16"
                />
              </div>
              <p className="mt-2 text-xs text-oe-pure-light/50">{bg.label}</p>
            </div>
          ))}
        </div>

        {/* Clear space + min size */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-6">
            <h3 className="font-serif text-xl text-oe-solar-gold">Clear space</h3>
            <p className="mt-2 text-sm leading-relaxed text-oe-pure-light/60">
              Keep clear space of at least half the emblem&rsquo;s width on every
              side. Nothing intrudes into it.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="rounded-lg border border-dashed border-oe-spirit-cyan/40 p-[60px]">
                <Image
                  src={LOGO_TRIMMED}
                  alt="Emblem with clear space margin illustrated"
                  width={120}
                  height={122}
                  className="h-[120px] w-[120px] object-contain"
                />
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-oe-pure-light/40">
              Dashed frame = ½ emblem width of protected space.
            </p>
          </div>

          <div className="rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-6">
            <h3 className="font-serif text-xl text-oe-solar-gold">
              Minimum size
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-oe-pure-light/60">
              The emblem may never appear smaller than 48px in digital use —
              below that the two halves stop reading.
            </p>
            <div className="mt-6 flex items-end justify-center gap-6">
              <div className="text-center">
                <Image
                  src={LOGO_TRANSPARENT}
                  alt="Emblem at 48 pixels"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
                <p className="mt-2 text-xs text-oe-pure-light/40">48px · min</p>
              </div>
              <div className="text-center">
                <Image
                  src={LOGO_TRANSPARENT}
                  alt="Emblem at a comfortable size"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
                <p className="mt-2 text-xs text-oe-pure-light/40">80px</p>
              </div>
            </div>
          </div>
        </div>

        {/* Don'ts */}
        <h3 className="mb-5 mt-12 font-serif text-2xl text-oe-solar-gold">
          Don&rsquo;ts
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOGO_DONTS.map((d) => (
            <div
              key={d.title}
              className="rounded-2xl border border-oe-pure-light/10 bg-white/[0.02] p-5"
            >
              <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-oe-deep-space">
                <Image
                  src={LOGO_TRANSPARENT}
                  alt={d.title}
                  width={72}
                  height={72}
                  className="h-16 w-16"
                  style={{ filter: d.filter, transform: d.transform }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-oe-pure-light/85">
                {d.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-oe-pure-light/50">
                {d.caption}
              </p>
            </div>
          ))}
          <div className="rounded-2xl border border-oe-pure-light/10 bg-white/[0.02] p-5">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-[conic-gradient(from_0deg,#7C5CFF,#54E2E9,#6EDB8F,#F6C453,#7C5CFF)]">
              <Image
                src={LOGO_TRANSPARENT}
                alt="No busy backgrounds"
                width={72}
                height={72}
                className="h-16 w-16"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-oe-pure-light/85">
              No busy backgrounds
            </p>
            <p className="mt-1 text-xs leading-relaxed text-oe-pure-light/50">
              Place it on space or an approved surface — never on clutter.
            </p>
          </div>
        </div>

        {/* Source files */}
        <div className="mt-12 rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-6">
          <h3 className="font-serif text-xl text-oe-solar-gold">Source files</h3>
          <p className="mt-2 text-sm text-oe-pure-light/60">
            Prefer the transparent PNG on brand surfaces; use the original only
            where its own space background is wanted.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { src: LOGO_TRANSPARENT, note: "Transparent · 1024×1024" },
              { src: LOGO_TRIMMED, note: "Trimmed · 803×815" },
              { src: LOGO_ORIGINAL, note: "Original · space background" },
            ].map((f) => (
              <div
                key={f.src}
                className="flex items-center gap-3 rounded-xl border border-oe-pure-light/10 p-3"
              >
                <Image
                  src={f.src}
                  alt={f.note}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <span className="text-xs text-oe-pure-light/60">{f.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Chapter>

      {/* 04 — Colors */}
      <Chapter id="colors">
        <ChapterHeading num="04" kicker="Colors" title="The palette, live" />
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70">
          Every swatch below is rendered from the real CSS token — the same
          value the product uses. Each &ldquo;Aa&rdquo; shows the safe text
          colour on that surface. Contrast ratios are against WCAG AA (4.5:1
          normal · 3:1 large).
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SWATCHES.map((s) => (
            <div
              key={s.name}
              className="overflow-hidden rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02]"
            >
              <div
                className={cn(
                  "flex h-28 items-center justify-between px-5",
                  s.swatch,
                  s.border && "border-b border-oe-pure-light/10"
                )}
              >
                <span
                  className={cn("font-serif text-4xl leading-none", s.specimen)}
                >
                  Aa
                </span>
                <span
                  className={cn(
                    "font-mono text-xs opacity-70",
                    s.specimen
                  )}
                >
                  {s.hex}
                </span>
              </div>
              <div className="space-y-2 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium text-oe-pure-light">{s.name}</h3>
                  <code className="font-mono text-xs text-oe-pure-light/40">
                    {s.hex}
                  </code>
                </div>
                <p className="text-sm leading-relaxed text-oe-pure-light/60">
                  {s.usage}
                </p>
                <p className="text-xs leading-relaxed text-oe-spirit-cyan/70">
                  {s.wcag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Chapter>

      {/* 05 — Typography */}
      <Chapter id="typography">
        <ChapterHeading
          num="05"
          kicker="Typography"
          title="Cormorant & Inter"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-8">
            <p className="font-serif text-8xl leading-none text-oe-solar-gold">
              Aa
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Cormorant · Serif
            </p>
            <p className="mt-2 text-sm text-oe-pure-light/60">
              Headings & display. Carries the atmosphere — used large, with room
              to breathe.
            </p>
            <p className="mt-5 font-serif text-2xl text-oe-pure-light/90">
              Emergence begins in stillness.
            </p>
          </div>

          <div className="rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-8">
            <p className="font-sans text-8xl font-medium leading-none text-oe-spirit-cyan">
              Aa
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-oe-aurora-violet">
              Inter · Sans
            </p>
            <p className="mt-2 text-sm text-oe-pure-light/60">
              Body & interface. Quiet, precise and highly legible at every size.
            </p>
            <p className="mt-5 font-sans text-base leading-relaxed text-oe-pure-light/80">
              We hold the conditions; you meet the moment. Clarity is a form of
              respect.
            </p>
          </div>
        </div>

        {/* Scale */}
        <h3 className="mb-6 mt-14 font-serif text-2xl text-oe-solar-gold">
          The scale in use
        </h3>
        <div className="divide-y divide-oe-aurora-violet/10 rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02]">
          {TYPE_SCALE.map((row) => (
            <div
              key={row.role}
              className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <span className="w-24 flex-shrink-0 text-xs font-semibold uppercase tracking-widest text-oe-pure-light/35">
                {row.role}
              </span>
              <span className={cn("min-w-0 truncate", row.cls)}>
                {row.sample}
              </span>
            </div>
          ))}
        </div>

        {/* Line length */}
        <div className="mt-12 rounded-2xl border border-oe-aurora-violet/15 bg-white/[0.02] p-8">
          <h3 className="font-serif text-2xl text-oe-solar-gold">
            Line length
          </h3>
          <p className="mt-2 text-sm text-oe-pure-light/60">
            Cap body text at roughly 70 characters per line. Longer lines tire
            the eye; the reader loses the start of the next line.
          </p>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-oe-pure-light/80">
            This paragraph is constrained to about seventy characters per line.
            It is the comfortable measure for sustained reading — long enough to
            hold a thought, short enough that the eye returns without effort.
            Emergence is not rushed, and neither is reading.
          </p>
          <p className="mt-3 font-mono text-xs text-oe-pure-light/40">
            max-width: ~70ch
          </p>
        </div>
      </Chapter>

      {/* 06 — Motion */}
      <Chapter id="motion">
        <ChapterHeading
          num="06"
          kicker="Motion & Interaction"
          title="Four levels of motion"
        />
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70">
          Every animation declares its level. Micro is always present; Flow and
          Sacred appear in Balanced and Immersive; Event is reserved for
          Immersive. Durations and easings come straight from the{" "}
          <span className="font-mono text-base">--oe-transition-*</span> tokens.
        </p>
        <MotionDemos />
      </Chapter>

      {/* 07 — Voice & Tone */}
      <Chapter id="voice">
        <ChapterHeading num="07" kicker="Voice & Tone" title="How we speak" />
        <p className="mb-4 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70">
          OneEmergence speaks{" "}
          <span className="text-oe-pure-light">
            calm, precise, invitational and grounded
          </span>
          . Never vague-esoteric, never salesy. We invite; we do not sell. We are
          specific; we do not mystify.
        </p>
        <p className="mb-12 text-sm text-oe-pure-light/50">
          Left: how we say it. Right: how we don&rsquo;t.
        </p>

        <div className="space-y-4">
          {VOICE_PAIRS.map((pair) => (
            <div
              key={pair.good}
              className="grid gap-3 rounded-2xl border border-oe-aurora-violet/12 bg-white/[0.02] p-2 md:grid-cols-2"
            >
              <div className="rounded-xl border border-oe-living-green/25 bg-oe-living-green/[0.06] p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-oe-living-green">
                  We say
                </p>
                <p className="text-base leading-relaxed text-oe-pure-light/85">
                  {pair.good}
                </p>
                <p className="mt-3 text-xs text-oe-pure-light/40">
                  {pair.context}
                </p>
              </div>
              <div className="rounded-xl border border-oe-pure-light/10 bg-white/[0.015] p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-oe-pure-light/45">
                  We don&rsquo;t
                </p>
                <p className="text-base leading-relaxed text-oe-pure-light/45 line-through decoration-oe-pure-light/20">
                  {pair.bad}
                </p>
                <p className="mt-3 text-xs text-oe-pure-light/30">
                  {pair.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Chapter>

      {/* 08 — Imagery & Assets */}
      <Chapter id="imagery">
        <ChapterHeading
          num="08"
          kicker="Imagery & Assets"
          title="The visual world"
        />
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-oe-pure-light/70">
          Most OneEmergence imagery is generated — cosmic poster art rather than
          stock photography. The rule is simple: it must feel like light
          emerging from space, not spirituality sold from a catalogue.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-oe-living-green/25 bg-oe-living-green/[0.05] p-7">
            <h3 className="font-serif text-2xl text-oe-living-green">Do</h3>
            <ul className="mt-4 space-y-3">
              {IMAGERY_DO.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-oe-pure-light/75"
                >
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-oe-living-green" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-oe-pure-light/10 bg-white/[0.02] p-7">
            <h3 className="font-serif text-2xl text-oe-pure-light/70">
              Don&rsquo;t
            </h3>
            <ul className="mt-4 space-y-3">
              {IMAGERY_DONT.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-oe-pure-light/55"
                >
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-oe-pure-light/25" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Downloads */}
        <h3 className="mb-5 mt-14 font-serif text-2xl text-oe-solar-gold">
          Asset downloads
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: LOGO_TRANSPARENT,
              title: "Emblem · Transparent PNG",
              note: "1024×1024 · for brand surfaces",
            },
            {
              href: LOGO_TRIMMED,
              title: "Emblem · Trimmed PNG",
              note: "803×815 · tight crop, 16px pad",
            },
            {
              href: LOGO_ORIGINAL,
              title: "Emblem · Original JPEG",
              note: "1024×1024 · space background",
            },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              download
              className="group flex flex-col gap-3 rounded-2xl border border-oe-aurora-violet/20 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-oe-aurora-violet/50"
            >
              <Image
                src={a.href}
                alt={a.title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-medium text-oe-pure-light group-hover:text-oe-solar-gold">
                  {a.title}
                </p>
                <p className="mt-1 text-xs text-oe-pure-light/50">{a.note}</p>
              </div>
            </a>
          ))}
        </div>
      </Chapter>

      {/* Footer note */}
      <section className="border-t border-oe-aurora-violet/10 px-4 py-16 text-center sm:px-6">
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-oe-pure-light/45">
          This guide is rendered from the live design tokens in{" "}
          <span className="font-mono">globals.css</span>. When the system
          changes, the guide changes with it.
        </p>
      </section>
    </div>
  );
}
