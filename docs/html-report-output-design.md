# HTML Report Output Design

## Decision

The skill will produce a deterministic, self-contained HTML report from structured JSON whenever the auditing environment provides Node.js 20 and filesystem access. The agent remains responsible for evidence collection and conclusions. A repository-owned renderer is responsible for presentation, escaping, validation and portability.

This is preferred over asking each agent to write raw HTML because it provides consistent output across Codex, Claude and other repository-capable agents, while keeping compliance reasoning separate from document generation.

## Professional reporting model

The information architecture follows established security-assessment practice:

- OWASP's Web Security Testing Guide separates executive material, findings summaries, detailed findings, remediation and limitations so both business and technical readers can use the report.
- NIST SP 800-115 frames technical security assessment as planned testing, analysis and mitigation rather than a decorative scorecard.
- Public Trail of Bits review reports demonstrate durable finding identifiers, explicit severity and repeatable technical evidence.

Primary references:

- https://owasp.org/www-project-web-security-testing-guide/v42/5-Reporting/README
- https://csrc.nist.gov/pubs/sp/800/115/final
- https://github.com/trailofbits/publications

These references inform report structure only. PCI requirements and Stripe claims continue to follow the skill's mandatory source policy.

## User experience

The HTML document has two reading speeds:

1. An opening summary shows preliminary classification, confidence, apparent raw card-data exposure, PCI validation dependencies, business launch rules, defence-in-depth hardening and the most important uncertainty.
2. The main document provides scope, methodology, payment flow, findings, claim ledger, controls, remediation, residual unknowns, sources and the non-certification disclaimer.

The report is a light, print-first technical dossier. It uses semantic HTML, native system fonts and no external resources. Desktop uses a constrained document column with an adjacent table of contents when space permits. Mobile preserves the same section order in one column. Print removes navigation, uses economical colour and exposes source destinations.

The normative visual rules live in `DESIGN.md`.

## Interface

The renderer command is:

```text
node skills/stripe-pci-readiness/scripts/render-report.mjs --input report.json --output pci-readiness-report.html
```

Input conforms to `skills/stripe-pci-readiness/assets/report.schema.json`. A maintained example at `tests/fixtures/report-input.json` demonstrates the complete contract without real merchant or payment data.

The generated file is portable and can be opened directly in a browser, attached to an email or printed to PDF. It contains all CSS inline and requires no JavaScript or network access.

## Required sections

1. Report identity and assessment metadata
2. Preliminary outcome, with separate PCI dependencies, business rules and defence-in-depth items
3. Executive summary
4. Scope and methodology
5. Assessed-source and deployed-runtime provenance
6. Integration and version inventory
7. Payment-page script inventory
8. Service-provider responsibilities
9. Architecture and card-data flow
10. Findings summary
11. Detailed findings
12. Claim ledger
13. Technical and operational controls
14. Prioritised remediation
15. Residual unknowns
16. Sources
17. Non-certification disclaimer

## Data and safety controls

- Every user-provided value is HTML escaped.
- Input is structurally validated before output is written. Version 2 requires source/runtime provenance, integration/version records, payment-page scripts, service-provider responsibilities, and separated remediation classes.
- Likely Stripe secret keys, webhook signing secrets, complete payment card numbers and CVC values are rejected.
- Masked last-four references remain allowed when they contain no complete account number.
- The renderer never fetches remote assets or sends report content over the network.
- Invalid input exits non-zero and does not leave a partial report file.
- Severity and status use text labels; colour is supplementary.
- Missing fields remain visibly `Not verified` or `Not provided`, never an inferred pass.
- The renderer rejects known overclaims such as certification language and “paid ASV”. This is a deterministic safety rail, not a PCI conclusion engine.

## Failure and fallback behaviour

When Node.js 20 or filesystem access is unavailable, the agent provides the complete report in Markdown or chat and states that HTML generation was unavailable. It must not invent a generated-file path.

When the renderer rejects data, the agent corrects the structured report or removes sensitive content. It must not bypass validation by manually assembling HTML.

## Test contract

Automated tests must first fail for the absent renderer, then prove:

- a valid fixture produces one self-contained HTML file;
- all required sections and the exact disclaimer are present;
- HTML-like evidence text is escaped;
- external scripts, stylesheets, fonts and images are absent;
- likely Stripe secrets and complete card numbers are rejected;
- invalid input leaves no output file;
- screen, narrow-screen and print CSS are present;
- the existing repository safety and packaging checks continue to pass.

Visual verification then checks desktop, mobile and print output for hierarchy, overflow, text size, contrast, source readability and page breaks.

## Repository hygiene

The date-stamped `docs/superpowers` implementation records are removed from the current published tree. Git history remains the record of the original build. Maintained documentation uses durable names that describe its purpose rather than the day it was created.
