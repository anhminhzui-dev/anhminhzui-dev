# Vo Ba Hoang Minh

**AI engineer, evaluation, agents and retrieval. Three years of VFX production before that.** Ho Chi Minh City, remote worldwide.

[Portfolio](https://anhminhzui-dev.github.io/anhminhzui-dev/) · [One-page CV](https://anhminhzui-dev.github.io/anhminhzui-dev/Vo_Ba_Hoang_Minh_CV.pdf) · [Technical report, Zenodo](https://doi.org/10.5281/zenodo.22675789) · [Engineering write-up](writeups/2026-09-07-destructive-git-refusal-gate.md)

## What I build
Founder of Gnomon, a writing-assessment product delivered to teachers and clients. The model never emits a grade: it produces evidence grounded in source spans, a deterministic scorer maps facts to the result, and an abstain layer refuses on thin evidence. Under it: 101,175 records screened through 44 data-quality checks, a fail-closed evaluation harness (2,232 criterion units, 1,866 admitted, 366 refused), QLoRA fine-tuning of a 27B open-weight model, and a two-provider coding-agent fleet run under policy-as-code guardrails.

## Public evaluation tools
| Repository | What it checks | Evidence |
|---|---|---|
| [failclosed-eval](https://github.com/anhminhzui-dev/failclosed-eval) | input admission: images, leakage, duplicates | 375 of 500 payloads admitted, 125 refused; 239 tests, CI |
| [policy-deck](https://github.com/anhminhzui-dev/policy-deck) | command-policy classification | 8 FP / 0 FN on 1,260 fitted cases, 2 / 0 on 190 separate; 455 tests |
| [relay-gate](https://github.com/anhminhzui-dev/relay-gate) | false completion claims by agents | benchmarked on MAST and AgentRewardBench; 81 tests |
| [mcp-trajectory-judge](https://github.com/anhminhzui-dev/mcp-trajectory-judge) | tool trajectories vs completion claims | deterministic sandbox replay |
| [rollout-sentinel](https://github.com/anhminhzui-dev/rollout-sentinel), [release-gate](https://github.com/anhminhzui-dev/release-gate), [model-error-translator](https://github.com/anhminhzui-dev/model-error-translator), [real-token-meter](https://github.com/anhminhzui-dev/real-token-meter) | rollout, release, error and cost checks | tests and CI in each repo |

Open pull request to EleutherAI's lm-evaluation-harness: [#4115](https://github.com/EleutherAI/lm-evaluation-harness/pull/4115), isolated DummyLM tests.

## Competitions, September 2026
[uh-huh](https://github.com/anhminhzui-dev/uh-huh) voice-agent hackathon entry (lablab.ai) · [arc-whest](https://github.com/anhminhzui-dev/arc-whest) scored submission, ARC White-Box Estimation (AIcrowd) · Kaggle Playground S6E9, public score 0.94151 · [opencv-entry](https://github.com/anhminhzui-dev/opencv-entry) registered.

## Before AI
Forward-deployed 3D generalist at OTSU Labs with Sparta VFX (2025); creative lead on FPT's Unreal Engine short "Fragments of the Deep" (2024–2025); embedded 3D artist at Dihaan Media (2023). Frame-by-frame judgment to a studio standard, on deadline, is where the evaluation habit comes from.

## Contact
minhhoang250803@gmail.com · [LinkedIn](https://www.linkedin.com/in/minh-v%C3%B5-b%C3%A1-ho%C3%A0ng-287942366/)
