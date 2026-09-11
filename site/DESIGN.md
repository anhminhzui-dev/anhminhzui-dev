# DESIGN.md — the brand system for anhminhzui.dev (sole source of truth; written 2026-09-11 16:58 after the 3×3 direction study; the 2026-09-10 round-2 plan it replaces is in git history)

Decision: direction **P1 + T1** (white paper, one warm accent; Geist + Geist Mono). Chosen because the four industry references the reader recognises (eugeneyan.com, huyenchip.com, rauno.me, brittanychiang.com) are all light-ground, sans-serif, one-accent, text-first pages, and because the page's ten-second job (PRODUCT.md) is proof of competence, not visual flourish. Study receipt: site_rebuild_2026-09-09/design_directions/RECEIPT.md (nine combinations, contrast computed, fonts verified loaded). Runner-up P2 stone/teal is recorded there; not used.

## 1. Colour (five tokens, one definition each; contrast measured on the ground)
| Token | Hex | Contrast on ground | Use |
|---|---|---|---|
| --ground | #FCFCFB | — | page background, cards (no second card tint) |
| --ink | #121212 | 18.25:1 | all text, wordmark, focus ring |
| --muted | #6B6459 | 5.69:1 | sub-lines, captions, table headers |
| --hairline | #E4E0D8 | decorative only | dividers, table rules, card borders, architecture sketch boxes |
| --accent | #A8461F | 5.74:1 (white on accent 5.90:1) | ONLY: primary button fill, the measured numbers in the hero number line, the organic element (at 12% opacity). Nowhere else. Link underlines are ink. |
Banned: #F0EEE6, #FAF9F5, #D97757, #4F6B3F, gradients, glass panels, noise overlays, shadows deeper than 0 1px 0 var(--hairline).

## 2. Type (one family plus one mono; self-hosted woff2 in public/fonts, subset latin)
- Display and body: **Geist** (weights 400, 500, 600). Headings 600, body 400, buttons/nav 500.
- Measured values only: **Geist Mono** 400 — counts, dates, hashes, test numbers, the hero number line. Never a sentence, label, nav item or button.
- Scale (px / line-height): fs-1 12/1.5 · fs-2 14/1.6 · fs-3 16/1.65 · fs-4 20/1.55 · fs-5 28/1.3 · fs-6 40/1.15 · fs-7 48/1.05. Letter-spacing -0.02em on fs-5..fs-7 only. Below 480px: fs-7→fs-6, fs-6→fs-5 through the same rule set.
- Hero h1 at fs-7 must fit in at most 3 lines at 1440 (max-width 22ch). Sentence case everywhere. No all-caps.
Remove from the build: Fraunces, Instrument Sans and their preloads.

## 3. Layout and spacing
- One column, max-width 1040px, side padding 24px (16px under 480px). Section gap 96px (56px on phone). Card padding 24px. Grid gap 24px.
- Order (PRODUCT.md): top bar → hero → Work → Proof → Experience → Contact → footer. Nothing else. No "research strip", no creative-technology card, no tilt cards, no device frames.
- Hero: two columns 3:2 at ≥900px (copy left, organic element right); stacks on phone with the element ABOVE the copy at 16:10, max-height 220px.
- Every pressable element: min 44px target, :focus-visible 2px ink outline offset 2px, :active scale(0.98). Underlined links (text-decoration-thickness 1px, offset 3px).

## 4. Content rules applied by the build (from PRODUCT.md)
- Wordmark: "Vo Ba Hoang Minh". Browser title "Minh Vo — AI engineer".
- h1 (max 12 words): "I build evaluation-first AI systems for paying users." Sub-line: "Founder of Gnomon, which grades real student writing for teachers. Every claim in Work and Proof below links to a running test." (Corrected s-r15 judge pass: the earlier "every claim on this page" oversold — Experience carries no links — so the sentence now scopes to the two sections it is actually true of. The 24-word sentence in PRODUCT.md Q3 is the thesis; the hero uses this 9-word form because Chip Huyen's and Eugene Yan's hero lines are 8–17 words.)
- Buttons: primary "Try the live evaluator" → /demo/ ; secondary link "Read the proof ledger" → #proof ; quiet link "CV (PDF, one page)" → Vo_Ba_Hoang_Minh_CV.pdf.
- Number line (Geist Mono on the digit spans only, accent colour on the digits, body face on the words — mono never sets a sentence): "375 of 500 payloads admitted and 125 malformed inputs refused · 101,175 records screened · 44 checks · 7 public evaluation repos" (r15: folds in the one X-of-Y denominator PRODUCT.md's own fold-test requires, and corrects the repo count from 4 to the real 7 CI-passing evaluation repos in the ledger. r15 judge-fixes pass 2: "evaluation payloads judged correctly" read as a 75%-accuracy claim against a validator whose real behaviour was 500 of 500 correct-by-design — 375 clean rows admitted, 125 deliberately bad rows refused; reworded to state both counts plainly, matching the Work card and the CV, with no correctness framing.)
- Work: 3 cards max — Gnomon essay assessment (live demo link), failclosed-eval (239 tests, CI link), one hackathon product (Uh-Huh, live demo https://uh-huh-demo.onrender.com/). Each: one-line what, live link, one number with denominator, one 3-box sketch in hairline.
- Proof table: every public repo row from the current page with tests count, CI link, repo link; the archived report row with its DOI; the EleutherAI PR row.
- Experience: the current page's facts unchanged (Gnomon founder; FPT Software; FPT Education; contract and forward-deployed work line), degree line "FPT University | Bachelor's degree." exactly.
- Contact: minhhoang250803@gmail.com with a working Copy button; github.com/anhminhzui-dev; https://www.linkedin.com/in/minh-v%C3%B5-b%C3%A1-ho%C3%A0ng-287942366/ . No booking link.
- Footer: "Vo Ba Hoang Minh · Built with React and three.js · No tracking."

## 5. The one organic element
React Three Fiber in src/HeroScene.tsx: a single soft form (the existing fan-leaf geometry is fine) rendered in the accent hue at low saturation, matte material, no transmission, no shader-gradient background, no particles. One load settle (≤1.5s, ease-out), then it answers the pointer only. prefers-reduced-motion or no WebGL → static PNG of the same form (regenerate public/assets/hero-fallback.png from a headless render, 1200×750). It is the only place motion exists.

## 6. What "done" means for a round (judged by site_rebuild_2026-09-09/JUDGE_RUBRIC_PRODUCT.md, written before the build)
Renders at 1440 and 390 with no overflow, fonts loaded (not fallbacks), every control works, /demo/ runs, contrast as in §1, no banned tell, and the ten-second test passes on the 1440 screenshot without scrolling.

## 7. Asset layer (round 16)
Sections added after the hero, in PRODUCT.md's Round 16 order: Product, Work (now with a `.shot-frame` visual per card), Repos (new cards + the existing ledger table below, unchanged), Research (new), Résumé (new, absorbs the former standalone Experience section — same content, same order). Component decisions, licence checks and the reference-site audit are recorded in full at `site_rebuild_2026-09-09/ASSET_BOARD_r16.md`; this section states only what shipped and why.

**Licence fork (decided, not asked):** RULES names five effects — Text Reveal, Tilt Card, Count Up, Progressive Blur, Magnetic Button — that are literal Unlumen UI component names, but Unlumen UI's own licence (fetched at research time) is a custom no-redistribution grant, not MIT/OFL. All five effects are therefore **hand-rolled natively** in `src/interactions.ts` (15–40 lines each, zero dependency, MIT-by-construction) instead of installed from that library. No package.json dependency changed this round — Magic UI's/SmoothUI's shadcn-registry installs (Number Ticker, Blur Fade, Wave Text, Phototab, Image Metadata) were the ASSET_BOARD's first-choice mapping, but were substituted with the same native approach for reliability (no registry-install network step in the build) and to keep the zero-dependency footprint the repo already had. Phototab's cross-fade and Infinite Slider (marked optional in ASSET_BOARD, "cut if it reads as SaaS-demo") and the hover variant of Image Metadata were cut for the same reason; figures use the always-visible caption-bar fallback instead of a hover overlay.

**Device frame:** `.shot-frame` (styles.css) — the Attio-style plain bordered card from ASSET_BOARD §4, `0 1px 0 hairline` shadow ceiling, no browser chrome. Applied to all Gnomon captures, the product-walk poster/GIF, the failclosed-eval demo capture, the Uh-Huh live capture, and the CV preview.

**One organic hero moment:** unchanged — `HeroScene.tsx` is still the only place motion beyond micro-interaction exists; nothing new was added to the hero this round.

**Reduced motion:** every hand-rolled effect checks `prefers-reduced-motion` before attaching a listener or animating (see each function in `interactions.ts`); Count Up renders the final digits immediately, Text Reveal and Blur Fade show final state with no transition, Tilt Card and Magnetic Button attach no listener at all, and the product-walk GIF stays on its static poster frame.
