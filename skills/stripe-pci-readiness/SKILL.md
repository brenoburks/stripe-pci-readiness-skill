---
name: stripe-pci-readiness
description: Use when reviewing a Stripe web-ecommerce repository or deployed checkout for PCI DSS scope, card-data exposure, payment-page security, or webhook controls. Route specialist Stripe patterns outside this scope.
---

# Stripe PCI Readiness

Perform a read-only technical assessment of **Stripe web e-commerce**. Payment-data flow—not hosting provider, database, framework, or use of Stripe alone—drives the preliminary scope analysis.

## Scope routing

This skill covers browser-based merchant payment flows: Stripe-hosted Checkout, embedded Checkout, Payment Element, individual Elements, Express Checkout, PaymentIntents, and their webhooks.

Before collecting PCI evidence, identify the payment pattern. Stop after recording a concise routing finding if the primary payment flow is any of the following; use a specialist assessment rather than applying this skill’s web-ecommerce classification:

- Stripe Connect or marketplace charges: determine charge model, merchant of record, connected-account responsibilities, and platform data flow first.
- Stripe Terminal or any card-present/P2PE workflow.
- Native iOS, Android, React Native, or other mobile SDK payment capture.
- MOTO, telephone, email, chat, paper, or Dashboard-entered card payments.
- Payment Links or hosted-only flows where the repository does not control a payment page; assess the merchant site’s redirect/link handling and operational channels separately.
- Subscriptions, invoices, Customer Portal, SetupIntents, saved methods, or multi-account/multi-entity Stripe configurations when they materially change the payment flow or responsible merchant.
- Non-payment Stripe products such as Issuing, Treasury, Tax, Identity, Radar-only, or Stripe Apps.

Do not call an out-of-scope pattern secure, compliant, or low risk. Report `Out of scope — specialist Stripe integration`, identify the detected pattern, and state the specialist review required.

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
2. Establish scope routing. For web e-commerce, identify the payment UI, Stripe SDK/runtime/API/webhook versions, server routes, webhooks, storage, logs, monitoring, analytics, first/third/fourth-party scripts, hosting, service providers, self-hosted CI runners, and operational payment channels.
3. Trace card data from browser entry through Stripe and every merchant-controlled system. Establish who renders PAN, expiry, and CVC fields.
4. Record assessed-source provenance—exact commit, branch, worktree state, capture time and evidence—separately from deployed-runtime provenance. Record whether the exact deployed commit is verified. Never imply source/deployment equivalence when it is not established.
5. Inspect source and, when authorised, deployed runtime evidence. Live DOM evidence is required to verify who renders payment fields; repository markup is not enough. Source-code absence cannot prove behaviour in runtime logs, proxies, queues, analytics, exports, support tools, or backups.
6. Inventory framework/runtime, Stripe SDK, effective API version, endpoint/webhook API version, evidence source, and upgrade/drift assessment. API and webhook versions may differ; do not infer either from package presence alone.
7. Inventory every first-, third-, and fourth-party script on payment-related pages: owner, purpose, origin, change control, payment impact and evidence. Inventory each service provider and system that can affect payment security, including CDN/DNS, hosting, CI/CD and self-hosted runners, with responsibility and evidence.
8. Research current primary sources. Record version, applicability, publication/revision date when available, and retrieval date. Run the source policy’s counter-evidence pass before classifying scope or obligations.
9. Search safely for raw card data, leaked secrets, unsafe telemetry, client-controlled prices, unsigned webhooks, replay risks, fulfilment from client redirects, and test/live crossover. Redact discoveries immediately.
10. Run existing non-mutating tests and audits when useful. Do not install dependencies or change lockfiles without permission.
11. Build the claim ledger. Missing, conflicting, stale, or inaccessible evidence becomes `not verified` or `requires accepting-entity confirmation`.
12. Provide only a preliminary classification: likely SAQ A candidate, potential SAQ A-EP or broader scope, potential SAQ D/urgent specialist review, or indeterminate.

## Report contract

Lead with preliminary classification and confidence, whether raw card data appears able to touch merchant systems, the separate PCI dependencies, business launch rules and defence-in-depth actions, and the most important uncertainty.

Then provide:

1. assessed-source and deployed-runtime provenance, including exact deployed-commit status;
2. integration/version inventory, script inventory, and service-provider responsibility inventory;
3. architecture and card-data flow;
4. findings by severity with exact evidence, consequence, recommendation, responsible owner, and verification method;
5. claim ledger with inline primary-source citations;
6. preliminary PCI pathway and disqualifying conditions checked;
7. technical controls and operational controls not provable from the repository;
8. remediation separated into PCI obligations/validation dependencies, business launch rules, and defence-in-depth hardening;
9. residual unknowns and exact questions that could change the result.

Label every material statement as a normative requirement, technical observation, inference, merchant assertion, recommendation, or unknown. Keep PCI obligations/validation dependencies separate from business launch rules and general security hardening. A passing ASV report is not a “paid ASV”; confirm ASV applicability and timing with the compliance-accepting entity. For embedded-form script protection, apply the alternatives in PCI SSC FAQ 1588 and do not require both merchant techniques and payment-provider confirmation unless current applicable authority does.

End exactly:

> This is a technical PCI-readiness assessment, not certification or legal advice.

## HTML deliverable

After completing and checking the assessment, read [references/html-report.md](references/html-report.md) and generate the self-contained HTML report when Node.js 20 and filesystem access are available. Use the repository renderer; do not improvise a separate HTML template or bypass its validation.

If the renderer is unavailable, provide the complete report in Markdown or chat and state that HTML generation was unavailable. Never invent a file path or claim that a report was generated when it was not.

## Reusable prompt

For environments without Agent Skills support, use [assets/copy-paste-prompt.md](assets/copy-paste-prompt.md).
