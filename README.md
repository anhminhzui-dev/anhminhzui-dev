# Minh Vo

*Vo Ba Hoang Minh*

**Senior AI Evaluation Engineer | Fail-closed evaluation systems for non-deterministic AI | Directed a two-provider agent fleet (Codex + Claude) to build an essay-grading platform**

Senior AI Evaluation Engineer designing and validating evaluation systems for non-deterministic AI.

Through 2026 I directed a two-provider fleet of AI coding agents, Codex and Claude, to deliver an essay-grading engine and its multi-tenant platform: setting every delivery contract, and reviewing the policy and gating layer myself.

The seven repositories below are the source-available, evaluation-only proof of that layer, extracted onto synthetic data so anyone can read and run them with no access to the private system.

### What I build

| Repo | What it refuses or scores | Tests | Posting it answers |
|---|---|---|---|
| <a href="https://github.com/anhminhzui-dev/failclosed-eval">failclosed-eval</a> | A broken input run halts with a typed refusal code and a non-zero exit instead of a guessed number; the leak scanner's own false-positive rate is measured and published. | 239 tests, 8 of 8 seeded-bad fixtures refuse | General thesis, not tied to one posting |
| <a href="https://github.com/anhminhzui-dev/policy-deck">policy-deck</a> | Any shell-command call outside its four verdicts is graded like a classifier against frozen, hash-pinned decks; the scorer exits non-zero on a false-positive or false-negative budget breach. | 455 tests | General thesis, not tied to one posting |
| <a href="https://github.com/anhminhzui-dev/rollout-sentinel">rollout-sentinel</a> | Nine named codes on a coding-agent rollout: disabled test, weakened assertion, deleted protected data, leaked secret, broadened permission, bypassed validation, hidden-suite failure, false completion. A malformed row abstains, never passes. | 28 of 28 | OpenTrain AI, Senior Coding-Agent Benchmark Engineer |
| <a href="https://github.com/anhminhzui-dev/mcp-trajectory-judge">mcp-trajectory-judge</a> | Nine named codes on an MCP tool-call trajectory: unknown tool, bad or undeclared argument, a destructive action taken without a prior read, step budget, loop, ignored error, unmet goal, false success claim. Plus three run-level halts, and it abstains on a row it cannot replay. | 20 of 20 | OpenTrain AI, MCP AI Software Evaluation Engineer |
| <a href="https://github.com/anhminhzui-dev/release-gate">release-gate</a> | Out-of-range score, duplicate row, undeclared criterion, non-synthetic row, missing field. A GO requires the resampled lower bound to clear the floor, not the mean. | 14 of 14 | TalentCo, Senior AI Evaluation Engineer |
| <a href="https://github.com/anhminhzui-dev/real-token-meter">real-token-meter</a> | A training-log row with padding over budget, an untrusted cost rate, a non-finite token count, or a duplicate step. Every reported figure is printed next to the denominator it was computed over. | 26 of 26 | micro1, Machine Learning Engineer (Contractor) |
| <a href="https://github.com/anhminhzui-dev/model-error-translator">model-error-translator</a> | A request that fails a model's own size, format or field limit before the call goes out; a failure payload the rules do not recognise comes back as an abstain, never a guess. | 18 of 18 | Griptape (Foundry), Software Engineer, Model Integrations |

### Demo

<img src="./assets/product_walk.gif" alt="Product walk-through: sign in, open a released report, scroll the evidence panel, read the signed footer" width="720">

A released report from the private platform, walked end to end: sign-in, the report opening on
its formative-feedback notice, a scroll through the evidence panel, and the signed, referenced
footer. Demo account and demo institution throughout; the essay shown is a synthetic submission,
never a real student's work.

### How I work

Fail-closed: every gate here refuses when it cannot decide, rather than guessing an answer.

Seeded negatives: every guard ships a fixture built to defeat it, so a guard that stops catching anything gets caught too.

Receipts: every run prints or writes the evidence behind its verdict, not the verdict alone.

Hash-pinned decks: in policy-deck and rollout-sentinel the reference deck a score is checked against is frozen by hash and admission fails if it moves; the other repositories record a hash in their receipts so a change is visible after the fact.

### Papers and write-ups

- Technical report, September 2026: [Gnomon: Architecture and Operational Evidence for an IELTS Writing Feedback Engine](papers/2026-09-gnomon-ielts-feedback-engine-technical-report.pdf) (19 pages; a systems-and-evidence report, no accuracy claim).
- Write-up: [A destructive-git refusal gate built from a live incident](writeups/2026-09-07-destructive-git-refusal-gate.md).

### Boundaries

Every repository above is source-available and evaluation-only, never open source. Every fixture in every one of them is synthetic data invented for that repository, never a real student, essay or institution.

### Contact

Email: minhhoang250803@gmail.com

