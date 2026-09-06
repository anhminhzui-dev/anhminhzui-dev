# GitHub profile README — copy-ready (Revision 2)

**Revision 2, 2026-09-06.** Built from `GITHUB_PROFILE_README.md` (r1). Structure unchanged. The
"Pinned work" section is replaced by a "What I build" table (2 flagship repos + 6 prototypes, in
`prototypes/PROTOTYPES_VERDICT.md`'s publish order) and a "How these were made" paragraph is added.
Two further prototypes exist outside that verdict's judged set and are named, not detailed, in a
footnote below the table — see "8 accounted for" at the end of this note.

**Where this goes.** A repository named exactly `anhminhzui-dev` (same as the account name), public,
with this text as `README.md` at the root. GitHub then renders it at the top of
`github.com/anhminhzui-dev`. Created in STAGE B of `PUBLISH_RUNBOOK.md`, not before.

**Privacy rules applied to this file:** no phone number, no personal email address, no machine paths, no
customer or institution names, no student data, no band/grade values, no accuracy figure. The only
contact route offered is LinkedIn. Job-posting employer names (OpenTrain AI, Virtuos, TalentCo, Dipodo
Games) are kept — they are the reader each prototype answers, not a customer or institution of the
private product.

---

## ---------- COPY EVERYTHING BELOW THIS LINE ----------

## Vo Ba Hoang Minh

**Technical 3D artist turned AI evaluation engineer. I direct agent fleets and design the gates that
catch them.**

I spent my career on 3D pipelines — optimisation, LOD, asset management, real-time engines, and lead of
the artist team on an animated short. In 2026 I turned the same discipline on AI systems: I directed
fleets of Claude and Codex agents to build an essay-grading engine. The agents wrote most of the code.
I designed the evaluation and control layer, ran the verification, and caught the failures.

Below are two extractions of that layer onto synthetic data with a generic rubric, plus a set of
single-day builds made directly for specific job postings — so all of it can be read and run by someone
with no access to the private system.

### What I build

| Repo | Built for | What it refuses | Tests |
|---|---|---|---|
| **[failclosed-eval](https://github.com/anhminhzui-dev/failclosed-eval)** | General thesis — *"an evaluation harness that refuses instead of guessing"* (not one posting) | A broken-input run: halts with a typed refusal code and a non-zero exit instead of a guessed number; its own leak-scanner false-positive rate is measured and published. | 239 tests, 8 of 8 seeded-bad fixtures refuse |
| **[policy-deck](https://github.com/anhminhzui-dev/policy-deck)** | General thesis — *"a guardrail is a classifier, so score it like one"* (not one posting) | Any shell-command call outside its 4 verdicts — graded like a classifier against frozen sha-pinned decks, and the scorer exits non-zero on a false-positive/false-negative budget breach. | 455 tests |
| **[mcp-trajectory-judge](https://github.com/anhminhzui-dev)** | *"Evaluate how effectively AI agents use MCP tools"* — OpenTrain AI, MCP AI Software Evaluation Engineer | 9 named codes (unknown tool, bad/undeclared argument, destructive-without-read, step-budget, loop, ignored error, unmet goal, false success claim) plus 3 run-level halts; abstains on a row it cannot replay. | 16 of 16 |
| **[rollout-sentinel](https://github.com/anhminhzui-dev)** | *"Analyze coding-agent rollouts for completion and unsafe behavior..."* — OpenTrain AI, Senior Coding-Agent Benchmark Engineer | 9 named codes (disabled test, weakened assertion, deleted protected data, leaked secret, broadened permission, bypassed validation, hidden-suite failure, false completion); a malformed row abstains, never passes. | 23 of 23 |
| **[asset-admission-gate](https://github.com/anhminhzui-dev)** | *"...ingests an exported 3D-asset manifest...and refuses...any row that breaks the budget"* — brief set by a studio technical director, attached to Virtuos, Technical Artist (Riot Games Projects) | Triangle-budget, LOD-chain, texture-budget and naming breaks — a named code and the arithmetic behind it, never a silent drop. | 23 of 23 |
| **[release-gate](https://github.com/anhminhzui-dev)** | *"Define evaluation strategies, metrics, acceptance thresholds and release gates..."* — TalentCo, Senior AI Evaluation Engineer | Out-of-range score, duplicate row, undeclared criterion, non-synthetic row, missing field — and a GO requires the **resampled lower bound** to clear the floor, not the mean. | 14 of 14 |
| **handoff-check** *(private — until it ships as the second link beside asset-admission-gate, on the same Virtuos posting)* | *"...scripting or automation skills in any language..."* — Virtuos, Technical Artist (Riot Games Projects) | A tampered file, an undelivered ready ticket, an unmoved version, a file in the wrong folder — named, never dropped silently; the webhook body is printed, never sent. | 16 of 16 |
| **lookdev-lighting-gate** *(private — its overlap counter undercounts a real light pile-up; held until that is fixed and its breakdown reel exists)* | *"...optimized high-end real-time lighting scenarios"* — Dipodo Games, Lighting & LookDev Artist | Mood drift, lookdev drift/unapproved master, shader/sampler/shadow/light-radius budget breaks, naming — 10 codes, per level, and one level's refusal holds the whole sequence. | 23 of 23 |

Two more single-day builds — **model-error-translator** (for a hosted-model-integration posting) and
**real-token-meter** (for a training-throughput posting) — exist in the same estate. They are held
private and are not detailed here because they sit outside the verdict pass the six rows above already
cleared; naming them without a test claim is deliberate, not an omission.

### How these were made

Agents — Claude and Codex — wrote most of the lines in every repository above, against a contract I set
and reviewed line by line. Each one ships a seeded-bad fixture that must fail — if it stops failing, the
guard is gone — plus a falsifier test that tries to break the rule it enforces, so the guard's bite is
proven, not assumed. Nothing here is claimed that a stranger cannot run themselves, in about a minute,
with nothing installed but a test runner.

### How to read these

Both flagship repositories publish their own failures. `policy-deck`'s holdout found 21 false negatives
in my own rules against a budget of zero — that FAIL receipt is printed in the changelog beside the fix.
`failclosed-eval` shipped with its flagship leak gate switchable off by a token printed in its own
README; an independent reviewer found it, and the before/after is in the changelog. I would rather show
the repository that found the hole than the one that never looked.

None of the repositories or prototypes states an accuracy figure for the private grading engine. That
measurement was never completed, and it is recorded as MISSING rather than estimated.

### Licence

Every entry above — both flagship repositories and every prototype, public or held private — is
**source-available, evaluation-only**. You are welcome to read a public one and run it to evaluate my
work. None is open source: reuse, redistribution, derivative works and commercial use are not granted.
See each repository's `LICENSE`.

### Contact

LinkedIn: ``

## ---------- COPY EVERYTHING ABOVE THIS LINE ----------

---

## Topics to set on repositories as each goes public

Set via Settings on each repository, or by the API call in `PUBLISH_RUNBOOK.md` STAGE B step B2. The
four linked prototypes take the same topic set when they flip public; `handoff-check` and
`lookdev-lighting-gate` take it only once their own private-reason above is cleared.

```
evaluation
llm-evaluation
guardrails
policy-as-code
testing
python
```

## One-line repository descriptions (the `description` field)

| Repository | Description (set in STAGE B) |
|---|---|
| `failclosed-eval` | An evaluation harness that refuses instead of guessing: typed refusal codes, seeded-bad fixtures that must fail, and a leak scanner whose false-positive rate is published. |
| `policy-deck` | A guardrail is a classifier, so score it like one: 11 shell-command policy rules graded against frozen sha-pinned decks under a published false-positive/false-negative budget. |
| `mcp-trajectory-judge` | Replays a recorded MCP tool-call trajectory against a deterministic sandbox and returns PASS, FAIL with named codes, or ABSTAIN — never a guess. |
| `rollout-sentinel` | Scores a coding-agent rollout against a sha-pinned deck of labelled rows for disabled tests, weakened assertions, leaked secrets and false completion. |
| `asset-admission-gate` | Refuses an exported 3D-asset manifest row that breaks a per-category triangle, LOD, texture or naming budget — named code, never a silent drop. |
| `release-gate` | A release clears only when the resampled lower bound of its rubric scores clears the policy floor — not the mean. |

## Source citations for every test count in the table above

| Repo | Test count | Cited from |
|---|---|---|
| failclosed-eval | 239 tests, 8 of 8 seeded-bad fixtures refuse | `GITHUB_PROFILE_README.md` (r1), line 33 — this lane's own copy of that repo's README claim |
| policy-deck | 455 tests | `GITHUB_PROFILE_README.md` (r1), line 46 |
| mcp-trajectory-judge | 16 of 16 | `prototypes/mcp-trajectory-judge/README.md` (refusal-code table), cross-checked against `prototypes/PROTOTYPES_VERDICT.md` "What I ran" — `python -m pytest -q` |
| rollout-sentinel | 23 of 23 | `prototypes/rollout-sentinel/README.md`, cross-checked against `PROTOTYPES_VERDICT.md` "What I ran" |
| asset-admission-gate | 23 of 23 | `prototypes/asset-admission-gate/README.md`, cross-checked against `PROTOTYPES_VERDICT.md` "What I ran" |
| release-gate | 14 of 14 | `prototypes/release-gate/README.md`, cross-checked against `PROTOTYPES_VERDICT.md` "What I ran" |
| handoff-check | 16 of 16 | `prototypes/handoff-check/README.md`, cross-checked against `PROTOTYPES_VERDICT.md` "What I ran" |
| lookdev-lighting-gate | 23 of 23 | `prototypes/lookdev-lighting-gate/README.md`, cross-checked against `PROTOTYPES_VERDICT.md` "What I ran" |

Total for the six prototypes: 115 of 115 — `PROTOTYPES_VERDICT.md`, "What I ran" section, same run. The
two footnoted prototypes (model-error-translator, real-token-meter) carry no test-count claim here
because they sit outside that verdict pass — their own READMEs were read for this revision but were not
independently re-run, so no number for them is asserted.

## Checks before this file goes public

- [ ] `` filled in, or the Contact section deleted entirely.
- [ ] Every `https://github.com/anhminhzui-dev` bracket above resolves (repositories 404 while private — this file publishes in
      STAGE B, after each flip, so links are live when a reader arrives).
- [ ] For `handoff-check` and `lookdev-lighting-gate`: re-check the stated private-reason is still true
      before removing it — a stale reason left in place after the blocker clears is its own defect.
- [ ] The line about CI is deliberately absent. Add "CI green" language only after a run has been
      observed green, never before.
- [ ] No phone number, no email address, no machine path, no customer name, no grade value anywhere in
      the copied block. Re-read the block once with that list in hand before committing.
