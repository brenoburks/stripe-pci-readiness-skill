#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DISCLAIMER = "This is a technical PCI-readiness assessment, not certification or legal advice.";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(scriptDir, "..", "assets", "report-template.html");

function fail(message) {
  throw new Error(message);
}

function parseArguments(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!["--input", "--output"].includes(flag) || !value) {
      fail("Usage: render-report.mjs --input report.json --output report.html");
    }
    result[flag.slice(2)] = value;
  }
  if (!result.input || !result.output) fail("Both --input and --output are required.");
  return result;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, pathName) {
  if (typeof value !== "string" || value.trim() === "") fail(`Invalid report: ${pathName} must be a non-empty string.`);
}

function requireArray(value, pathName) {
  if (!Array.isArray(value)) fail(`Invalid report: ${pathName} must be an array.`);
}

function requireRecord(value, pathName) {
  if (!isRecord(value)) fail(`Invalid report: ${pathName} must be an object.`);
}

function validateItems(items, fields, pathName) {
  requireArray(items, pathName);
  items.forEach((item, index) => {
    requireRecord(item, `${pathName}[${index}]`);
    for (const field of fields) requireString(item[field], `${pathName}[${index}].${field}`);
  });
}

function luhnValid(candidate) {
  const digits = candidate.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function rejectSensitiveData(data) {
  const serialised = JSON.stringify(data);
  if (/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/.test(serialised)) fail("Sensitive Stripe secret detected. Remove it before rendering.");
  if (/\bwhsec_[A-Za-z0-9]{16,}\b/.test(serialised)) fail("Sensitive webhook signing secret detected. Remove it before rendering.");
  for (const match of serialised.matchAll(/(?:\d[ -]?){13,19}/g)) {
    if (luhnValid(match[0])) fail("Complete payment card number detected. Use a masked last-four reference only.");
  }
  const cvcKey = /"(?:cvc|cvv|securityCode|security_code)"\s*:\s*"?\d{3,4}"?/i;
  if (cvcKey.test(serialised)) fail("Sensitive CVC value detected. Remove it before rendering.");
}

function validate(data) {
  requireRecord(data, "root");
  if (data.schemaVersion !== 1) fail("Invalid report: schemaVersion must be 1.");
  requireRecord(data.report, "report");
  const report = data.report;
  for (const field of ["title", "subject", "generatedAt", "disclaimer"]) requireString(report[field], `report.${field}`);
  if (report.disclaimer !== DISCLAIMER) fail("Invalid report: the required non-certification disclaimer is missing or changed.");

  requireRecord(report.assessment, "report.assessment");
  for (const field of ["repository", "commit", "environment", "assessmentType"]) requireString(report.assessment[field], `report.assessment.${field}`);

  requireRecord(report.outcome, "report.outcome");
  for (const field of ["classification", "confidence", "rawCardDataExposure", "keyUncertainty"]) requireString(report.outcome[field], `report.outcome.${field}`);
  requireArray(report.outcome.launchBlockers, "report.outcome.launchBlockers");
  report.outcome.launchBlockers.forEach((item, index) => requireString(item, `report.outcome.launchBlockers[${index}]`));

  for (const field of ["executiveSummary", "unknowns"]) {
    requireArray(report[field], `report.${field}`);
    report[field].forEach((item, index) => requireString(item, `report.${field}[${index}]`));
  }

  requireRecord(report.scope, "report.scope");
  for (const field of ["included", "excluded", "methodology"]) {
    requireArray(report.scope[field], `report.scope.${field}`);
    report.scope[field].forEach((item, index) => requireString(item, `report.scope.${field}[${index}]`));
  }

  requireArray(report.paymentFlow, "report.paymentFlow");
  report.paymentFlow.forEach((item, index) => {
    requireRecord(item, `report.paymentFlow[${index}]`);
    if (!Number.isInteger(item.step) || item.step < 1) fail(`Invalid report: report.paymentFlow[${index}].step must be a positive integer.`);
    for (const field of ["actor", "action", "evidence"]) requireString(item[field], `report.paymentFlow[${index}].${field}`);
  });

  validateItems(report.findings, ["id", "title", "severity", "status", "category", "statementType", "observation", "consequence", "recommendation", "verification"], "report.findings");
  report.findings.forEach((item, index) => {
    for (const field of ["evidence", "sourceIds"]) {
      requireArray(item[field], `report.findings[${index}].${field}`);
      item[field].forEach((value, valueIndex) => requireString(value, `report.findings[${index}].${field}[${valueIndex}]`));
    }
  });

  validateItems(report.claimLedger, ["id", "claim", "type", "status", "evidence"], "report.claimLedger");
  report.claimLedger.forEach((item, index) => {
    requireArray(item.sourceIds, `report.claimLedger[${index}].sourceIds`);
    item.sourceIds.forEach((value, valueIndex) => requireString(value, `report.claimLedger[${index}].sourceIds[${valueIndex}]`));
  });

  requireRecord(report.controls, "report.controls");
  for (const kind of ["technical", "operational"]) validateItems(report.controls[kind], ["control", "status", "evidence"], `report.controls.${kind}`);

  requireRecord(report.remediation, "report.remediation");
  for (const phase of ["launchBlockers", "beforeLaunch", "postLaunch"]) validateItems(report.remediation[phase], ["action", "owner", "verification"], `report.remediation.${phase}`);
  validateItems(report.sources, ["id", "title", "publisher", "url", "retrievedAt"], "report.sources");

  const sourceIds = new Set(report.sources.map((source) => source.id));
  for (const source of report.sources) {
    let url;
    try { url = new URL(source.url); } catch { fail(`Invalid report: source ${source.id} has an invalid URL.`); }
    if (url.protocol !== "https:") fail(`Invalid report: source ${source.id} must use HTTPS.`);
  }
  for (const item of [...report.findings, ...report.claimLedger]) {
    for (const sourceId of item.sourceIds) {
      if (!sourceIds.has(sourceId)) fail(`Invalid report: ${item.id} references unknown source ${sourceId}.`);
    }
  }
  rejectSensitiveData(data);
}

function list(items, className = "prose-list") {
  if (items.length === 0) return '<p class="print-note">Not provided.</p>';
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function statusClass(value) {
  const normalised = value.toLowerCase();
  if (normalised.includes("critical")) return "critical";
  if (normalised.includes("high")) return "high";
  if (normalised.includes("medium") || normalised.includes("caution")) return "medium";
  if (normalised.includes("verified") && !normalised.includes("not")) return "verified";
  if (normalised.includes("low")) return "low";
  if (normalised.includes("informational")) return "informational";
  return "unknown";
}

function badge(value) {
  return `<span class="status status--${statusClass(value)}">${escapeHtml(value)}</span>`;
}

function sectionHeading(number, id, title) {
  return `<div class="section-heading"><span class="section-number" aria-hidden="true">${String(number).padStart(2, "0")}</span><h2 id="${id}">${escapeHtml(title)}</h2></div>`;
}

function sourceLinks(sourceIds, sources) {
  if (sourceIds.length === 0) return "Not provided";
  return sourceIds.map((id) => {
    const source = sources.get(id);
    return `<a href="${escapeHtml(source.url)}">${escapeHtml(id)}</a>`;
  }).join(", ");
}

function renderTable(headers, rows) {
  const head = headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell, index) => `<td data-label="${escapeHtml(headers[index])}">${cell}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderReport(report) {
  const sourceMap = new Map(report.sources.map((source) => [source.id, source]));
  const assessmentLabels = {
    repository: "Repository",
    commit: "Commit",
    environment: "Environment",
    assessmentType: "Assessment",
  };
  const metadata = Object.entries(assessmentLabels).map(([key, label]) => `<div><dt class="meta-label">${label}</dt><dd>${escapeHtml(report.assessment[key])}</dd></div>`).join("");
  const blockers = report.outcome.launchBlockers.length ? list(report.outcome.launchBlockers) : '<p>No launch blockers identified from the evidence reviewed.</p>';

  const findingsRows = report.findings.map((finding) => [
    `<a href="#finding-${slug(finding.id)}">${escapeHtml(finding.id)}</a>`,
    escapeHtml(finding.title),
    badge(finding.severity),
    badge(finding.status),
  ]);

  const findings = report.findings.map((finding) => `<article class="finding" id="finding-${slug(finding.id)}">
    <header class="finding__header">
      <div><span class="finding-id">${escapeHtml(finding.id)}</span><h3>${escapeHtml(finding.title)}</h3><div class="finding__meta"><span>${escapeHtml(finding.category)}</span><span>·</span><span>${escapeHtml(finding.statementType)}</span></div></div>
      <div>${badge(finding.severity)} ${badge(finding.status)}</div>
    </header>
    <div class="finding__body">
      <div><h4>Observation</h4><p>${escapeHtml(finding.observation)}</p></div>
      <div><h4>Consequence</h4><p>${escapeHtml(finding.consequence)}</p></div>
      <div><h4>Recommendation</h4><p>${escapeHtml(finding.recommendation)}</p></div>
      <div><h4>Verification method</h4><p>${escapeHtml(finding.verification)}</p></div>
      <div class="finding__wide"><h4>Evidence</h4>${finding.evidence.map((item) => `<div class="evidence">${escapeHtml(item)}</div>`).join("")}</div>
      <div class="finding__wide"><h4>Sources</h4><p>${sourceLinks(finding.sourceIds, sourceMap)}</p></div>
    </div>
  </article>`).join("");

  const ledgerRows = report.claimLedger.map((item) => [
    escapeHtml(item.id), escapeHtml(item.claim), escapeHtml(item.type), badge(item.status), escapeHtml(item.evidence), sourceLinks(item.sourceIds, sourceMap),
  ]);

  const controlTable = (items) => renderTable(["Control", "Status", "Evidence"], items.map((item) => [escapeHtml(item.control), badge(item.status), escapeHtml(item.evidence)]));
  const remediationTable = (items) => renderTable(["Action", "Owner", "Verification"], items.map((item) => [escapeHtml(item.action), escapeHtml(item.owner), escapeHtml(item.verification)]));

  const sources = report.sources.map((source) => `<li id="source-${slug(source.id)}"><span class="source-id">${escapeHtml(source.id)}</span><br><strong>${escapeHtml(source.title)}</strong><br>${escapeHtml(source.publisher)} · Retrieved ${escapeHtml(source.retrievedAt)}<br><a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a></li>`).join("");

  return `<header class="cover">
    <p class="eyebrow">Technical security assessment</p>
    <h1>${escapeHtml(report.title)}</h1>
    <p class="subject">Prepared for ${escapeHtml(report.subject)} · Generated ${escapeHtml(report.generatedAt)}</p>
    <dl class="report-meta">${metadata}</dl>
  </header>
  <section aria-labelledby="preliminary-outcome">
    ${sectionHeading(1, "preliminary-outcome", "Preliminary outcome")}
    <div class="outcome">
      <p class="eyebrow">Classification · Confidence: ${escapeHtml(report.outcome.confidence)}</p>
      <p class="outcome__classification">${escapeHtml(report.outcome.classification)}</p>
      <div class="outcome-grid">
        <div><span class="meta-label">Raw card-data exposure</span><p>${escapeHtml(report.outcome.rawCardDataExposure)}</p></div>
        <div><span class="meta-label">Most important uncertainty</span><p>${escapeHtml(report.outcome.keyUncertainty)}</p></div>
        <div style="grid-column: 1 / -1"><span class="meta-label">Launch blockers</span>${blockers}</div>
      </div>
    </div>
  </section>
  <section aria-labelledby="executive-summary">${sectionHeading(2, "executive-summary", "Executive summary")}${list(report.executiveSummary)}</section>
  <section aria-labelledby="scope-methodology">
    ${sectionHeading(3, "scope-methodology", "Scope and methodology")}
    <div class="split"><div class="subsection"><h3>Included</h3>${list(report.scope.included)}</div><div class="subsection"><h3>Excluded</h3>${list(report.scope.excluded)}</div></div>
    <div class="subsection" style="margin-top: 2rem"><h3>Methodology</h3>${list(report.scope.methodology)}</div>
  </section>
  <section aria-labelledby="card-data-flow">
    ${sectionHeading(4, "card-data-flow", "Architecture and card-data flow")}
    <ol class="flow">${report.paymentFlow.map((item) => `<li><span class="flow__step">${item.step}</span><div><h3>${escapeHtml(item.actor)}</h3><p>${escapeHtml(item.action)}</p><div class="evidence">${escapeHtml(item.evidence)}</div></div></li>`).join("")}</ol>
  </section>
  <section aria-labelledby="findings-summary">${sectionHeading(5, "findings-summary", "Findings summary")}${renderTable(["Reference", "Finding", "Severity", "Status"], findingsRows)}</section>
  <section aria-labelledby="detailed-findings">${sectionHeading(6, "detailed-findings", "Detailed findings")}${findings || '<p>No findings were provided.</p>'}</section>
  <section aria-labelledby="claim-ledger">${sectionHeading(7, "claim-ledger", "Claim ledger")}${renderTable(["Reference", "Claim", "Type", "Status", "Evidence or qualification", "Sources"], ledgerRows)}</section>
  <section aria-labelledby="controls">
    ${sectionHeading(8, "controls", "Technical and operational controls")}
    <div class="subsection"><h3>Technical controls</h3>${controlTable(report.controls.technical)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Operational controls</h3>${controlTable(report.controls.operational)}</div>
  </section>
  <section aria-labelledby="remediation">
    ${sectionHeading(9, "remediation", "Prioritised remediation")}
    <div class="subsection"><h3>Launch blockers</h3>${remediationTable(report.remediation.launchBlockers)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Before launch</h3>${remediationTable(report.remediation.beforeLaunch)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Post-launch hardening</h3>${remediationTable(report.remediation.postLaunch)}</div>
  </section>
  <section aria-labelledby="unknowns">${sectionHeading(10, "unknowns", "Residual unknowns")}${list(report.unknowns)}</section>
  <section aria-labelledby="sources">${sectionHeading(11, "sources", "Sources")}<ol class="source-list">${sources}</ol></section>
  <p class="disclaimer">${escapeHtml(report.disclaimer)}</p>
  <p class="print-note">This self-contained report was generated locally. It does not load external scripts, styles, fonts or images.</p>`;
}

function renderTableOfContents() {
  const sections = [
    ["preliminary-outcome", "Preliminary outcome"], ["executive-summary", "Executive summary"], ["scope-methodology", "Scope and methodology"],
    ["card-data-flow", "Card-data flow"], ["findings-summary", "Findings summary"], ["detailed-findings", "Detailed findings"],
    ["claim-ledger", "Claim ledger"], ["controls", "Controls"], ["remediation", "Remediation"], ["unknowns", "Residual unknowns"], ["sources", "Sources"],
  ];
  return `<nav class="toc" aria-label="Report sections"><span class="toc__title">Report sections</span><ol>${sections.map(([id, label]) => `<li><a href="#${id}">${escapeHtml(label)}</a></li>`).join("")}</ol></nav>`;
}

function main() {
  const { input, output } = parseArguments(process.argv.slice(2));
  const inputPath = path.resolve(input);
  const outputPath = path.resolve(output);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } catch (error) {
    fail(`Invalid report input: ${error.message}`);
  }
  validate(data);
  const template = fs.readFileSync(templatePath, "utf8");
  const html = template
    .replace("{{DOCUMENT_TITLE}}", escapeHtml(`${data.report.title} · ${data.report.subject}`))
    .replace("{{TABLE_OF_CONTENTS}}", renderTableOfContents())
    .replace("{{REPORT_CONTENT}}", renderReport(data.report));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, html, { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
  }
  process.stdout.write(`Rendered ${outputPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
