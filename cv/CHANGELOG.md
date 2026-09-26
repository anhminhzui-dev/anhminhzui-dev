# CV changelog

Format: [Keep a Changelog](https://keepachangelog.com/). One entry per shipped version; each shipped version is a git
tag `cv-r<N>` on the commit that published it. Working builds that never shipped get no tag and no entry. The full
fact inventory every version is cut from is `cv/MASTER_CV.md`; the audit trail of every earlier file is
`M:/AGENT_VAULT/PORTFOLIO/cv/CV_REGISTER.md` (private).

## [r23] - 2026-09-26
### Changed
- Focused the headline, opening and first experience section on 3D/VFX production plus AI workflow engineering for current hybrid roles.
- Restored the underlying production titles for OTSU Labs, Fragments of the Deep and Dihaan Media. The prior "Applied AI Operations" labels did not establish AI deployment at those studios.
- Added verified 3D tools; removed two less relevant engineering projects and an unsupported 30% performance figure. PDF remains one page. Commit 4b2eeaa; SHA256 e47866fd25857251. GitHub Pages delivery is checked separately in the private register.

## [r22] - 2026-09-20
### Changed
- Banner line, hiring-manager judge fix (`M:/AGENT_VAULT/PORTFOLIO/hiring_systems/PROFILE_JUDGE_2026-09-20.md`): "AI ENGINEER
  | EVALUATION, AGENTS & RETRIEVAL" replaced with "AI EVALUATOR | TEXT, RUBRIC & CHART REVIEW, DATA QUALITY | REMOTE, UTC+7 |
  $35-60/HR" — the judge's shortlist note said the old banner "never says the words I search on (text evaluation, rubric
  grading, RLHF rating, chart review) and it carries no availability, no time-zone line beyond the address, no rate."
  Nothing else changed.

## [r21] - 2026-09-20
### Added
- Gnomon: one line of deck/presentation-design work ("Presentation design and slide reconstruction of a ten-slide
  Gnomon sales deck: action titles, data visualization, rationale log."), added because an OpenTrain interviewer
  (2026-09-19) said deck work wasn't on the resume although the candidate had spoken about it. No tool name (e.g.
  PowerPoint) is claimed.
### Changed
- VFX role titles and lead-in wording, Founder order 2026-09-20 15:29 ("anything VFX related, it's applied AI ops
  for VFX"; the CV of record must never say "3D artist" or "3D generalist"): OTSU Labs retitled "Applied AI
  Operations, VFX Production" (was "Forward-Deployed 3D Generalist"), bullet now leads "Ran Applied AI Operations
  across VFX production projects in partnership with Sparta VFX and Sparx"; FPT "Fragments of the Deep" retitled
  "Applied AI Operations Lead" (was "Creative Lead"); Dihaan Media retitled "Applied AI Operations" (was
  "Forward-Deployed 3D Artist"). All facts, numbers and gate markers (Sparta VFX, Sofitel Saigon Plaza, dates,
  the anime-conversion and IES-lighting bullets) are unchanged.
### Not used, by space
- Client proposal board (three versions: sell, demo, quote), the written-spec detail (three fonts, thirteen canon
  colours, zero banned words, script-checked) and the 25-design-violations count: every phrasing tested that
  included any of these pushed the PDF to two pages. Page was already at its exact one-page limit at r20 (705
  words); the shipped r21 draft is 723 words, still one page. These facts stay in `MASTER_CV.md` for a future
  revision with room.

## cv-r20 — 2026-09-18 — commit d037f0b — sha256 723c589714531727 — audited against every earlier version (20 files, 107 facts)
### Added (restored from earlier versions; each corroborated in two or more files)
- Gnomon: facts-not-grades architecture; fail-closed evaluation harness counts (2,232 criterion units, 629 essays,
  1,866 admitted, 366 refused); LLM-as-judge on a frozen, hash-checked evidence window; KD-tree exemplar retrieval;
  QLoRA on a 27B open-weight model (4-bit NF4); two-provider coding-agent fleet under policy-as-code guardrails
  (1,219-case deck); product scale (43 router modules, 79 migrations, TOTP MFA, 1,117 backend tests).
- Projects: 239 tests and CI on failclosed-eval; 455 tests on policy-deck; Kaggle S6E9 public score 0.94151.
- VFX: anime-conversion work with the 2D team; IES-based lighting; storyboard and camera direction (both had
  slipped out between r18 and r19).
- Skills: LLM-as-judge; KD-tree; policy-as-code agent guardrails.
### Changed
- Peer-level wording: "in partnership with Sparta VFX and Sparx" replaces "under supervision"; "shipped" replaces
  "directed delivery"; the open pull request is stated without "not yet merged".
- FPT Software condensed to one line; margins tightened to hold one page (705 words).
### Not used, by rule
- Single-source claims (one contract name), degree field, "English: Native", any accuracy or hold figure, vendor
  names for the agent fleet. Full reasoning in the private master CV.

## cv-r19 — 2026-09-18 — commit 3c8a3de — sha256 81f0d94991e68b9a
### Changed
- Forward-deployed VFX section condensed to one line per role (OTSU Labs 2025, FPT "Fragments of the Deep"
  07/2024–2025, Dihaan Media 2023, contract engagements 2023–present).
### Kept
- Hackathon and competition line (uh-huh, ARC White-Box, Kaggle S6E9, OpenCV).

## cv-r18 — 2026-09-18 — commit 4fe114c — sha256 56550c4df5b9a4df (superseded same day, no tag)
### Added
- Hackathon and competition line restored; it had been dropped without record in the 13 Sep rebuild.

## cv-r17 — 2026-09-18 — commit c457c1b — sha256 8422de18aee5b639 (superseded same day, no tag)
### Added
- Forward-deployed engineering, VFX and AI, 2023–2025: Dihaan Media, FPT "Fragments of the Deep", OTSU Labs.

## Before r17
Twelve earlier files across three numbering lines (7–13 Sep). None are tagged. Their facts are inventoried in
`cv/MASTER_CV.md`; their hashes and the reason the numbers collided are in the private register.
