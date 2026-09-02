# Contributing

Contributions are welcome when they keep the skill portable, evidence-led, read-only by default, and safe for public reuse.

## Compliance-source requirements

Every change to a PCI, Stripe, payment-brand, acquirer, legal, or regulatory conclusion must include:

- the exact claim being changed;
- its current primary source and issuing authority;
- a direct official URL, not a search result;
- applicable standard, SAQ, API, or product version;
- publication or revision date when available;
- retrieval date;
- why the source applies;
- any older guidance it supersedes or contradicts;
- a regression or evaluation update when behaviour changes.

A secondary source can provide context, but a secondary-source-only compliance change will not be accepted. Blogs, forums, generated summaries, and previous reports are leads, not normative evidence.

If authoritative material conflicts, describe the conflict and do not hide it behind a simplified conclusion. The current applicable PCI SSC publication governs PCI requirements; current official Stripe documentation governs Stripe product behaviour; and the compliance-accepting entity makes the final validation-method determination.

## Development

1. Create a focused branch.
2. Preserve the canonical folder at `skills/stripe-pci-readiness/`.
3. Keep `SKILL.md` concise and route detailed material through its existing one-level references.
4. Add no provider-specific dependency to the canonical skill.
5. Never commit credentials, customer data, private audit evidence, or project-specific implementation details.
6. Run `npm test` and correct every failure.
7. Include the source and behavioural reason for the change in the pull request.

## Behavioural evaluations

Keep evaluation input separate from the scoring rubric. Use synthetic repositories and data. Test observable agent behaviour: whether it verifies sources, distinguishes evidence classes, finds counter-evidence, redacts secrets, and refuses to certify. Do not treat deterministic phrase matching as proof of model behaviour.

## Source maintenance

Maintainers review bundled official links and time-sensitive conclusions at least quarterly. A normative change should produce a patch release promptly. Broken, redirected, or superseded authoritative links block a release until the current official replacement or archived status is documented.

## Pull-request checklist

- [ ] No secrets, real card data, customer data, or private project evidence
- [ ] Current primary sources cited beside changed compliance claims
- [ ] Applicability, version/date, retrieval date, and conflicts recorded
- [ ] Skill, checklist, source policy, prompt, and tests remain aligned
- [ ] `npm test` passes
- [ ] Non-certification and read-only boundaries remain intact
