# Stripe PCI Readiness Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a portable, evidence-led Stripe PCI readiness audit skill with strict primary-source controls and a sanitised regression case for misleading compliance assessments.

**Architecture:** A concise `SKILL.md` routes agents to a detailed audit checklist and mandatory source policy. A dependency-free Node validator checks package structure, frontmatter, local links, secret safety, and required release invariants; behavioural evaluation uses documented fixtures because deterministic text matching cannot prove model conduct.

**Tech Stack:** Markdown Agent Skills format, Node.js built-ins, GitHub Actions, Apache-2.0.

**Spec:** `docs/superpowers/specs/2026-09-02-stripe-pci-readiness-skill-design.md`

## Global Constraints

- Work only in the standalone `stripe-pci-readiness-skill` repository.
- Never include Grey Space Project implementation details, credentials, customer data, or repository evidence.
- Use current PCI SSC and Stripe primary sources for material compliance claims.
- Classify unsupported or unavailable claims as `not verified`; never infer a pass.
- Keep audits read-only by default and never claim certification or a definitive SAQ determination.
- Use one canonical Agent Skills implementation with no provider-specific runtime dependency.
- Add no runtime dependencies in version 1.

---

### Task 1: Establish the validation contract

**Files:**
- Create: `package.json`
- Create: `tests/validate-skill.mjs`

**Interfaces:**
- Consumes: repository root and the file layout defined by the design specification.
- Produces: `npm test`, which exits zero only when the distributable skill satisfies structural and safety invariants.

- [ ] **Step 1: Write the validation script before creating distributable files**

The script uses `node:assert`, `node:fs`, and `node:path` to verify required paths; parse `SKILL.md` frontmatter; resolve Markdown links to local files; reject scaffold placeholders and likely Stripe secrets; require the non-certification boundary; and require the source policy, standalone prompt, and regression fixture.

- [ ] **Step 2: Add the package test command**

```json
{
  "name": "stripe-pci-readiness-skill",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node tests/validate-skill.mjs"
  },
  "engines": {
    "node": ">=20"
  },
  "license": "Apache-2.0"
}
```

- [ ] **Step 3: Run the validator and verify RED**

Run: `npm test`

Expected: non-zero exit identifying `skills/stripe-pci-readiness/SKILL.md` as missing.

- [ ] **Step 4: Commit the failing contract**

```bash
git add package.json tests/validate-skill.mjs
git commit -m "test: define skill release contract"
```

### Task 2: Implement the canonical skill and evidence model

**Files:**
- Create: `skills/stripe-pci-readiness/SKILL.md`
- Create: `skills/stripe-pci-readiness/references/source-policy.md`
- Create: `skills/stripe-pci-readiness/references/audit-checklist.md`
- Create: `skills/stripe-pci-readiness/assets/copy-paste-prompt.md`
- Create: `tests/fixtures/misleading-saq-a-assessment.md`

**Interfaces:**
- Consumes: current official PCI SSC and Stripe documentation, repository/runtime evidence, and merchant assertions.
- Produces: a preliminary PCI-readiness report with a claim ledger, confidence, counter-evidence result, prioritised remediation, and explicit unknowns.

- [ ] **Step 1: Add the sanitised baseline regression fixture**

Model the known failure modes without names or project data: “SAQ A means no ASV scans,” server out-of-scope by absence of PAN, definitive SAQ/merchant-level claims, inaccurate iframe history, incorrect script-criterion logic, incomplete CSP assertions, and repository evidence overstated as runtime proof.

- [ ] **Step 2: Write the mandatory source policy**

Define primary/secondary/non-authoritative tiers; freshness and applicability checks; direct inline citations; claim-ledger fields; counter-evidence search; conflict resolution; and fail-closed `not verified` outcomes.

- [ ] **Step 3: Write the audit checklist**

Cover payment capture, browser scripts, scope-affecting systems, TLS and headers, server-side amount integrity, secrets, environment separation, webhooks, logging/storage/backups, dependencies, access control, incident response, retention, operational channels, SAQ eligibility, ASV evidence, and accepting-entity confirmation.

- [ ] **Step 4: Write the concise skill entrypoint**

Use portable frontmatter:

```yaml
---
name: stripe-pci-readiness
description: Use when reviewing a repository or deployed web application that accepts online payments through Stripe for PCI DSS scope, card-data exposure, SAQ readiness, payment-page security, or webhook controls.
---
```

Route every audit to both reference files. Require read-only evidence collection, source verification, explicit evidence classes, secret redaction, preliminary classification only, and the mandated report disclaimer.

- [ ] **Step 5: Write the standalone prompt**

Mirror the skill’s safety, source-policy, evidence-classification, claim-ledger, ASV, and non-certification contracts for agents without Agent Skills support.

- [ ] **Step 6: Run the validator and verify GREEN**

Run: `npm test`

Expected: all validation checks pass.

- [ ] **Step 7: Commit the skill**

```bash
git add skills tests/fixtures
git commit -m "feat: add evidence-led Stripe PCI readiness skill"
```

### Task 3: Add public packaging and governance

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `.github/workflows/validate.yml`

**Interfaces:**
- Consumes: canonical skill folder and `npm test` contract.
- Produces: an installable public repository with contribution, security-reporting, licensing, and continuous-validation guidance.

- [ ] **Step 1: Extend the failing validator contract for public files**

Require all five packaging files, read-only GitHub Actions permissions, the Apache-2.0 licence, non-affiliation language, source-governance rules, and absence of live Stripe secrets.

- [ ] **Step 2: Run the validator and verify RED**

Run: `npm test`

Expected: non-zero exit identifying `README.md` as missing.

- [ ] **Step 3: Add human-facing documentation and governance**

Document installation through compatible Agent Skills tooling and manual copying; supported harnesses without behavioural guarantees; invocation; output shape; limitations; primary sources; quarterly source maintenance; private vulnerability reporting; and contribution requirements.

- [ ] **Step 4: Add the validation workflow**

Use `actions/checkout@v4` and `actions/setup-node@v4` with Node 20, `permissions: contents: read`, `npm install --ignore-scripts --package-lock=false`, and `npm test`. No repository secrets are required.

- [ ] **Step 5: Run the validator and verify GREEN**

Run: `npm test`

Expected: all validation checks pass.

- [ ] **Step 6: Commit packaging**

```bash
git add README.md LICENSE SECURITY.md CONTRIBUTING.md .github package.json tests/validate-skill.mjs
git commit -m "docs: package skill for public distribution"
```

### Task 4: Perform release verification

**Files:**
- Modify only when verification exposes a defect in the files created above.

**Interfaces:**
- Consumes: complete repository candidate.
- Produces: verified `v0.1.0` release candidate, ready for remote publication after explicit authorisation.

- [ ] **Step 1: Run deterministic verification**

```bash
npm test
git diff --check
git status --short
```

Expected: tests pass, no whitespace errors, and no unintended working-tree changes.

- [ ] **Step 2: Run the system skill validator**

```bash
python3 /Users/brendenburkinshaw/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/stripe-pci-readiness
```

Expected: `Skill is valid!`

- [ ] **Step 3: Review the regression fixture manually**

Confirm the source policy requires correction of every expected failure using current primary sources and cannot turn fixture claims into facts without verification.

- [ ] **Step 4: Review repository isolation and secret safety**

Verify no Grey Space paths, names, customer information, `.env` files, `sk_live_`, `rk_live_`, or `whsec_` values appear in tracked content.

- [ ] **Step 5: Commit any verification-driven correction**

Only if a correction was required:

```bash
git add <corrected-files>
git commit -m "fix: close skill validation gaps"
```

- [ ] **Step 6: Stop before external publication**

Report the branch, commits, verification evidence, and any cross-model evaluation still outstanding. Creating the GitHub repository, pushing, tagging, or publishing a release remains a separate external action requiring explicit confirmation.
