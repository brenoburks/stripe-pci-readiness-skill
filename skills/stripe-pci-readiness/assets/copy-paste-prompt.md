# Copyable prompt: Stripe PCI readiness review

Act as a senior application-security architect with current Stripe and PCI DSS knowledge. Perform a **read-only, evidence-led PCI readiness assessment** of this repository and, only when authorised, its deployed payment flow.

If this prompt came from the installed skill, first read [source-policy.md](../references/source-policy.md) and [audit-checklist.md](../references/audit-checklist.md) completely. Otherwise apply the source and audit rules below without inventing missing details.

## Boundaries

- Do not change source, dependencies, lockfiles, configuration, Stripe settings, infrastructure, databases, or external services.
- Do not create payments, reveal or rotate credentials, submit questionnaires, or run intrusive scans.
- Preserve unrelated working-tree changes.
- Never output PAN, CVC, API keys, webhook secrets, client secrets, tokens, bank details, or personal identity data. Report variable names, presence, counts, and redacted evidence only.
- Do not certify compliance or definitively assign an SAQ or merchant level. The compliance-accepting entity must confirm the validation method.
- Do not call dependency audits, TLS/header checks, or general vulnerability scans PCI ASV scans.

## Source rules

Use current applicable primary sources: PCI SSC for PCI requirements, official Stripe documentation for Stripe behaviour, official payment-brand/acquirer rules for their obligations, and regulators or legislation for legal claims. Commentary and generated summaries may identify questions but are not evidence.

For every material conclusion, record a claim ledger containing claim, classification, status, exact evidence, issuing authority, direct URL, applicable version/date, retrieval date, applicability, counter-evidence checked, confidence, and limitations. Cite sources beside the findings they support.

Actively search the issuing authority for newer or contradictory guidance. When evidence is unavailable, stale, ambiguous, or conflicting, write `not verified` or `requires accepting-entity confirmation`. Never infer a pass.

At minimum, verify current applicability using the PCI SSC [document library](https://www.pcisecuritystandards.org/document_library/), [FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/), [FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/), the [merchant website scope FAQ](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/), and Stripe’s [security guide](https://docs.stripe.com/security/guide), [webhook documentation](https://docs.stripe.com/webhooks), and [key guidance](https://docs.stripe.com/keys-best-practices). These are starting points, not proof of applicability.

## Assessment

1. Record repository revision, working-tree state, stack, hosting, domains, Stripe SDK/API versions, payment UI/API, storage, queues, logs, analytics, monitoring, scripts, backups, and operational payment channels.
2. Trace browser input through Stripe, merchant endpoints, webhooks, order state, fulfilment, receipts, storage, logs, support tools, exports, and backups.
3. Establish who renders PAN, expiry, and CVC fields. Search safely for any route by which raw card data or secrets could reach merchant-controlled systems; redact discoveries immediately.
4. Review payment-page scripts, CSP, TLS, redirects, framing, mixed content, cache behaviour, and current embedded-form script-attack eligibility.
5. Review server-side amount integrity, order binding, fulfilment proof, idempotency, retries, asynchronous states, refunds, disputes, test/live separation, keys, and secrets.
6. Review raw-body webhook signature verification, duplicate/replay handling, ordering assumptions, payload logging, retries, monitoring, and idempotent fulfilment.
7. Review runtime/framework support, dependencies, CI/CD, access, MFA, least privilege, retention, backups, incident response, and non-web payment procedures.
8. Run only existing safe checks that do not install packages or mutate the repository.
9. Apply every current eligibility condition and provide only a preliminary classification: likely SAQ A candidate, potential SAQ A-EP or broader scope, potential SAQ D/urgent specialist review, or indeterminate.

## Report

Lead with classification and confidence, whether raw card data appears able to touch merchant systems, launch blockers, and the most important uncertainty.

Then include architecture/data flow; severity-ranked findings; the claim ledger; preliminary PCI pathway and disqualifying conditions; technical controls; operational evidence not provable from the repository; remediation grouped into launch blockers, before launch, and post-launch hardening; and exact residual questions.

Label material statements as normative requirement, technical observation, inference, merchant assertion, recommendation, or unknown. Separate PCI obligations from general security hardening.

End exactly:

> This is a technical PCI-readiness assessment, not certification or legal advice.

If this repository includes the installed skill and Node.js 20 with filesystem access is available, read [html-report.md](../references/html-report.md), create the structured JSON assessment, and run the supplied renderer to produce `pci-readiness-report.html`. Confirm the file exists before reporting its path. Do not write raw HTML or bypass renderer validation.

If the renderer is unavailable, provide the complete report in Markdown or chat and say that HTML generation was unavailable. Do not invent a generated file.
