# HTML report generation

Use this output mode after the evidence, conclusions, claim ledger and remediation have been reviewed for accuracy.

## Requirements

- Node.js 20 or newer
- Filesystem access to the installed skill folder
- The assessment represented as JSON matching `../assets/report.schema.json`

Use `../../../tests/fixtures/report-input.json` as a complete sanitised example when working from this repository. In an installed skill, use the schema and the field guide below.

## Generate the report

1. Create the structured JSON in the user's requested output directory. Do not include raw card data, CVC, Stripe secrets, bank details or unnecessary personal data.
2. Run:

```bash
node scripts/render-report.mjs --input /absolute/path/report.json --output /absolute/path/pci-readiness-report.html
```

Run the command from the installed `skills/stripe-pci-readiness` directory, or address `scripts/render-report.mjs` by its absolute path.

3. Confirm the command exits zero and the reported output path exists.
4. Open the file in a browser when browser control is available. Check the opening outcome, finding count, sources, narrow-screen layout and print preview.
5. Give the user the real clickable file path. Keep the JSON as an audit input unless the user asks to remove it.

Do not hand-edit the output HTML. Correct the JSON or the renderer instead so the report remains reproducible.

## Field guide

The root object contains `schemaVersion: 2` and `report`.

`report` requires:

- `title`, `subject`, `generatedAt`, and the exact `disclaimer` required by `SKILL.md`;
- `assessment`: repository, commit, environment, and assessment type;
- `provenance`: assessed-source commit/branch/worktree/capture evidence and separately the deployed-runtime status, evidence, and exact deployed-commit status;
- `inventory`: web-ecommerce routing result, typed integration category and routed pattern; payment pattern; framework/runtime; Stripe SDK, API and webhook API versions; version evidence and upgrade/drift assessment; first/third/fourth-party script inventory; and service-provider responsibility inventory;
- `outcome`: preliminary classification, confidence, raw card-data exposure, separate PCI dependencies, business launch rules, defence-in-depth hardening, and the most important uncertainty;
- `executiveSummary`: concise decision-relevant statements;
- `scope`: included, excluded, and methodology arrays;
- `paymentFlow`: numbered actor, action, and evidence records;
- `findings`: stable ID, title, severity, status, category, statement type, observation, consequence, recommendation, responsible owner, verification method, confidence, counter-evidence result, evidence, and non-empty source IDs;
- `claimLedger`: claim, classification, status, evidence or qualification, applicability, counter-evidence result, confidence, and non-empty source IDs;
- `controls`: separate technical and operational records;
- `remediation`: PCI obligations/validation dependencies, business launch rules, and defence-in-depth hardening. Each item has action, timing, owner, and verification;
- `unknowns`: exact unresolved questions or gaps;
- `sources`: stable ID, title, publisher, authority, HTTPS URL, retrieval date, applicability, counter-evidence result, and confidence; `versionOrDate` is optional when the issuing authority provides it.

Source IDs referenced by findings or claims must exist in `sources` and cannot be empty. Web-ecommerce reports require non-empty sources and claim ledger. Empty or inaccessible evidence must be described as `Not verified` or `Not provided`; it must not be converted into a pass.

For any routed Stripe pattern, set `inventory.integrationScope` to `out-of-current-skill-scope`, use the exact classification `Out of scope — specialist Stripe integration`, and explain the specialist review required. Do not use the renderer to make a web-ecommerce PCI classification for Connect, Terminal/card-present, native mobile, MOTO/manual entry, Payment Links/hosted-only, or another routed pattern.

The renderer rejects likely certification claims, definitive-SAq language, “paid ASV” wording, PaymentIntent/SetupIntent/Checkout Session client secrets, keyed `client_secret`/`clientSecret` values, incoherent routing, missing material source references, and unknown object properties. It also requires the provenance, inventory, script, provider, finding owner, and separate action records above. These deterministic checks prevent known report defects; they do not replace professional judgement or primary-source research.

## Safety behaviour

The renderer validates required structure, source references and HTTPS source URLs. It HTML-escapes report content and rejects likely Stripe secret keys, webhook signing secrets, complete Luhn-valid payment card numbers and CVC-shaped fields. It writes atomically, so rejected input does not leave a partial report.

The output has inline CSS, no JavaScript and no external fonts, stylesheets, images or network requests. It is suitable for direct browser review and printing to PDF.
