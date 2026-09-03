# Stripe PCI readiness audit checklist

Use the sections relevant to the detected integration. This checklist is not PCI DSS and cannot replace the current standard, applicable SAQ, or accepting-entity instructions. Apply [source-policy.md](source-policy.md) to every material conclusion.

## Contents

- Audit baseline
- Payment capture and scope
- Browser and payment-page integrity
- Stripe server integration
- Webhooks
- Data, logging, and privacy boundaries
- Infrastructure, software, and access
- Operational evidence
- Preliminary classification
- Severity and reporting

## Audit baseline

- Record repository path, commit, branch, dirty-worktree state, review date, reviewer, and authorised environments.
- Record assessed-source provenance separately from deployed-runtime evidence. State the exact deployed commit status as `verified`, `not verified`, or another qualified status; source and runtime observations must never be blended.
- Identify stack, deployment model, public payment domains, CDN/DNS, Stripe SDK/runtime/API/webhook API versions, payment UI, API routes, databases, queues, object stores, logs, APM, analytics, support tooling, and backups. Record version evidence and an upgrade/drift assessment.
- Identify all payment channels: website, mobile, telephone, email, chat, paper, invoices, dashboard-entered payments, and third-party links.
- Route Connect, Terminal/card-present, native mobile, MOTO/manual-entry, Payment Links/hosted-only, subscriptions/invoices/Customer Portal, SetupIntents/saved-methods, multi-account/entity, and non-payment Stripe products to the appropriate specialist assessment before applying the web-ecommerce classification.
- Record evidence unavailable to the audit. Do not convert an unchecked control into a pass.

## Payment capture and scope

- Identify hosted Checkout redirect, embedded Checkout, Payment Element, individual Elements, mobile SDK, direct API integration, or custom form.
- Determine who renders every PAN, expiry, and CVC input. Inspect the live DOM when authorised; repository markup alone is insufficient.
- Individual Elements do not determine an SAQ pathway by themselves. Do not automatically classify individual Elements as SAQ A or SAQ A-EP. Establish the deployed origin and isolation of each payment field, whether merchant-controlled elements participate in account-data capture or processing, every current eligibility condition, and the accepting entity's determination.
- Confirm Stripe.js is loaded according to the current [Stripe integration security guide](https://docs.stripe.com/security/guide). Do not assume a package name proves the deployed script origin.
- Trace browser input through Stripe, merchant routes, webhooks, order state, fulfilment, receipts, logs, analytics, queues, exports, support systems, and backups.
- Search safely for PAN/CVC field names and patterns without printing discovered values. Search source, history when authorised, schemas, DTOs, fixtures, logs, error tools, and generic JSON stores.
- Distinguish raw account data from Stripe identifiers and permitted non-sensitive attributes; do not describe webhook payloads as “status only.”
- Treat the merchant website and systems that can affect the payment flow as potentially in scope. PCI SSC states that a merchant web server can remain in scope even when SAQ A criteria appear satisfied: [merchant website scope FAQ](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/).
- Identify support or manual-payment processes outside the repository that could change scope.

## Browser and payment-page integrity

- Inventory first-, third-, and fourth-party scripts on pages that initiate, redirect to, or embed payment.
- Record each script’s owner, purpose, source, change control, and ability to affect the payment flow.
- For embedded Stripe forms, test the current script-attack eligibility criterion against [PCI SSC FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/). Do not invent a requirement that both merchant controls and provider confirmation must exist when the source describes alternatives.
- Review CSP in both source and the deployed response. Report-only CSP observes; it does not enforce.
- Derive Stripe CSP sources from current documentation for the exact integration. Do not present `script-src 'self' js.stripe.com` or any generic list as universally complete.
- Check unsafe inline/eval allowances, tag managers, chat widgets, compromised-CDN exposure, DOM injection, user-controlled HTML, mixed content, checkout framing, and service workers.
- Verify deployed HTTPS, redirect behaviour, supported TLS, HSTS, content-type protection, referrer policy, frame protections, and sensitive-page cache controls. Distinguish PCI requirements from general hardening.

## Stripe server integration

- Identify Stripe SDK version, API version, API calls, and server/client responsibility.
- Record the effective Stripe API version and endpoint/webhook API version independently. Consult current [Stripe API versioning](https://docs.stripe.com/api/versioning?lang=node) and [Stripe webhook versioning](https://docs.stripe.com/webhooks/versioning); test relevant PaymentIntent, webhook and error-path behaviour before an SDK/API upgrade.
- Use current documentation for the exact detected UI: [Stripe Checkout](https://docs.stripe.com/payments/checkout), [embedded Checkout](https://docs.stripe.com/checkout/embedded/quickstart), [Stripe Elements](https://docs.stripe.com/payments/elements), [PaymentIntents](https://docs.stripe.com/payments/payment-intents), or [Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element). Do not substitute deprecated Payment Request Button or unrelated authentication guidance.
- Calculate product, currency, discounts, tax, postage, and final amount server-side. Treat client-provided product references as untrusted lookup keys.
- Bind payment state to a durable order and prevent fulfilment from a client redirect, query string, or unverified client status alone.
- Review idempotency, concurrency, inventory, replay, retries, cancellation, failure, asynchronous processing, refunds, and disputes.
- Keep test and live keys, endpoint secrets, domains, data stores, products/prices, monitoring, and operational procedures separated.
- Store secret/restricted keys in an approved secret store or runtime environment and apply current [Stripe key best practices](https://docs.stripe.com/keys-best-practices).
- Check tracked files and authorised history for credentials without printing them. Review ignore rules and secret-scanning controls.
- Never place Stripe secret keys or PaymentIntent client secrets in URLs, logs, analytics, screenshots, or long-lived browser storage.

## Webhooks

Assess implementation against current [Stripe webhook documentation](https://docs.stripe.com/webhooks):

- Verify signatures using the unmodified raw request body and the endpoint secret for the correct environment.
- Reject absent, invalid, or wrong-environment signatures. Evaluate timestamp tolerance using current Stripe guidance rather than inventing a universal value.
- Use Stripe event IDs and business invariants for duplicate/replay protection.
- Do not assume event order. Retrieve authoritative Stripe objects when the handler requires current state.
- Return promptly and process expensive work asynchronously where appropriate.
- Review retry behaviour, failure monitoring, alerting, endpoint rotation, and recovery.
- Treat payloads as potentially containing personal information, shipping data, metadata, payment attributes, and merchant-supplied values. Avoid indiscriminate payload logging.
- Verify fulfilment is idempotent and tied to server-confirmed paid state and expected amount/currency/product.

## Data, logging, and privacy boundaries

- Inventory stored Stripe IDs, order data, customer/contact data, shipping data, last-four/brand fields, metadata, receipts, disputes, retention, backups, exports, and deletion processes.
- Verify merchant systems neither accept nor retain raw PAN or CVC. Any contrary evidence is critical and requires immediate containment without reproducing the value.
- Review generic request/body logging, reverse proxies, CDN logs, APM, session replay, analytics, error reporting, support tools, and debug output.
- Redact credentials, tokens, cookies, client secrets, authorization headers, request bodies, and personal information at collection—not only in report output.
- Keep privacy-law observations separate from PCI conclusions and use the applicable regulator or legislation as the primary authority.

## Infrastructure, software, and access

- Check runtime/framework support status, lockfiles, direct/transitive dependency advisories, patch cadence, build provenance, and deploy reproducibility.
- Review source control, CI/CD, hosting, database, Stripe Dashboard, DNS/CDN, email, analytics, monitoring, and support-system access.
- Inventory third-party service providers and systems that can affect payment security even where they do not handle card data. Record provider, role, payment-security impact, responsibility, evidence, and current status. Use [PCI SSC FAQ 1312](https://www.pcisecuritystandards.org/faqs/1312/) and [FAQ 1579](https://www.pcisecuritystandards.org/faqs/1579/) for the current responsibility/scope basis.
- Treat self-hosted CI runners as a separate risk surface: assess patching, isolation, workflow permissions, credential persistence, workspace cleanup, untrusted-code execution, and deployment credential scope.
- Look for MFA, least privilege, role separation, offboarding, shared accounts, audit logging, protected branches, review gates, and emergency access.
- Review secret stores, environment-variable exposure, build logs, preview deployments, developer machines, and backup access.
- Review monitoring, incident response, breach escalation, restoration tests, retention schedules, and evidence ownership.
- A dependency audit, ordinary vulnerability scanner, or cloud security score is not an ASV scan.

## Operational evidence

Repository inspection cannot prove these items. Request evidence or mark `not verified`:

- the validation method and merchant level assigned by the compliance-accepting entity;
- the current SAQ/AOC submission and applicable deadlines;
- current passing ASV reports when required;
- current Stripe service-provider evidence and relevant third-party responsibilities;
- access reviews, staff training, joiner/mover/leaver records, patch records, incident exercises, retention/deletion records, and backup restoration evidence;
- telephone, paper, email, chat, dashboard, refund, dispute, and support procedures;
- live deployment configuration and operational separation from test systems.

PCI SSC FAQ 1604 states that PCI DSS v4.x SAQ A includes external ASV scanning for merchant e-commerce webpages using both redirect and embedded-iframe patterns: [PCI SSC FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/). Confirm the applicable validation path and timing with the accepting entity. Refer only to a passing/approved ASV report, never a “paid ASV”; do not convert a normal scan into an ASV report.

## Preliminary classification

Use only after applying all current eligibility criteria and completing the counter-evidence pass:

- **Likely SAQ A candidate:** Stripe-hosted redirect or fully Stripe-hosted embedded capture appears to satisfy current criteria. External confirmation remains required.
- **Potential SAQ A-EP or broader scope:** merchant-controlled payment-page elements participate in card-data collection/processing or current SAQ A eligibility is not established.
- **Potential SAQ D / urgent specialist review:** raw PAN or CVC can reach merchant servers, storage, logs, queues, analytics, support systems, backups, or a proxy.
- **Indeterminate:** evidence does not establish the complete flow or current eligibility.

Do not assign a merchant level from transaction volume estimates alone. Ask the entity accepting compliance validation to confirm both level and validation method.

## Severity and reporting

- **Critical:** observed raw PAN/CVC exposure; exposed live secret; fulfilment without server-side payment proof; acceptance of unverified webhooks.
- **High:** capture ownership unclear; client controls price; weak test/live isolation; material payment-page script exposure; required validation/ASV evidence absent; known unsupported or vulnerable component.
- **Medium:** incomplete access, logging, retention, monitoring, incident-response, or hardening evidence that materially raises compromise likelihood.
- **Low:** defence-in-depth or documentation improvement with limited immediate scope effect.

For every finding, include exact evidence, evidence class, applicable source, consequence, action, owner, verification method, confidence, and counter-evidence result. Never downgrade a requirement because a merchant is small, charitable, low-volume, pre-launch, or has not processed a live payment.

Report PCI obligations/validation dependencies, merchant business launch rules, and defence-in-depth recommendations in separate groups. A card-brand policy, an enquiry workflow, or an owner preference is not a PCI obligation unless current applicable authority establishes it.
