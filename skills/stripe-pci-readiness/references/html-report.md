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

The root object contains `schemaVersion: 1` and `report`.

`report` requires:

- `title`, `subject`, `generatedAt`, and the exact `disclaimer` required by `SKILL.md`;
- `assessment`: repository, commit, environment, and assessment type;
- `outcome`: preliminary classification, confidence, raw card-data exposure, launch blockers, and the most important uncertainty;
- `executiveSummary`: concise decision-relevant statements;
- `scope`: included, excluded, and methodology arrays;
- `paymentFlow`: numbered actor, action, and evidence records;
- `findings`: stable ID, title, severity, status, category, statement type, observation, consequence, recommendation, verification method, evidence, and source IDs;
- `claimLedger`: claim, classification, status, evidence or qualification, and source IDs;
- `controls`: separate technical and operational records;
- `remediation`: launch blockers, before-launch actions, and post-launch hardening;
- `unknowns`: exact unresolved questions or gaps;
- `sources`: stable ID, title, publisher, HTTPS URL, and retrieval date.

Source IDs referenced by findings or claims must exist in `sources`. Empty or inaccessible evidence must be described as `Not verified` or `Not provided`; it must not be converted into a pass.

## Safety behaviour

The renderer validates required structure, source references and HTTPS source URLs. It HTML-escapes report content and rejects likely Stripe secret keys, webhook signing secrets, complete Luhn-valid payment card numbers and CVC-shaped fields. It writes atomically, so rejected input does not leave a partial report.

The output has inline CSS, no JavaScript and no external fonts, stylesheets, images or network requests. It is suitable for direct browser review and printing to PDF.
