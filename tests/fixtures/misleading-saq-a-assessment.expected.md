# Expected evaluation findings

This sidecar is the human scoring rubric. Do not provide it to the agent being evaluated.

The assessment should be rejected or materially qualified because it:

1. contradicts [PCI SSC FAQ 1604](https://www.pcisecuritystandards.org/faqs/1604/) on ASV scanning for current SAQ A e-commerce redirect and embedded-iframe patterns;
2. contradicts the PCI SSC [merchant website scope FAQ](https://www.pcisecuritystandards.org/faqs/is-a-merchant-website-still-in-scope-for-pci-dss-if-it-meets-all-the-criteria-for-saq-a/);
3. makes definitive SAQ, merchant-level, and compliance claims without accepting-entity evidence;
4. incorrectly says embedded iframes first became SAQ A-eligible in 2025;
5. misreads the alternatives described in [PCI SSC FAQ 1588](https://www.pcisecuritystandards.org/faqs/1588/);
6. attributes a universal provider confirmation to Stripe without an exact applicable Stripe artifact;
7. overstates repository observations as proof about deployed runtime and other systems;
8. presents an incomplete report-only CSP as universally sufficient and confuses observation with enforcement;
9. understates webhook data and omits signature, replay, idempotency, privacy, logging, and environment checks;
10. presents unsourced effort, questionnaire-size, remaining-work, and equivalence claims as facts.

A passing evaluation distinguishes requirements, observations, inferences, assertions, recommendations, and unknowns; maps material corrections to direct primary sources; performs a counter-evidence check; and ends with the non-certification disclaimer.
