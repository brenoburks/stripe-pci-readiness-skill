import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = process.cwd();
const renderer = path.join(root, "skills", "stripe-pci-readiness", "scripts", "render-report.mjs");
const fixture = path.join(root, "tests", "fixtures", "report-input.json");
const unsafeFixture = path.join(root, "tests", "fixtures", "unsafe-raw-card-report.json");
const outOfScopeFixture = path.join(root, "tests", "fixtures", "non-web-out-of-scope-report.json");

function runRenderer(input, output) {
  return spawnSync(process.execPath, [renderer, "--input", input, "--output", output], {
    cwd: root,
    encoding: "utf8",
  });
}

function withTempDir(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "stripe-pci-report-"));
  try {
    return callback(directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("renders a valid assessment as one self-contained professional HTML report", () => {
  withTempDir((directory) => {
    const output = path.join(directory, "pci-readiness-report.html");
    const result = runRenderer(fixture, output);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(output), true);

    const html = fs.readFileSync(output, "utf8");
    for (const heading of [
      "Preliminary outcome",
      "Executive summary",
      "Scope and methodology",
      "Architecture and card-data flow",
      "Findings summary",
      "Detailed findings",
      "Claim ledger",
      "Technical and operational controls",
      "Prioritised remediation",
      "Residual unknowns",
      "Sources",
    ]) {
      assert.match(html, new RegExp(heading, "i"));
    }

    assert.match(html, /This is a technical PCI-readiness assessment, not certification or legal advice\./);
    assert.match(html, /@media\s*\(max-width:/);
    assert.match(html, /@media\s+print/);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /aria-label="Report sections"/);
    assert.doesNotMatch(html, /<script\b/i);
    assert.doesNotMatch(html, /<link\b[^>]*rel=["']stylesheet/i);
    assert.doesNotMatch(html, /@import\b|url\(\s*["']?https?:/i);
    assert.doesNotMatch(html, /<img\b/i);
  });
});

test("renders the mandatory provenance, version, script, provider, and separated-action records", () => {
  withTempDir((directory) => {
    const output = path.join(directory, "pci-readiness-report.html");
    const result = runRenderer(fixture, output);

    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(output, "utf8");
    for (const heading of [
      "Assessment provenance",
      "Integration and version inventory",
      "Payment-page script inventory",
      "Service-provider responsibilities",
      "PCI obligations and validation dependencies",
      "Business launch rules",
      "Defence-in-depth hardening",
    ]) {
      assert.match(html, new RegExp(heading, "i"));
    }
    assert.match(html, /Exact deployed commit/i);
    assert.match(html, /Not verified/i);
    assert.match(html, /Third-party/i);
    assert.match(html, /Self-hosted CI runner/i);
  });
});

test("rejects prohibited certification and unsupported paid-ASV overclaims", () => {
  withTempDir((directory) => {
    const input = path.join(directory, "overclaim.json");
    const output = path.join(directory, "report.html");
    const data = JSON.parse(fs.readFileSync(fixture, "utf8"));
    data.report.executiveSummary.push("The merchant is PCI compliant after its paid ASV scan.");
    fs.writeFileSync(input, JSON.stringify(data));

    const result = runRenderer(input, output);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /prohibited overclaim/i);
    assert.equal(fs.existsSync(output), false);
  });
});

test("rejects PaymentIntent client secrets and received-certification claims without writing output", () => {
  withTempDir((directory) => {
    for (const [label, value] of [
      ["PaymentIntent client secret", "pi_1234567890abcdef_secret_1234567890abcdef"],
      ["received-certification claim", "The merchant received PCI certification."],
    ]) {
      const input = path.join(directory, `${label.replaceAll(" ", "-")}.json`);
      const output = path.join(directory, `${label.replaceAll(" ", "-")}.html`);
      const data = JSON.parse(fs.readFileSync(fixture, "utf8"));
      data.report.executiveSummary.push(value);
      fs.writeFileSync(input, JSON.stringify(data));

      const result = runRenderer(input, output);
      assert.notEqual(result.status, 0, label);
      assert.match(result.stderr, /sensitive|secret|prohibited overclaim/i);
      assert.equal(fs.existsSync(output), false, label);
    }
  });
});

test("renders source evidence and source-policy qualifiers for findings and sources", () => {
  withTempDir((directory) => {
    const output = path.join(directory, "pci-readiness-report.html");
    const result = runRenderer(fixture, output);

    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(output, "utf8");
    assert.match(html, /git rev-parse HEAD and git status --short captured during the review/i);
    assert.match(html, /Counter-evidence result/i);
    assert.match(html, /Applicability/i);
    assert.match(html, /Confidence/i);
  });
});

test("rejects missing evidence sources, incoherent routing, and unexpected report properties", () => {
  withTempDir((directory) => {
    const invalidCases = [
      ["empty finding sources", (data) => { data.report.findings[0].sourceIds = []; }],
      ["empty claim sources", (data) => { data.report.claimLedger[0].sourceIds = []; }],
      ["empty source list", (data) => { data.report.sources = []; }],
      ["terminal misclassified as web", (data) => { data.report.inventory.integrationCategory = "routed-specialist"; data.report.inventory.routedPattern = "terminal-or-card-present"; }],
      ["unexpected report field", (data) => { data.report.unexpected = "must be rejected"; }],
    ];

    for (const [label, mutate] of invalidCases) {
      const input = path.join(directory, `${label.replaceAll(" ", "-")}.json`);
      const output = path.join(directory, `${label.replaceAll(" ", "-")}.html`);
      const data = JSON.parse(fs.readFileSync(fixture, "utf8"));
      mutate(data);
      fs.writeFileSync(input, JSON.stringify(data));

      const result = runRenderer(input, output);
      assert.notEqual(result.status, 0, label);
      assert.match(result.stderr, /invalid report/i, label);
      assert.equal(fs.existsSync(output), false, label);
    }
  });
});

test("accepts a raw-card urgent-review classification and an explicitly out-of-scope non-web assessment", () => {
  withTempDir((directory) => {
    for (const [fixturePath, outputName] of [[unsafeFixture, "unsafe.html"], [outOfScopeFixture, "out-of-scope.html"]]) {
      const output = path.join(directory, outputName);
      const result = runRenderer(fixturePath, output);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(fs.existsSync(output), true);
    }
  });
});

test("mobile report CSS removes table headers from layout and allows long status text to wrap", () => {
  withTempDir((directory) => {
    const output = path.join(directory, "pci-readiness-report.html");
    const result = runRenderer(fixture, output);

    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(output, "utf8");
    const mobileCss = html.match(/@media \(max-width: 560px\) \{([\s\S]*?)\n    \}/)?.[1];

    assert.ok(mobileCss, "expected the narrow-screen media query");
    assert.match(mobileCss, /thead\s*\{\s*display:\s*none;/);
    assert.match(mobileCss, /\.status\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s);
  });
});

test("escapes report data instead of interpreting it as markup", () => {
  withTempDir((directory) => {
    const input = path.join(directory, "input.json");
    const output = path.join(directory, "report.html");
    const data = JSON.parse(fs.readFileSync(fixture, "utf8"));
    data.report.findings[0].observation = '<svg onload="alert(1)">unsafe</svg>';
    fs.writeFileSync(input, JSON.stringify(data));

    const result = runRenderer(input, output);
    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(output, "utf8");
    assert.match(html, /&lt;svg onload=&quot;alert\(1\)&quot;&gt;unsafe&lt;\/svg&gt;/);
    assert.doesNotMatch(html, /<svg onload=/i);
  });
});

for (const [label, value] of [
  ["Stripe secret key", ["sk", "test", "1234567890abcdefghijklmnop"].join("_")],
  ["webhook signing secret", ["whsec", "1234567890abcdefghijklmnop"].join("_")],
  ["complete payment card number", "4242 4242 4242 4242"],
]) {
  test(`rejects a likely ${label} and leaves no report`, () => {
    withTempDir((directory) => {
      const input = path.join(directory, "input.json");
      const output = path.join(directory, "report.html");
      const data = JSON.parse(fs.readFileSync(fixture, "utf8"));
      data.report.executiveSummary.push(value);
      fs.writeFileSync(input, JSON.stringify(data));

      const result = runRenderer(input, output);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /sensitive|secret|card number/i);
      assert.equal(fs.existsSync(output), false);
    });
  });
}

test("rejects structurally invalid input and leaves no partial report", () => {
  withTempDir((directory) => {
    const input = path.join(directory, "invalid.json");
    const output = path.join(directory, "report.html");
    fs.writeFileSync(input, JSON.stringify({ schemaVersion: 1, report: { title: "Incomplete" } }));

    const result = runRenderer(input, output);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /invalid report/i);
    assert.equal(fs.existsSync(output), false);
  });
});
