"""Demo glue code for the in-browser evaluator. This file is NOT part of the upstream
failclosed-eval package -- it lives outside the failclosed_eval/ folder on purpose, so the
three upstream files (rubric.py, provenance.py, validators.py) stay byte-identical and easy
to diff against github.com/anhminhzui-dev/failclosed-eval. All it does is call the upstream
build_payload() unmodified, time it, and shape the result as JSON for the page to render.
"""
from __future__ import annotations

import json
import time

from failclosed_eval.validators import build_payload, FailClosedError, HaltError

# This list mirrors validators.build_payload's own documented, binding order of operations
# (see its docstring: "Order of operations is binding -- the error a bad record produces
# depends on it"). Each entry is (code, required exc.detail or None, human label). The list
# is presentation only -- it narrates which step build_payload's own short-circuit control
# flow reached before it stopped; it never re-implements or re-decides anything.
CHECK_STEPS = [
    ("UNKNOWN_CRITERION", None, "Criterion is one of the four rubric names"),
    ("UNKNOWN_ITEM_TYPE", None, "Item type is 'figure' or 'text'"),
    ("MISSING_INSTRUCTION", None, "Instruction is present when the item type needs one"),
    ("LABEL_LEAK_IN_PROMPT", "instruction", "Instruction carries no value-carrying label"),
    ("LABEL_LEAK_IN_PROMPT", "response_text", "Response text carries no value-carrying label"),
    ("INVALID_IMAGE_PAYLOAD", None, "Image payload is well-formed, if one was given"),
    ("UNRESOLVED_IMAGE", None, "Image file resolves, if a path was given"),
    ("INPUT_IMAGE_REQUIRED", None, "Image is present when the item type requires one"),
    ("IMAGE_SLOT_MISSING", None, "Image slot passes its own post-build self-check"),
]


def _matches(step: tuple[str, str | None, str], exc: FailClosedError) -> bool:
    code, needs_detail, _label = step
    if code != exc.code:
        return False
    if needs_detail is not None and exc.detail != needs_detail:
        return False
    return True


def admit_json(record_json: str) -> str:
    """Takes one JSON record (as text), returns one JSON result (as text). The only
    upstream call made here is build_payload(record) -- everything else is formatting."""
    try:
        record = json.loads(record_json)
    except json.JSONDecodeError as exc:
        return json.dumps({"outcome": "ERROR", "code": None, "message": f"not valid JSON: {exc}"})

    if not isinstance(record, dict):
        return json.dumps({"outcome": "ERROR", "code": None, "message": "record must be a JSON object"})

    t0 = time.perf_counter()
    try:
        payload = build_payload(record)
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        return json.dumps({
            "outcome": "ADMITTED",
            "code": None,
            "elapsed_ms": elapsed_ms,
            "checks": [{"label": lbl, "status": "pass"} for _, _, lbl in CHECK_STEPS],
            "image_required": payload["image_slot"]["required"],
            "image_sha256": payload["image_slot"]["sha256"],
        })
    except FailClosedError as exc:
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        checks = []
        failed = False
        for step in CHECK_STEPS:
            if failed:
                checks.append({"label": step[2], "status": "skip"})
            elif _matches(step, exc):
                checks.append({"label": step[2], "status": "fail"})
                failed = True
            else:
                checks.append({"label": step[2], "status": "pass"})
        return json.dumps({
            "outcome": "HALT" if isinstance(exc, HaltError) else "REFUSED",
            "code": exc.code,
            "detail": exc.detail,
            "elapsed_ms": elapsed_ms,
            "checks": checks,
        })
    except Exception as exc:  # last resort: never let an unnamed error escape silently
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        return json.dumps({
            "outcome": "ERROR",
            "code": "UNEXPECTED_ERROR",
            "message": str(exc),
            "elapsed_ms": elapsed_ms,
            "checks": [],
        })
