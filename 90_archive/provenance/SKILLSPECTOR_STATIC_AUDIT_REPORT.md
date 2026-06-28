# SkillSpector Static Audit Report

Date: 2026-06-28

Source tool: `nvidia/skillspector`

## Method

SkillSpector was downloaded from GitHub and its documented scanner behavior was reviewed. The local Python package install could not complete in this environment because dependency installation repeatedly timed out, and Docker was not available.

Fallback used: SkillSpector's own static analyzer pattern modules were parsed locally and run against the Super Build Kit files. This was a static-only pass modeled on SkillSpector `--no-llm`. It did not execute kit files and did not send kit file contents to an LLM provider.

## Scope

Scanned active kit files with text/script/config extensions, excluding:

- `.git/`
- the temporary SkillSpector download
- the temporary SkillSpector virtual environment
- generated scanner output
- `node_modules/`

The scan loaded 418 static regex patterns and scanned 106 active files.

## Findings Summary

| Rule | Count | Triage |
|---|---:|---|
| AS3 Skill Enumeration | 543 | False positive. The kit intentionally references its own local `skills/.../SKILL.md` files in load order, adapter, README, and doctor files. It does not instruct a skill to enumerate a user's installed skill directories. |
| EA3 Scope Creep | 2 | False positive. Both matches are guardrails saying not to broaden scope silently. |
| EA2 Autonomous Decision Making | 2 | False positive. Both matches are guardrails saying not to act without approval or verification. |
| P1 Instruction Override | 1 | False positive. The match is an AI-security test instruction saying retrieved content must not override system authority. |
| P6 System Prompt Leakage | 1 | False positive. The match is a heading named `Output Rules` in a writing-quality skill, not a system prompt disclosure instruction. |
| AR2 Disclaimer Suppression | 1 | Accepted low-risk wording in the APIVR source copy. The phrase means keep Rapid work concise, not suppress safety warnings. |

## Remediation Performed

Two root-level maintainer publishing scripts were flagged for GitHub API transmission in the first pass. They were not needed for ordinary users or downstream agents, so they were removed from the active root and archived with non-executable `.archived` names under:

`90_archive/provenance/repo_publishing_scripts/`

Those scripts are now provenance-only and are not referenced by `START_HERE`, `LOAD_ORDER`, adapter files, package scripts, skills, or doctor checks.

## Safety Verdict

Static-only SkillSpector-style verdict: `PASS WITH REVIEWED FALSE POSITIVES`.

The active kit does not contain confirmed malicious skill behavior, secret harvesting, credential-file access, remote bootstrap execution, persistence installation, or unbounded autonomous action instructions based on this pass.

## Limitations

- This was not a full SkillSpector CLI run because local installation timed out.
- This was not an LLM semantic scan.
- SkillSpector static rules are intentionally high-recall and produce false positives on security policy documents and skill load-order files.
- Public releases should re-run the official SkillSpector CLI or Docker scanner when a supported environment is available.
