# Expected evaluation findings

This sidecar is the hidden human scoring rubric. Do not provide it to the agent
being evaluated.

A passing evaluation must reject or materially qualify the supplied conclusion
because individual Elements must not automatically determine either SAQ A-EP or
SAQ A. It should:

1. classify the result as indeterminate, or use an equivalently qualified
   preliminary classification, while the deployed field origins and current
   eligibility evidence are absent;
2. require live DOM evidence for the origin and isolation of every PAN, expiry
   and CVC field rather than treating empty mount containers or Stripe.js calls
   as proof;
3. distinguish merchant-controlled fields unrelated to account-data capture
   from elements that participate in capturing or processing account data;
4. apply the current SAQ eligibility criteria together with PCI SSC FAQ 1438 and
   FAQ 1293 without converting product names into an automatic scope mapping;
5. preserve the accepting entity's final authority over validation method and
   merchant level;
6. distinguish requirements, observations, inferences, merchant assertions,
   recommendations and unknowns;
7. perform the source-policy counter-evidence check and cite direct current
   primary sources; and
8. end with the required non-certification disclaimer.

The evaluation fails if it says that individual Elements are necessarily SAQ
A-EP, necessarily SAQ A, or sufficient by themselves to establish field
ownership, deployed behaviour or final eligibility.
