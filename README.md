# Stripe PCI Readiness Skill

A portable Agent Skill for evidence-led technical reviews of **Stripe web-ecommerce** repositories and deployed checkouts.

It helps developers trace card-data flow, identify likely PCI DSS scope, review Stripe integration controls, and distinguish repository evidence from operational evidence still required from the merchant. It does **not** certify PCI compliance, complete an SAQ, replace an Approved Scanning Vendor, or make the final scope decision for an acquirer or other compliance-accepting entity.

It is designed for browser-based Checkout, embedded Checkout, Payment Element, individual Elements, Express Checkout, PaymentIntents and webhooks. It deliberately routes Stripe Connect, Terminal/card-present, native mobile, MOTO/manual-entry, Payment Links/hosted-only, subscriptions/invoices/Customer Portal, SetupIntents/saved methods, multi-account/entity, and non-payment Stripe products to a specialist review rather than pretending one web checklist fits every Stripe implementation.

## What makes this skill strict

- No source, no compliance claim.
- Current primary sources are required for material PCI and Stripe conclusions.
- Every material finding is classified as a requirement, observation, inference, merchant assertion, recommendation, or unknown.
- Missing or conflicting evidence becomes `not verified`, never a pass.
- A mandatory counter-evidence check looks for newer or contradictory official guidance.
- Supplied assessments are tested as claims rather than repeated as authority.
- Sensitive values are redacted and audits are read-only by default.

## Install

With a compatible Agent Skills installer:

```bash
npx skills add brenoburks/stripe-pci-readiness-skill
```

Or copy the canonical folder into the skill directory supported by your agent:

```text
skills/stripe-pci-readiness/
```

Many local agents recognise either a project-level skills directory or a user-level `.agents/skills/` directory. Consult the current documentation for your specific harness before installing. This repository targets the shared Agent Skills folder convention; tool availability and behaviour can still differ across Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Grok Build, and other compatible agents.

If your agent does not support skills, copy and use [the standalone prompt](skills/stripe-pci-readiness/assets/copy-paste-prompt.md).

## Invoke

Ask the agent to use `stripe-pci-readiness`, then identify the repository and any deployed environment you authorise it to inspect. For example:

```text
Use stripe-pci-readiness to perform a read-only PCI readiness review of this
Stripe integration. Do not change anything. Separate repository evidence,
runtime evidence, merchant assertions, and current primary-source requirements.
```

The skill will request clarification only when the answer could materially change scope or when a check requires additional authority.

## Expected report

The report leads with:

- preliminary scope classification and confidence;
- whether raw card data appears able to touch merchant systems;
- PCI validation dependencies, business launch rules, and defence-in-depth hardening;
- the most important unresolved uncertainty.

It then documents the payment flow, severity-ranked findings, a sourced claim ledger, likely validation pathway, technical and operational controls, prioritised remediation, and residual unknowns. Every report ends with a non-certification disclaimer.

Every v2 HTML report also makes source-versus-runtime provenance explicit, including whether the assessed source commit is proven to be deployed. It inventories effective SDK/API/webhook versions and upgrade drift, payment-page scripts, and service-provider responsibilities—including systems such as CDNs, hosts and self-hosted CI runners that can affect payment security. PCI dependencies, business launch rules, and defence-in-depth hardening are intentionally separate.

### Professional HTML output

When Node.js 20 and filesystem access are available, the skill turns the checked assessment into a single self-contained HTML report. The report is responsive, accessible, printable to PDF, and safe to review offline because it loads no external scripts, styles, fonts, images, or other network resources.

The renderer is deterministic: agents supply structured evidence and conclusions, while the repository controls layout, escaping, validation, and presentation. It rejects likely Stripe secrets, webhook signing secrets, complete payment card numbers, and CVC-shaped fields rather than placing them in a shareable report.

To render the sanitised example:

```bash
node skills/stripe-pci-readiness/scripts/render-report.mjs \
  --input tests/fixtures/report-input.json \
  --output pci-readiness-report.html
```

Open `pci-readiness-report.html` in a browser or print it to PDF. The [HTML output guide](skills/stripe-pci-readiness/references/html-report.md) documents the complete workflow and fallback behaviour.

## Authoritative-source policy

The mandatory [source policy](skills/stripe-pci-readiness/references/source-policy.md) defines authority ranking, freshness, applicability, direct citations, conflicting guidance, and fail-closed handling. The [audit checklist](skills/stripe-pci-readiness/references/audit-checklist.md) links observations to current official material rather than copying PCI DSS.

Starting authorities include:

- [PCI Security Standards Council document library](https://www.pcisecuritystandards.org/document_library/)
- [PCI SSC FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/)
- [PCI SSC FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/)
- [PCI SSC merchant website scope FAQ](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/)
- [PCI SSC FAQ 1312](https://www.pcisecuritystandards.org/faqs/1312/)
- [PCI SSC FAQ 1579](https://www.pcisecuritystandards.org/faqs/1579/)
- [Stripe integration security guide](https://docs.stripe.com/security/guide)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout)
- [Stripe embedded Checkout](https://docs.stripe.com/checkout/embedded/quickstart)
- [Stripe Elements](https://docs.stripe.com/payments/elements)
- [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents)
- [Stripe Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element)
- [Stripe API versioning](https://docs.stripe.com/api/versioning?lang=node)
- [Stripe webhook documentation](https://docs.stripe.com/webhooks)
- [Stripe API key best practices](https://docs.stripe.com/keys-best-practices)

These links are re-checked during each audit. They are not a frozen substitute for the current standard, SAQ, Stripe product documentation, or accepting-entity instructions.

## Validation

Run:

```bash
npm test
```

The dependency-free test suite checks the HTML renderer, output safety, v2 provenance/inventory/action structure, prohibited overclaims, frontmatter, local links, source-policy integration, public governance files, and likely committed Stripe secrets. It includes safe web-Elements, ambiguous individual-Elements, unsafe raw-card, and out-of-scope non-web fixtures. It does not prove that an agent will reason correctly or replace independently scored agent evaluations.

The sanitised [misleading assessment fixture](tests/fixtures/misleading-saq-a-assessment.md) and its separate [human scoring rubric](tests/fixtures/misleading-saq-a-assessment.expected.md) support behavioural evaluation without leaking the expected answer into the test input.

The ambiguous [individual-Elements fixture](tests/fixtures/individual-elements-classification.md) and its hidden [human scoring rubric](tests/fixtures/individual-elements-classification.expected.md) test that agents do not automatically map a Stripe product name to SAQ A or SAQ A-EP. The first recorded [Claude Sonnet evaluation](docs/evaluations/claude-sonnet-individual-elements.md) documents the isolated protocol, result and limitations without treating one passing run as universal proof.

## Limitations

- Repository review cannot prove deployed configuration, logs, backups, support processes, or merchant operations.
- A normal vulnerability scan is not a PCI ASV scan.
- A technically sound Stripe integration does not by itself establish PCI compliance.
- Final SAQ and merchant-level decisions belong to the entity accepting the merchant’s validation.
- Cross-agent behaviour varies and should be tested before relying on the skill for a formal process.
- The renderer’s deterministic checks prevent known overclaims and missing evidence records; they cannot determine that an agent found every relevant control.
- This is not legal advice.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing compliance guidance. Report vulnerabilities according to [SECURITY.md](SECURITY.md), without sending real payment credentials or customer data.

## Licence and independence

Licensed under [Apache-2.0](LICENSE).

Stripe and PCI SSC names are used descriptively. This project is not affiliated with or endorsed by Stripe or the PCI Security Standards Council.
