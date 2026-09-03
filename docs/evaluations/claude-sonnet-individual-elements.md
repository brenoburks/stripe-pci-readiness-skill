# Claude Sonnet individual-Elements evaluation

## Result

**Pass — 8 of 8 rubric conditions met.**

This is one behavioural evaluation, not proof that every Claude invocation or
other agent will produce the same result.

## Evaluation record

| Field | Value |
|---|---|
| Evaluation date | 3 September 2026 |
| Harness | Claude Code 2.1.258, non-interactive restricted mode |
| Model reported by harness | Claude Sonnet 5 |
| Skill revision | Working branch containing the individual-Elements classification guard |
| Input | `tests/fixtures/individual-elements-classification.md` |
| Hidden rubric | `tests/fixtures/individual-elements-classification.expected.md` |
| Expected rubric supplied to model | No |
| Repository or deployed runtime supplied | No |
| Write permissions | None requested; the run was instructed not to create or modify files |
| Allowed evidence tools | Read, Glob, Grep, WebFetch and WebSearch |
| Run duration | Approximately 130 seconds |
| Reported run cost | US$0.3285 |

The isolated evaluation directory contained the skill and input fixture only.
The hidden rubric was scored after the run.

## Rubric result

| Condition | Result | Observed behaviour |
|---|---|---|
| Reject automatic SAQ classification | Pass | Rejected automatic SAQ A and SAQ A-EP mapping from individual Elements. |
| Use a qualified preliminary result | Pass | Returned `Indeterminate` while deployed evidence was absent. |
| Require deployed field-origin evidence | Pass | Required live DOM and iframe-origin evidence for PAN, expiry and CVC. |
| Distinguish unrelated merchant fields | Pass | Did not treat delivery-address and order-summary fields as account-data capture without evidence. |
| Apply current primary-source routing | Pass | Applied FAQ 1438 and FAQ 1293 alongside the current SAQ and related eligibility sources. |
| Preserve accepting-entity authority | Pass | Left validation method and merchant level to the accepting entity. |
| Separate evidence classes and counter-evidence | Pass | Distinguished observations, assertions, inferences and unknowns, and reported that direct source bodies could not be fully retrieved. |
| Include the non-certification boundary | Pass | Ended with the exact required disclaimer. |

## Useful limitation exposed by the run

The agent could identify official source URLs through research, but reported
that it could not fully retrieve the primary-source page bodies in its isolated
environment. It correctly downgraded exact normative wording to `not fully
verified` instead of filling the gap from memory. That fail-closed behaviour is
part of the pass result.

## Reproduction boundary

Future comparisons should use a fresh isolated directory containing only the
skill and selected input fixture. Do not expose the corresponding
`.expected.md` sidecar to the model. Record the agent, model, harness version,
permissions, tool access, duration, cost when available, raw output retention
decision, and human rubric result.
