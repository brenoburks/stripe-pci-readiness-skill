# Security policy

## Reporting a vulnerability

Use GitHub private vulnerability reporting for this repository when it is available. On the repository page, open **Security → Advisories → Report a vulnerability**. If private reporting is unavailable, contact the maintainer privately before disclosing details publicly.

Do not open a public issue for an unpatched vulnerability.

Do not include or submit real card data, payment credentials, Stripe keys, webhook secrets, client secrets, access tokens, bank details, customer data, production logs, or private repository content. Use synthetic placeholders and the minimum redacted evidence needed to explain the issue.

Include:

- the affected version or commit;
- the security boundary that can be bypassed;
- safe reproduction steps using synthetic data;
- expected and observed behaviour;
- a suggested remediation when known.

## Scope

Security reports may cover secret leakage, unsafe validation behaviour, instructions that encourage unauthorised mutation, source-policy bypasses, or packaging that exposes users to supply-chain risk.

Compliance disagreements without a security impact belong in a normal issue or pull request, supported by current primary sources.

## Response

The maintainer will acknowledge a valid private report, investigate it, and coordinate remediation and disclosure according to severity and available capacity. No fixed response time or bounty is promised.
