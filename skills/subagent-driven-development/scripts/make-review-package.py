#!/usr/bin/env python3
"""Create an APIVR review package markdown file from changed-file and evidence inputs."""

from __future__ import annotations

import argparse
from pathlib import Path


def read_optional(path: str | None) -> str:
    if not path:
        return ""
    target = Path(path)
    if not target.exists():
        raise SystemExit(f"Missing input file: {target}")
    return target.read_text(encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a subagent review package.")
    parser.add_argument("--apivr-tier", required=True)
    parser.add_argument("--objective", required=True)
    parser.add_argument("--plan", help="Path to APIVR plan excerpt")
    parser.add_argument("--diff", help="Path to diff or changed-file list")
    parser.add_argument("--evidence", help="Path to evidence ledger excerpt")
    parser.add_argument("--concerns", help="Path to implementer concerns")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    sections = [
        "# APIVR Review Package",
        "",
        f"APIVR tier: {args.apivr_tier}",
        f"Objective: {args.objective}",
        "",
        "## Plan",
        read_optional(args.plan) or "No plan excerpt supplied.",
        "",
        "## Diff Or Changed Files",
        read_optional(args.diff) or "No diff or changed-file list supplied.",
        "",
        "## Evidence",
        read_optional(args.evidence) or "No evidence excerpt supplied.",
        "",
        "## Implementer Concerns",
        read_optional(args.concerns) or "No concerns supplied.",
        "",
        "## Reviewer Output Required",
        "- Findings",
        "- Evidence State",
        "- Required Fixes",
        "- Verdict: PASS / CONDITIONAL PASS / PARTIAL / FAIL / BLOCKED",
        "",
    ]

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(sections), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
