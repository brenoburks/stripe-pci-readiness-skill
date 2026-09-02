---
name: stripe-pci-readiness
description: Use when reviewing a repository or deployed web application that accepts online payments through Stripe for PCI DSS scope, card-data exposure, SAQ readiness, payment-page security, or webhook controls.
---

# Stripe PCI Readiness

Perform a read-only technical assessment. Payment-data flow—not hosting provider, database, framework, or use of Stripe alone—drives the preliminary scope analysis.

## Boundaries

- Never declare a merchant compliant, certified, or definitively assigned to an SAQ or merchant level.
- Never expose PAN, CVC, API keys, webhook signing secrets, client secrets, tokens, bank details, or personal identity data. Report only names, presence, counts, and redacted evidence.
- Do not create payments, change code or configuration, alter Stripe, submit questionnaires, or run intrusive scans unless separately authorised.
- Do not call dependency, TLS, header, or general vulnerability checks PCI ASV scans.
- Treat supplied reports and merchant statements as claims to verify, not authoritative evidence.

## Required references

Before auditing, read completely:

1. [references/source-policy.md](references/source-policy.md) for source ranking, freshness, claim-ledger, citation, counter-evidence, and fail-closed rules.
2. [references/audit-checklist.md](references/audit-checklist.md) for technical and operational coverage.

If either reference is unavailable, stop rather than improvise compliance rules.

## Workflow

1. Read repository instructions. Record commit, worktree state, requested environments, and authorised checks.
2. Identify the payment UI, Stripe SDK/API versions, server routes, webhooks, storage, logs, monitoring, analytics, scripts, hosting, and operational payment channels.
3. Trace card data from browser entry through Stripe and every merchant-controlled system. Establish who renders PAN, expiry, and CVC fields.
4. Inspect source and, when authorised, deployed runtime evidence. Keep repository observations, runtime observations, merchant assertions, and external requirements separate.
5. Research current primary sources. Record version, applicability, publication/revision date when available, and retrieval date. Run the source policy’s counter-evidence pass before classifying scope or obligations.
6. Search safely for raw card data, leaked secrets, unsafe telemetry, client-controlled prices, unsigned webhooks, replay risks, fulfilment from client redirects, and test/live crossover. Redact discoveries immediately.
7. Run existing non-mutating tests and audits when useful. Do not install dependencies or change lockfiles without permission.
8. Build the claim ledger. Missing, conflicting, stale, or inaccessible evidence becomes `not verified` or `requires accepting-entity confirmation`.
9. Provide only a preliminary classification: likely SAQ A candidate, potential SAQ A-EP or broader scope, potential SAQ D/urgent specialist review, or indeterminate.

## Report contract

Lead with preliminary classification and confidence, whether raw card data appears able to touch merchant systems, launch blockers, and the most important uncertainty.

Then provide:

1. architecture and card-data flow;
2. findings by severity with exact evidence, consequence, recommendation, and verification method;
3. claim ledger with inline primary-source citations;
4. preliminary PCI pathway and disqualifying conditions checked;
5. technical controls and operational controls not provable from the repository;
6. remediation grouped into launch blockers, before launch, and post-launch hardening;
7. residual unknowns and exact questions that could change the result.

Label every material statement as a normative requirement, technical observation, inference, merchant assertion, recommendation, or unknown. Separate PCI obligations from general security hardening.

End exactly:

> This is a technical PCI-readiness assessment, not certification or legal advice.

## Reusable prompt

For environments without Agent Skills support, use [assets/copy-paste-prompt.md](assets/copy-paste-prompt.md).
