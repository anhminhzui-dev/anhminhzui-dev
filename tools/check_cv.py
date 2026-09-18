"""CV staleness gate. Runs in CI on every push and locally before every publish.

Fails (exit 1) when any of these is false:
  1. the three CV copies (repo root, site/public, docs) are byte-identical;
  2. their sha256 equals the one recorded in site/public/cv_version.json;
  3. the CV text carries every required marker (employers, sections, contact);
  4. docs/index.html carries every employer named on the CV.

Rule (2026-09-18): the CV of record is the file in this repository. Nothing is
attached anywhere from any other path. A CV that drops a section cannot be
published, because this gate names the sections.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CV_NAME = "Vo_Ba_Hoang_Minh_CV.pdf"
COPIES = [ROOT / CV_NAME, ROOT / "site" / "public" / CV_NAME, ROOT / "docs" / CV_NAME]
VERSION_FILE = ROOT / "site" / "public" / "cv_version.json"
PAGE = ROOT / "docs" / "index.html"

# Every marker below must appear in the CV text. Add a line here when a section is added;
# never remove one without a Founder-recorded reason in the commit message.
REQUIRED_IN_CV = [
    "VO BA HOANG MINH",
    "minhhoang250803@gmail.com",
    "anhminhzui-dev.github.io",
    "Gnomon",
    "FPT Software",
    "FPT Education",
    "OTSU Labs",
    "Fragments of the Deep",
    "Dihaan Media",
    "Contract engagements",
    "failclosed-eval",
    "policy-deck",
    "Hackathon and competition entries",
    "Kaggle",
    "lm-evaluation-harness",
    # r20 restorations (2026-09-18): the facts the ledger found dropped between r15 and the 13 Sep rebuild
    "facts-not-grades",
    "2,232 criterion units",
    "27B",
    "policy-as-code",
    "1,117 backend tests",
    "239 tests",
    "455 tests",
    "0.94151",
    "Sparta VFX",
    "Sofitel Saigon Plaza",
    "FPT University | Bachelor's degree.",
]
# Employers the site timeline must also carry (the page and the CV never disagree).
REQUIRED_ON_PAGE = ["Gnomon", "FPT Software", "FPT Education", "OTSU Labs", "Fragments of the Deep", "Dihaan Media"]
FORBIDDEN = ["anhminhzui.dev/", "Co-Authored-By", "field of study"]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def cv_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:  # pragma: no cover
        from PyPDF2 import PdfReader  # type: ignore
    return " ".join(" ".join((p.extract_text() or "") for p in PdfReader(str(path)).pages).split())


def main() -> int:
    failures: list[str] = []
    for p in COPIES:
        if not p.is_file():
            failures.append(f"missing copy: {p}")
    if failures:
        print("\n".join("FAIL " + f for f in failures))
        return 1
    hashes = {str(p): sha256(p) for p in COPIES}
    if len(set(hashes.values())) != 1:
        failures.append("CV copies differ: " + ", ".join(f"{k}={v[:16]}" for k, v in hashes.items()))
    live = next(iter(hashes.values()))
    if not VERSION_FILE.is_file():
        failures.append(f"missing {VERSION_FILE}")
    else:
        meta = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
        if meta.get("sha256") != live:
            failures.append(f"cv_version.json sha256 {str(meta.get('sha256'))[:16]} != file {live[:16]}")
    text = cv_text(COPIES[0])
    for m in REQUIRED_IN_CV:
        if " ".join(m.split()) not in text:
            failures.append(f"CV lost required marker: {m}")
    for m in FORBIDDEN:
        if m in text:
            failures.append(f"CV carries forbidden text: {m}")
    page = PAGE.read_text(encoding="utf-8", errors="replace") if PAGE.is_file() else ""
    for m in REQUIRED_ON_PAGE:
        if m not in page:
            failures.append(f"docs/index.html lost employer: {m}")
    if failures:
        print("\n".join("FAIL " + f for f in failures))
        return 1
    print(f"CV_GATE_OK sha256={live[:16]} version={json.loads(VERSION_FILE.read_text(encoding='utf-8')).get('version')} markers={len(REQUIRED_IN_CV)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
