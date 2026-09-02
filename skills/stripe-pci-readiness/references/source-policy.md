# Source policy

Compliance findings are high-stakes and time-sensitive. **No source, no compliance claim.** Technical observations may cite repository or runtime evidence; normative requirements require current, applicable primary authority.

## Contents

- Source hierarchy
- Research and counter-evidence workflow
- Claim ledger
- Evidence classes
- Freshness, applicability, and conflicts
- Prohibited unsupported conclusions
- Citation rules
- Maintained primary-source baseline

## Source hierarchy

| Tier | Use | Authorities |
|---|---|---|
| 1 — normative primary | Required for PCI, Stripe-product, payment-brand, acquiring-bank, legal, or regulatory conclusions | Current PCI SSC standards, SAQs, FAQs, and program documents; official Stripe documentation; official payment-brand or acquirer rules; legislation and regulator publications |
| 2 — qualified secondary | Context or interpretation only | QSA, ASV, or reputable specialist commentary that identifies its sources |
| 3 — non-authoritative | Leads and questions only | Blogs, forums, search snippets, generated summaries, prior audit reports, and unsourced checklists |

Tier 2 and Tier 3 material never overrides or substitutes for Tier 1. A user-supplied document is evidence that a claim was made, not evidence that the claim is correct.

## Research and counter-evidence workflow

For every material or time-sensitive conclusion:

1. State the narrow claim being tested.
2. Identify the authority responsible for that claim.
3. Retrieve the current primary source from the authority’s official domain.
4. Check its version, date, applicability, definitions, prerequisites, exceptions, and superseded guidance.
5. Search the same authority for newer or contradictory material. This is the mandatory counter-evidence pass.
6. Compare the requirement with repository, runtime, and merchant evidence without blending those evidence classes.
7. Record the result in the claim ledger and cite the source beside the finding.

If current primary material cannot be accessed, do not rely on memory, cached model knowledge, snippets, or another report. Mark the claim `not verified` and identify the exact authority or accepting entity needed.

## Claim ledger

Use one row per material claim:

| Field | Required content |
|---|---|
| Claim | One testable statement, not a compound conclusion |
| Classification | Normative requirement, technical observation, inference, merchant assertion, recommendation, or unknown |
| Status | Supported, contradicted, not verified, or requires accepting-entity confirmation |
| Evidence | Exact file and line, timestamped runtime observation, merchant-provided artifact, or primary source |
| Authority | Issuing organisation and document title |
| Direct source | URL to the supporting page or document, not a search result |
| Version/date | Applicable PCI DSS, SAQ, Stripe API/product version, and publication or revision date when available |
| Retrieved | Audit retrieval date |
| Applicability | Why the source applies to this integration and merchant channel |
| Counter-evidence | Sources checked and any conflict or qualification found |
| Confidence | High, medium, or low, with the limiting fact |

Inline citations accompany the finding; the ledger does not replace them.

## Evidence classes

- **Normative requirement:** current applicable primary authority defines an obligation or eligibility rule.
- **Technical observation:** directly established from a cited source file, command result, or identified deployed environment.
- **Inference:** reasoned from evidence but not directly proven. State the assumptions.
- **Merchant assertion:** supplied by the operator but not independently verified.
- **Recommendation:** proposed risk treatment. Say whether it addresses a requirement or general hardening.
- **Unknown:** evidence is absent, inaccessible, contradictory, stale, or outside authorised scope.

Source-code absence does not prove data is absent from runtime logs, queues, analytics, support tools, exports, or backups. Configuration does not prove deployment. A valid source describes a rule; it does not prove the audited implementation satisfies that rule.

## Freshness, applicability, and conflicts

- For PCI requirements, current applicable PCI SSC material takes precedence over older PCI SSC publications and all commentary.
- For Stripe behaviour and integration requirements, current official Stripe documentation for the detected product and API version takes precedence.
- For validation method and merchant level, the entity accepting the merchant’s compliance validation makes the final determination.
- For payment-brand or acquirer-specific obligations, use that organisation’s current official rules and establish that they apply to the merchant.
- When primary sources conflict, report the conflict, dates, versions, and effect. Do not choose the easier conclusion silently.
- Re-check primary sources during every audit. The baseline below is a starting index, not a frozen statement of current law or PCI rules.

## Prohibited unsupported conclusions

Do not state or imply without specific current applicable evidence:

- “SAQ A merchants do not require quarterly ASV scans.”
- “The merchant web server is out of scope because PAN does not reach it.”
- “This merchant is SAQ A, SAQ A-EP, SAQ D, Level 4, compliant, substantially compliant, certified, or audit-ready.”
- “Stripe confirms this integration meets the script-attack eligibility criterion” without the exact Stripe document, solution, and conditions.
- A universal number of SAQ questions, remediation duration, assessor requirement, or compliance cost.
- That an empty DOM container, Stripe.js call, database schema search, framework setting, or successful payment alone proves the entire payment flow and environment.
- That reviewed source is the deployed runtime without a build identifier, deployment record, or equivalent evidence.
- That source-code absence proves raw card data is absent from runtime telemetry, reverse proxies, queues, analytics, support tools, exports, or backups.
- That a report-only CSP enforces a control, or that one generic CSP allowlist is sufficient for every Stripe integration.
- That a passing or approved ASV report is a “paid ASV”, or that a business policy is a PCI obligation without an applicable authority.

## Citation rules

- Cite the direct primary page beside the claim it supports.
- Include document title, issuer, version/date when available, and retrieval date in the ledger.
- Paraphrase; quote only the minimum words needed.
- Never cite a search result, AI answer, copied report, or marketing page when a normative source exists.
- If a secondary source reveals an issue, locate and cite its primary basis before reporting the issue as a requirement.
- Broken, redirected, or superseded sources are maintenance findings. Replace them with the current official source before release.

## Maintained primary-source baseline

Retrieved 2 September 2026. Verify again during each audit.

- [PCI SSC FAQ 1604 — ASV scans for SAQ A redirect and embedded-iframe e-commerce pages](https://www.pcisecuritystandards.org/faqs/1604/) — dated June 2026. It states that current SAQ A for PCI DSS v4.x includes external ASV scanning for merchant e-commerce webpages, including outsourced redirect and embedded-iframe patterns.
- [PCI SSC FAQ 1588 — SAQ A eligibility criteria for scripts](https://www.pcisecuritystandards.org/faqs/1588/) — dated February 2025. It describes the embedded-form criterion and the alternative ways a merchant can confirm protection from script attacks.
- [PCI SSC — merchant website scope when SAQ A criteria are met](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/) — official FAQ page, modified 1 April 2026 when retrieved. It says the merchant web server remains in scope for examination of its configuration and payment redirection mechanism.
- [PCI SSC — January 2025 SAQ A update](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a) — explains removal of Requirements 6.4.3, 11.6.1, and 12.3.1 from SAQ A and addition of an eligibility criterion concerning script attacks; it does not say embedded iframes first became SAQ A-eligible in 2025.
- [PCI SSC document library](https://www.pcisecuritystandards.org/document_library/) — retrieve the current PCI DSS and applicable SAQ rather than copying an old questionnaire into the skill.
- [PCI SSC approved scanning vendors](https://www.pcisecuritystandards.org/assessors_and_solutions/approved_scanning_vendors/) — authoritative vendor list for an ASV scan.
- [PCI SSC FAQ 1312 — managing service-provider responsibilities](https://www.pcisecuritystandards.org/faqs/1312/) — use to identify and maintain responsibility evidence for relevant service providers.
- [PCI SSC FAQ 1579 — service providers that can affect payment security](https://www.pcisecuritystandards.org/faqs/1579/) — use where a provider can impact payment security even without direct account-data handling.
- [Stripe integration security guide](https://docs.stripe.com/security/guide) — official guidance on secure payment-data collection and PCI responsibility.
- [Stripe Elements](https://docs.stripe.com/payments/elements) — current hosted-field and browser integration reference for Elements-based web e-commerce.
- [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents) — current server/payment-state reference for PaymentIntent integrations.
- [Stripe Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element) — current wallet/Express Checkout reference when that element is detected.
- [Stripe webhook documentation](https://docs.stripe.com/webhooks) — official guidance for signature verification, raw request bodies, duplicate events, ordering, retries, and endpoint behaviour.
- [Stripe API versioning](https://docs.stripe.com/api/versioning?lang=node) and [webhook versioning](https://docs.stripe.com/webhooks/versioning) — identify API/SDK/event-version drift and test upgrade behaviour.
- [Stripe API key best practices](https://docs.stripe.com/keys-best-practices) — official key storage, restriction, access, and rotation guidance.

For Stripe service-provider status or an Attestation of Compliance, obtain the current evidence through Stripe’s official compliance channels and record the exact artifact and validity period. Do not infer it from a generic documentation page.
