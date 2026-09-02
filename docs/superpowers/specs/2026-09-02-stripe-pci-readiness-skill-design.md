# Stripe PCI Readiness Skill — Design Specification

Date: 2 September 2026  
Status: Proposed for implementation  
Repository: `brenoburks/stripe-pci-readiness-skill`

## Purpose

Create a public, vendor-neutral Agent Skill that reviews repositories containing Stripe payment integrations and produces an evidence-based PCI DSS readiness assessment. The project is intended for developers and small teams who need a practical technical review before completing their formal compliance process.

The skill does not certify PCI compliance, complete an SAQ, replace an Approved Scanning Vendor, or provide legal advice. It distinguishes what source code and read-only runtime evidence can establish from what the merchant, Stripe, an acquirer, an ASV, or a qualified assessor must confirm.

## Product principles

1. **Evidence before conclusions.** Every technical finding cites a file and line, command result, deployed-runtime observation, or clearly labelled merchant assertion.
2. **No false certification.** The strongest result is a preliminary scope classification and readiness assessment.
3. **Read-only by default.** An audit does not edit code, change Stripe settings, reveal credentials, create payments, submit questionnaires, or run intrusive scans.
4. **Secret-safe output.** Sensitive values are never printed. Accidental discoveries are immediately redacted.
5. **Provider-neutral packaging.** One canonical Agent Skills implementation works across supported harnesses without embedding instructions for a single model vendor.
6. **Current authoritative guidance.** Time-sensitive PCI and Stripe conclusions must be checked against official Stripe and PCI Security Standards Council material during each audit.
7. **Hosting neutrality.** Heroku, VPS, serverless, container platforms, SQLite, Postgres, and other implementation choices are evidence, not automatic scope decisions.
8. **No source, no compliance claim.** Every material compliance conclusion must be traceable to a current, applicable primary source. If that source cannot be verified, the conclusion is reported as `not verified` or `requires accepting-entity confirmation`.
9. **Contradictory evidence is actively sought.** Before classifying scope or obligations, the audit must check for current primary-source guidance that could disprove or qualify the proposed conclusion.

## Intended users and use cases

Primary users are developers who:

- accept one-time or recurring online payments through Stripe;
- use Stripe Checkout, embedded Checkout, Elements, Payment Element, PaymentIntents, or related webhooks;
- want to understand likely PCI scope and technical gaps before launch;
- need an actionable report to discuss with Stripe or their compliance-accepting entity.

The initial release is Stripe-specific. It does not audit other payment processors, native point-of-sale terminals, or non-technical organisational certification programs.

## Distribution approach

Version 1 uses one canonical skill and avoids a custom package compiler or npm installer. This keeps the repository auditable and reduces supply-chain and maintenance overhead.

The canonical source lives at:

```text
skills/stripe-pci-readiness/
```

Users can install through a compatible Agent Skills installer such as:

```text
npx skills add brenoburks/stripe-pci-readiness-skill
```

The README also documents manual copying into each harness's supported skill directory. Harness-specific metadata is excluded from the canonical skill unless it is optional and safely ignored by other Agent Skills implementations.

Initial documented targets are Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Grok Build, and other tools that implement the open Agent Skills folder convention. Documentation will say “compatible with the shared skill format,” not promise identical tool availability or behaviour.

## Repository structure

```text
stripe-pci-readiness-skill/
├── README.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── package.json
├── skills/
│   └── stripe-pci-readiness/
│       ├── SKILL.md
│       ├── references/
│       │   ├── audit-checklist.md
│       │   └── source-policy.md
│       └── assets/
│           └── copy-paste-prompt.md
├── tests/
│   ├── fixtures/
│   │   └── misleading-saq-a-assessment.md
│   └── validate-skill.mjs
└── .github/
    └── workflows/
        └── validate.yml
```

The root README is for people. `SKILL.md` is the agent entry point. Detailed controls live in the reference file so they are loaded only during an audit. The standalone prompt is an output asset for users whose agent does not support skills.

## Skill architecture

### Entrypoint

`SKILL.md` contains:

- a concise trigger description;
- audit boundaries and non-certification language;
- the evidence model;
- the audit sequence;
- preliminary scope-classification rules;
- the required report structure;
- routing to the detailed checklist and standalone prompt.

Frontmatter uses portable Agent Skills fields only. The skill name is `stripe-pci-readiness`. The licence is Apache-2.0.

### Audit reference

`references/audit-checklist.md` covers:

- payment capture and card-data tracing;
- hosted versus embedded versus merchant-controlled fields;
- browser scripts and payment-page integrity;
- TLS, CSP, headers, redirects, caching, and mixed content;
- Stripe SDK/API use and server-side price integrity;
- secrets and environment separation;
- webhook signatures, replays, retries, and event handling;
- logging, storage, backups, analytics, support tooling, and personal data;
- dependencies, patching, CI/CD, access control, incident response, and retention;
- annual validation, current SAQ eligibility considerations, and applicable quarterly ASV evidence;
- severity definitions and the boundary between PCI requirements and ordinary security hardening.

The reference links to current primary sources instead of copying the PCI DSS standard.

### Source policy

`references/source-policy.md` makes evidence quality part of the audit contract.

The source hierarchy is:

1. **Normative primary sources:** current PCI SSC standards, SAQs, FAQs, and official program material; official Stripe security and product documentation; official payment-brand or acquiring-bank rules; and legislation or regulator material for legal and privacy claims.
2. **Qualified secondary sources:** QSA, ASV, or reputable specialist commentary may explain context but cannot override or substitute for a normative primary source.
3. **Non-authoritative material:** blogs, forums, generated summaries, search-result snippets, and prior audit reports may identify questions but are not evidence for a compliance conclusion.

For PCI requirements, the current applicable PCI SSC publication takes precedence. For Stripe product behaviour, current official Stripe documentation takes precedence. The merchant's compliance-accepting entity retains the final determination of the applicable validation method. When authoritative sources conflict or applicability remains ambiguous, the report describes the conflict and does not silently choose the more convenient interpretation.

Every material or time-sensitive conclusion has a claim-ledger entry containing:

- the claim and its classification as normative requirement, technical observation, inference, recommendation, unknown, or merchant assertion;
- source title, issuing body, direct URL, publication or revision date when available, and retrieval date;
- applicable PCI DSS, SAQ, Stripe API, or product version;
- repository file and line, runtime observation, merchant evidence, or external authority supporting it;
- confidence and unresolved limitations;
- the result of a counter-evidence check.

Inline citations appear beside the claims they support. A bibliography alone is not sufficient. Repository findings cite exact files and lines; runtime findings identify the checked environment and observation time. Source validity does not prove that a control is implemented in the audited environment.

When internet access or a current primary source is unavailable, the audit may record repository observations but must not present time-sensitive obligations as current fact. It records them as `not verified` and lists the exact source or accepting-entity confirmation still required.

The initial authoritative baseline includes:

- PCI SSC FAQ 1604, *Do ASV scans in SAQ A apply to merchants with webpages that redirect to TPSPs or include TPSPs’ embedded iframes?* (June 2026): <https://www.pcisecuritystandards.org/faqs/1604/>
- PCI SSC FAQ 1588 on SAQ A eligibility and protection from script attacks: <https://www.pcisecuritystandards.org/faqs/1588/>
- PCI SSC guidance on merchant website scope when SAQ A criteria are met: <https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/>
- PCI SSC's January 2025 SAQ A update: <https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a>
- Stripe's security integration guide: <https://docs.stripe.com/security/guide>

These links are a maintained starting point, not a frozen substitute for checking current publications during an audit.

### Standalone prompt

`assets/copy-paste-prompt.md` expresses the same boundaries and deliverable requirements without relying on skill discovery. It is suitable for pasting into another capable coding agent. It must remain semantically aligned with `SKILL.md`, but it need not duplicate every checklist item.

## Audit data flow

```mermaid
flowchart LR
    U[User invokes skill] --> R[Read repository instructions and establish scope]
    R --> D[Detect stack and Stripe integration]
    D --> T[Trace browser-to-Stripe-to-server data flow]
    T --> C[Evaluate technical controls]
    C --> V[Optional authorised read-only runtime checks]
    V --> E[Separate code, runtime, and merchant evidence]
    E --> S[Preliminary PCI scope assessment]
    S --> O[Prioritised readiness report]
```

The audit never sends card data or secrets to the model output. When evidence is unavailable, the report records “not verified” instead of inferring a pass.

## Preliminary classification model

The skill may report:

- **Likely SAQ A candidate:** Stripe-hosted redirect or fully Stripe-hosted embedded capture, subject to every current eligibility criterion and external confirmation.
- **Potential SAQ A-EP or broader scope:** merchant-controlled elements participate in card-data collection or processing, or the implementation does not satisfy the fully outsourced criteria.
- **Potential SAQ D / urgent specialist review:** raw PAN or CVC can reach merchant servers, storage, logs, queues, analytics, support systems, or backups.
- **Indeterminate:** available evidence cannot establish the flow.

The accepting entity makes the final SAQ determination. For embedded forms, the audit separately examines the current script-attack eligibility criterion. For e-commerce merchants following SAQ A, the report identifies current annual validation and quarterly ASV obligations when confirmed by current PCI SSC guidance.

## Report contract

Every audit begins with:

- preliminary scope and confidence;
- whether raw card data appears able to touch merchant systems;
- launch blockers;
- the most important unresolved uncertainty.

It then provides:

1. architecture and card-data flow;
2. an evidence table with severity, evidence, consequence, recommendation, and verification method;
3. likely PCI pathway and disqualifying conditions checked;
4. technical control results;
5. operational controls not provable from the repository;
6. remediation grouped into launch blockers, before launch, and post-launch hardening;
7. residual unknowns and exact questions that could change scope.

Each material finding distinguishes the following evidence classes instead of blending them into one conclusion:

- **Normative requirement:** supported by a current applicable authority.
- **Technical observation:** directly established from repository or runtime evidence.
- **Inference:** reasoned from evidence but not directly proven.
- **Merchant assertion:** supplied by the operator and not independently verified.
- **Recommendation:** a proposed risk treatment, not itself a compliance obligation.
- **Unknown:** evidence was absent, inaccessible, contradictory, or stale.

The report must not state or imply any of the following without specific, current, applicable evidence:

- that SAQ A merchants do not require quarterly ASV scans;
- that a merchant web server is out of PCI scope solely because PAN does not reach it;
- that a merchant definitively qualifies for SAQ A, SAQ A-EP, SAQ D, or a particular merchant level;
- that a merchant is compliant, substantially compliant, certified, or audit-ready;
- that Stripe supplies a particular eligibility confirmation unless the exact Stripe document, product, and conditions are identified;
- a precise remediation duration, questionnaire length, or assessor requirement presented as universal fact.

Every report ends with the required disclaimer:

> This is a technical PCI-readiness assessment, not certification or legal advice.

## Safety and error handling

- If a command might display secrets, the agent changes the command to return names, presence, counts, or redacted values.
- If raw card data or a live credential is discovered, the report marks it critical without reproducing it and recommends incident-response and rotation steps.
- If the worktree is dirty, the audit preserves it and reports the baseline.
- If tests require package installation or lockfile changes, the agent stops and requests permission.
- If a deployed environment is unavailable, the report continues with repository evidence and marks runtime checks unverified.
- If current official guidance conflicts with the bundled checklist, the official guidance wins and the discrepancy is reported as skill maintenance work.
- If the agent lacks a needed tool, it degrades explicitly rather than inventing a passing result.
- If a primary source is inaccessible, stale, internally inconsistent, or unclear about the audited integration, the associated result fails closed to `not verified`.
- Generated or user-supplied reports are treated as claims to test, not authorities to repeat.

## Validation strategy

The repository uses a dependency-free Node.js validation script. It verifies:

- expected files and directories exist;
- `SKILL.md` has valid required frontmatter;
- the skill name and folder name agree;
- referenced local files exist;
- no scaffold placeholders remain;
- no likely live Stripe secrets are committed;
- the required non-certification disclaimer exists;
- wording does not make prohibited certification claims;
- the standalone prompt retains read-only, redaction, authoritative-source, and ASV boundaries.
- `SKILL.md`, the checklist, and the standalone prompt all link to and enforce `source-policy.md`;
- prohibited unsupported statements are absent from normative guidance;
- every bundled external compliance assertion has an adjacent primary-source citation;
- local references resolve and the regression fixture remains present.

GitHub Actions runs validation on pushes and pull requests using a pinned current LTS Node major. The workflow receives no secrets and requires read-only repository permissions.

Manual release checks verify the skill against at least three fixture patterns:

1. Stripe-hosted Checkout redirect;
2. embedded Stripe Elements or Payment Element;
3. deliberately unsafe merchant-hosted card fields or server-side PAN handling.

Fixture audits verify behavioural outcomes, not exact prose. They must show that the skill distinguishes likely scope, cites evidence, redacts sensitive values, and refuses to certify compliance.

A fourth, sanitised regression fixture contains a plausible but misleading SAQ A assessment. It must include enough claims to verify that the skill detects and corrects, with primary sources:

- the false universal claim that SAQ A requires no quarterly ASV scans;
- the unsupported conclusion that the merchant web server is out of scope merely because Stripe hosts card fields;
- a definitive SAQ or merchant-level classification made without accepting-entity evidence;
- a historically incorrect explanation of when embedded iframes became eligible for SAQ A;
- a misreading of the current script-attack eligibility criterion;
- incomplete CSP guidance presented as universally sufficient;
- repository observations overstated as proof about runtime, logs, backups, or the full payment flow;
- confident effort estimates or claims that only one or two compliance tasks remain.

The fixture contains no names, credentials, customer data, or implementation details from The Grey Space Project or any third party. The initial release uses it as a documented forward-evaluation case rather than asserting that deterministic linting can prove model behaviour.

## Documentation and governance

The README includes purpose, non-affiliation notice, supported harnesses, installation, invocation, example output shape, limitations, authoritative sources, and contribution guidance.

`SECURITY.md` provides private vulnerability-reporting instructions using GitHub's private vulnerability reporting feature when available. It tells reporters not to submit real payment credentials or customer data.

`CONTRIBUTING.md` requires primary-source citations for compliance changes and validation updates when behaviour changes.

Changes to PCI or Stripe conclusions require the contributor to record the authoritative source, applicability, publication or revision date when available, retrieval date, and any superseded guidance. Secondary-source-only compliance changes are rejected. Maintainers perform a source review at least quarterly and issue a patch release promptly when normative guidance changes.

External-link availability checks may run on a schedule or manually so transient network failures do not make ordinary pull requests flaky. Broken or redirected authoritative links block a release until their current official replacement or archived status is documented.

The project uses semantic Git tags. The first public release is `v0.1.0`, signalling that community and cross-harness feedback is still expected. It can move to `v1.0.0` after successful use across the named harnesses.

The README and skill state that Stripe and PCI SSC names are used descriptively and that the project is not affiliated with or endorsed by either organisation.

## Isolation from The Grey Space Project

All project files, Git history, tests, remotes, workflows, issues, and releases live exclusively in the new `stripe-pci-readiness-skill` repository. The Grey Space Project is neither a submodule nor a dependency, and no audit evidence, credentials, customer data, or implementation-specific details from it are copied into the public repository.

The existing personal Codex skill may be used as editorial source material, but public files must be independently reviewed for project-specific information before publication.

## Acceptance criteria

- The repository is public under Brenden's personal GitHub account.
- A single canonical skill conforms to the shared Agent Skills folder convention.
- Installation is documented for the initial target harnesses.
- The standalone prompt works without installing the skill.
- Validation passes locally and in GitHub Actions.
- No secrets or Grey Space-specific information are present.
- The audit cannot truthfully be read as certification or a definitive SAQ determination.
- Current Stripe and PCI SSC sources are cited for time-sensitive conclusions.
- Every material compliance claim is classified and traceable through the claim ledger.
- The skill actively checks for contradictory primary evidence and fails closed when current applicability cannot be established.
- The misleading-assessment regression fixture is present and its expected findings are documented.
- The skill does not repeat any prohibited unsupported statement as fact.
- The `v0.1.0` release is installable and includes clear limitations.

## Deferred work

- A custom npm installer or provider-specific build compiler.
- Agent-specific hooks, subagents, slash commands, or UI metadata.
- Automated live-account changes or payment creation.
- Paid or hosted scanning services.
- Formal certification, SAQ submission, or ASV services.
- Payment processors other than Stripe.
