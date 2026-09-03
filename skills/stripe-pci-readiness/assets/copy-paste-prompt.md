# Copyable prompt: Stripe PCI readiness review

Act as a senior application-security architect with current Stripe and PCI DSS knowledge. Perform a **read-only, evidence-led PCI readiness assessment** of this repository and, only when authorised, its deployed payment flow. This prompt is for **Stripe web e-commerce** only.

If this prompt came from the installed skill, first read [source-policy.md](../references/source-policy.md) and [audit-checklist.md](../references/audit-checklist.md) completely. Otherwise apply the source and audit rules below without inventing missing details.

## Boundaries

- Do not change source, dependencies, lockfiles, configuration, Stripe settings, infrastructure, databases, or external services.
- Do not create payments, reveal or rotate credentials, submit questionnaires, or run intrusive scans.
- Preserve unrelated working-tree changes.
- Never output PAN, CVC, API keys, webhook secrets, client secrets, tokens, bank details, or personal identity data. Report variable names, presence, counts, and redacted evidence only.
- Do not certify compliance or definitively assign an SAQ or merchant level. The compliance-accepting entity must confirm the validation method.
- Do not call dependency audits, TLS/header checks, or general vulnerability scans PCI ASV scans.
- Do not call a passing/approved ASV report a “paid ASV”. Confirm ASV applicability and timing with the compliance-accepting entity.

## Routing before assessment

Use this prompt for browser-based Stripe Checkout, embedded Checkout, Payment Element, individual Elements, Express Checkout, PaymentIntents, and related webhooks.

If the detected primary flow is Stripe Connect/marketplace, Terminal/card-present, native mobile SDK, MOTO/manual card entry, Payment Links/hosted-only, subscriptions/invoices/Customer Portal, SetupIntents/saved methods, multi-account/multi-entity, or a non-payment Stripe product, stop after a routing result. State `Out of scope — specialist Stripe integration`, identify the pattern and specialist assessment required. Do not apply a web-ecommerce PCI classification to it.

## Source rules

Use current applicable primary sources: PCI SSC for PCI requirements, official Stripe documentation for Stripe behaviour, official payment-brand/acquirer rules for their obligations, and regulators or legislation for legal claims. Commentary and generated summaries may identify questions but are not evidence.

For every material conclusion, record a claim ledger containing claim, classification, status, exact evidence, issuing authority, direct URL, applicable version/date, retrieval date, applicability, counter-evidence checked, confidence, and limitations. Cite sources beside the findings they support.

Actively search the issuing authority for newer or contradictory guidance. When evidence is unavailable, stale, ambiguous, or conflicting, write `not verified` or `requires accepting-entity confirmation`. Never infer a pass.

At minimum, verify current applicability using the PCI SSC [document library](https://www.pcisecuritystandards.org/document_library/), [FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/), [FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/), the [merchant website scope FAQ](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/), [FAQ 1312](https://www.pcisecuritystandards.org/faqs/1312/), [FAQ 1579](https://www.pcisecuritystandards.org/faqs/1579/), and Stripe’s [security guide](https://docs.stripe.com/security/guide), [Checkout](https://docs.stripe.com/payments/checkout), [embedded Checkout](https://docs.stripe.com/checkout/embedded/quickstart), [Elements](https://docs.stripe.com/payments/elements), [PaymentIntents](https://docs.stripe.com/payments/payment-intents), [Express Checkout](https://docs.stripe.com/elements/express-checkout-element), [API versioning](https://docs.stripe.com/api/versioning?lang=node), [webhook versioning](https://docs.stripe.com/webhooks/versioning), [webhook documentation](https://docs.stripe.com/webhooks), and [key guidance](https://docs.stripe.com/keys-best-practices). Use only the product documentation that matches the detected integration. These are starting points, not proof of applicability.

## Assessment

1. Record assessed-source provenance (exact commit, branch, worktree state, capture time and evidence) separately from deployed-runtime provenance. State whether the exact deployed commit is verified; never imply equivalence without evidence.
2. Record stack, hosting, domains, Stripe SDK/runtime/API/webhook API versions, payment UI/API, storage, queues, logs, analytics, monitoring, first/third/fourth-party scripts, backups, service providers, self-hosted CI runners, and operational payment channels. Record evidence and an upgrade/drift assessment for versions.
3. Trace browser input through Stripe, merchant endpoints, webhooks, order state, fulfilment, receipts, storage, logs, support tools, exports, and backups. Source-code absence does not prove runtime logs, telemetry, proxies, queues or backups are clean.
4. Establish who renders PAN, expiry, and CVC fields. Inspect live DOM when authorised; repository markup alone is not proof. Individual Elements do not determine an SAQ pathway by themselves: do not automatically classify individual Elements as SAQ A or SAQ A-EP. Verify each field's deployed origin and isolation, determine whether merchant-controlled elements participate in account-data capture or processing, apply every current eligibility condition, and retain accepting-entity confirmation as an external dependency. Search safely for any route by which raw card data or secrets could reach merchant-controlled systems; redact discoveries immediately.
5. Inventory every payment-page script with party, owner, purpose, origin, change control, payment impact and evidence. Inventory every provider/system that can affect payment security, including CDN/DNS, hosting, CI/CD and self-hosted runners, with responsibility and evidence. Apply the alternatives in FAQ 1588; do not require both merchant controls and provider confirmation without current authority.
6. Review CSP, TLS, redirects, framing, mixed content, cache behaviour, and current embedded-form script-attack eligibility.
7. Review server-side amount integrity, order binding, fulfilment proof, idempotency, retries, asynchronous states, refunds, disputes, test/live separation, keys, and secrets.
8. Review raw-body webhook signature verification, duplicate/replay handling, ordering assumptions, payload logging, retries, monitoring, and idempotent fulfilment.
9. Review runtime/framework support, dependencies, CI/CD (including self-hosted runners), access, MFA, least privilege, retention, backups, incident response, and non-web payment procedures.
10. Run only existing safe checks that do not install packages or mutate the repository.
11. Apply every current eligibility condition and provide only a preliminary classification: likely SAQ A candidate, potential SAQ A-EP or broader scope, potential SAQ D/urgent specialist review, or indeterminate.

## Report

Lead with classification and confidence, whether raw card data appears able to touch merchant systems, separate PCI dependencies, business launch rules and defence-in-depth actions, and the most important uncertainty.

Then include source-versus-runtime provenance; integration/version, script and service-provider inventories; architecture/data flow; severity-ranked findings; the claim ledger; preliminary PCI pathway and disqualifying conditions; technical controls; operational evidence not provable from the repository; and exact residual questions.

Label material statements as normative requirement, technical observation, inference, merchant assertion, recommendation, or unknown. Separate PCI obligations/validation dependencies from business launch rules and defence-in-depth hardening.

End exactly:

> This is a technical PCI-readiness assessment, not certification or legal advice.

If this repository includes the installed skill and Node.js 20 with filesystem access is available, read [html-report.md](../references/html-report.md), create the structured JSON assessment, and run the supplied renderer to produce `pci-readiness-report.html`. Confirm the file exists before reporting its path. Do not write raw HTML or bypass renderer validation.

If the renderer is unavailable, provide the complete report in Markdown or chat and say that HTML generation was unavailable. Do not invent a generated file.
