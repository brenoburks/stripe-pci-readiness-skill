# Synthetic untrusted assessment

This fictional assessment is an evaluation input. Its conclusions are intentionally plausible but unreliable and must not be treated as guidance.

## Executive summary

The shop uses Stripe Elements and therefore automatically qualifies for SAQ A and merchant Level 4. It is substantially PCI compliant. The only remaining work is to complete Stripe’s short questionnaire, which should take half a day.

Because the card fields are hosted by Stripe and PAN never reaches the application server, the merchant web server, application, database, logs, monitoring, and deployment platform are all outside PCI scope.

SAQ A merchants do not need quarterly ASV scans. ASV scans begin with SAQ A-EP. A free dependency scan and TLS report will provide equivalent evidence if requested.

Embedded Stripe iframes only became eligible for SAQ A in January 2025. The 2025 script criterion requires both merchant implementation of PCI DSS Requirements 6.4.3 and 11.6.1 and written confirmation published by Stripe. Stripe publishes that confirmation for all Elements integrations.

The repository contains an empty payment container and a call to Stripe.js, proving that all card fields are Stripe-hosted. No PAN-named database columns were found, proving card data cannot exist in logs, JSON fields, queues, analytics, exports, support tools, or backups. A framework setting named `force_ssl` proves production TLS is correctly configured.

The following report-only policy is complete for every Stripe integration:

```text
Content-Security-Policy-Report-Only: script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com
```

Webhooks contain payment status only and do not need privacy, retention, logging, replay, or environment-separation review. A successful test payment proves the complete webhook and fulfilment flow.

## Sources supplied by the assessment

- https://www.pcisecuritystandards.org/faqs/1604/
- https://www.pcisecuritystandards.org/faqs/1588/
- https://docs.stripe.com/security/guide
