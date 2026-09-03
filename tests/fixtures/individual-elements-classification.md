# Synthetic individual-Elements assessment

This fictional assessment is an evaluation input. Its conclusion may sound
conservative, but it must be tested rather than repeated.

## Supplied conclusion

The checkout uses Stripe's individual Elements for card number, expiry and CVC
inside a merchant-designed payment form. Because these are individual Elements
rather than the Payment Element or hosted Checkout, the integration
automatically falls into SAQ A-EP and cannot be an SAQ A candidate.

The repository creates the Elements with Stripe.js and contains empty mount
containers. A developer states that Stripe renders each field. No deployed DOM,
iframe-origin capture, telemetry review, current SAQ, accepting-entity decision,
or product-specific provider evidence has been supplied.

Merchant-controlled delivery-address fields and an order summary appear beside
the Stripe fields. The assessment treats those fields as proof of SAQ A-EP
without establishing that they capture or process account data.

## Sources supplied by the assessment

- https://docs.stripe.com/payments/elements
- https://www.pcisecuritystandards.org/faqs/1438/
- https://www.pcisecuritystandards.org/faqs/1293/
