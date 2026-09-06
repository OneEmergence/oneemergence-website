# Next steps — 7 September 2026

Continuation of the [6 September stabilization](./2026-09-06-stabilization.md).
The implemented scope is Journal reliability, real local account acceptance and
the measured 3D performance issue. No cloud schema changes or deployment took place.

## Journal reliability

Autosave and manual save use one feature-local coordinator. It serializes writes,
coalesces intervening edits and preserves themes; changing only a mood also saves.
Dirty/error status reflects unconfirmed data, including a reverted edit whose
previous response was lost. Leaving the editor clears timers and prevents queued
follow-up writes; it cannot cancel an already executing server action.

A new editor draft owns one UUID. Server-side create validates the optional ID
and uses the existing primary key to resolve a repeat as an owner-scoped update.
It updates the existing source node instead of generating another graph. A retry
with newer text therefore stores that text, without changing another user's entry.
Older callers without an ID still work. The ID lives for the mounted editor's
lifetime; this is not offline draft persistence or cross-tab conflict resolution.

## Real account acceptance

`pnpm test:accounts:local` starts a fresh loopback-only Supabase project from the
committed migrations, builds Next with matching local credentials, executes the
actual Auth/UI/PostgREST flows and removes its own stack afterward. A temporary
bootstrap admin satisfies the existing last-admin guard; individual tests clean
up only their reserved random identities, including partial setup failures.

The browser flow covers signup, pending restrictions/export, admin approval,
Journal autosave/manual-save overlap, a committed response lost before reaching
the editor, explicit retry, owner-specific export, suspension and account deletion.
Two RLS tests check isolation and escalation/access restrictions. The runner does
not load cloud credentials or send external email. See
[the reproducible procedure](../testing/accounts.md).

CI runs pure autosave scheduling in the quality job, real Journal SQL in a local
PostgreSQL service, and account acceptance for relevant pull requests or manual
dispatch. The workflow files were checked locally; no GitHub Actions run was
triggered from this session.

## 3D behavior

The old performance floor used Drei's highest observed FPS as the display refresh
rate. A consistently slow device could therefore remain below a usable frame rate
without ever triggering a downgrade. The new monitor uses a fixed 30 FPS floor
across six sampling windows, only while visible and actively animating. Manual
quality selection disables automatic changes. Medium no longer creates an MSAA
framebuffer. Medium-to-Low and atmosphere changes preserve canvas/camera; explicit
High changes still recreate the context because MSAA is a context option.

The initial correction passed 105 checks across world-map, accessibility and Web
Vitals on desktop/mobile, with nine platform-specific skips. Stable desktop Low
measurements were still about 20 FPS at 1280×720, versus about 53–57 FPS on the
smaller mobile canvas. The browser reported SwiftShader (software rendering),
with no MSAA/shadows, about 90 calls and 18.5k triangles on desktop. This identified
the large framebuffer as a candidate for an additional Low-tier pixel budget.

Low now limits its framebuffer to 450,000 pixels using the measured Canvas CSS
size. It responds to resize without remounting, retains one pixel per CSS pixel
on smaller mobile canvases and leaves DOM controls and Medium/High unchanged.
The final desktop runtime check measured **33.33 FPS**, compared with **11.85 FPS**
on the previous Medium baseline and about **20 FPS** after automatic downgrade
alone. Transfer remained about 3.02 MB. These are observed SwiftShader results;
the regression checks deterministic pixel/asset budgets, not a flaky FPS threshold.

## Final verification

| Check                                                                          | Result                                                                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `pnpm check` and `pnpm build`                                                  | Passed with the normal local environment; final server on 127.0.0.1:3000                                        |
| `pnpm test:journal-autosave`                                                   | 9 passed; controlled promises/timers, no browser or external service                                            |
| `pnpm test:journal-lifecycle`                                                  | 8 SQL groups passed on temporary PostgreSQL 16; temporary DB removed and server stopped                         |
| `pnpm test:accounts:local`                                                     | 4 passed, 0 skipped, including the actual commit/response-loss/retry flow; all test containers/networks removed |
| World-map + accessibility + Web Vitals, both projects                          | 105 passed, 9 platform-specific skips before the final pixel-budget adjustment; no failures                     |
| Final world-map + auth forms + public controls + contact intent, both projects | 81 passed, 9 platform-specific skips after the pixel-budget adjustment; no failures                             |
| `pnpm test:world-assets`                                                       | Tree GLB within budget: 857,436 bytes / 30,487 triangles                                                        |
| Touched-file Prettier and `git diff --check`                                   | Passed; no full-repository formatting rewrite                                                                   |

Final browser command (against the running production build):

```bash
pnpm exec playwright test tests/smoke/world-map tests/smoke/auth-forms tests/smoke/public-controls tests/smoke/contact-intent
```

The platform skips select touch versus desktop keyboard/context-loss scenarios;
none of the isolated account/RLS checks skipped. The existing Web Vitals suite
uses a 3 s LCP / 0.25 CLS limit for Home/Manifesto/About and 2.5 s / 0.1 for Map,
plus a 200 ms Map interaction limit. Passing it is not proof of site-wide strict
production budgets. The mobile project emulates Pixel 5 in Chromium.

Local evidence: `tmp/account-acceptance-run.log`, `tmp/next-steps-browser.log`,
`tmp/world-validation.log`, `tmp/next-steps-production-build.log`;
HTML reports in `tmp/playwright-accounts`, `tmp/playwright-next-steps` and
`tmp/playwright-world`. Final runtime logging measured 33.33 FPS desktop and
56.74 FPS mobile with about 3.02 MB transfer. Logs/artifacts stay ignored by Git.
An additional settled sample measured 34.39/34.52 FPS on desktop with an
894×503 framebuffer, and 58.75/53.19 FPS on mobile at 393×727. Neither browser
reported a page error. `tmp/world-runtime-final.json` contains the renderer and
budgets; `tmp/world-desktop-verified.png` and `tmp/world-mobile-verified.png` were
visually inspected after the final build. Controls/text retain their normal
resolution; Low deliberately trades 3D sharpness for responsiveness.

## Local process issue found during verification

An older Next server remained on IPv6 port 3000 while a new server listened on
127.0.0.1. Requests via localhost reached cached HTML referring to a previous
build's CSS. The stale process was identified by its repository command line and
terminated. Subsequent checks used the explicit current origin. Keep one build
and one server per checkout; account acceptance uses port 3100 and never reuses
an existing app server.

## Remaining environment-specific work

- External email verification/reset delivery, OAuth and avatar upload in separate staging.
- Real-device GPU profiling and production Web Vitals; software-renderer FPS is
  diagnostic evidence, not a hardware performance guarantee.
- Historical orphaned Map copies, cross-tab edits and offline draft persistence
  require separate scoped work.
- Guide request/cost limits and failure-safe conversation handling precede the
  first source-backed streaming/tool-action slice in the roadmap.
