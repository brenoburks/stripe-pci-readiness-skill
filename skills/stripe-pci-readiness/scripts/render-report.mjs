#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DISCLAIMER = "This is a technical PCI-readiness assessment, not certification or legal advice.";
const CLASSIFICATIONS = new Set([
  "Likely SAQ A candidate",
  "Potential SAQ A-EP or broader scope",
  "Potential SAQ D / urgent specialist review",
  "Indeterminate",
  "Out of scope — specialist Stripe integration",
]);
const STATEMENT_TYPES = new Set(["Normative requirement", "Technical observation", "Inference", "Merchant assertion", "Recommendation", "Unknown"]);
const CLAIM_STATUSES = new Set(["Supported", "Contradicted", "Not verified", "Requires accepting-entity confirmation", "Not supported"]);
const INTEGRATION_CATEGORIES = new Set(["hosted-checkout", "embedded-checkout", "payment-element", "individual-elements", "express-checkout", "payment-intents-web", "routed-specialist"]);
const ROUTED_PATTERNS = new Set(["not-applicable", "connect", "terminal-or-card-present", "native-mobile", "moto-or-manual-entry", "payment-links-or-hosted-only", "billing-or-saved-methods", "multi-account-or-entity", "non-payment-stripe-product", "other-specialist"]);
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

function requireOnlyKeys(value, allowed, pathName) {
  requireRecord(value, pathName);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(`Invalid report: ${pathName} contains unexpected property ${key}.`);
  }
}

function validateItems(items, fields, pathName, allowedFields = fields) {
  requireArray(items, pathName);
  items.forEach((item, index) => {
    requireOnlyKeys(item, allowedFields, `${pathName}[${index}]`);
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
  if (/\b(?:pi|seti)_[A-Za-z0-9]+_secret_[A-Za-z0-9]+\b/.test(serialised)) fail("Sensitive Stripe client secret detected. Remove it before rendering.");
  for (const match of serialised.matchAll(/(?:\d[ -]?){13,19}/g)) {
    if (luhnValid(match[0])) fail("Complete payment card number detected. Use a masked last-four reference only.");
  }
  const cvcKey = /"(?:cvc|cvv|securityCode|security_code)"\s*:\s*"?\d{3,4}"?/i;
  if (cvcKey.test(serialised)) fail("Sensitive CVC value detected. Remove it before rendering.");
}

function rejectProhibitedOverclaims(data) {
  const serialised = JSON.stringify(data);
  const prohibited = [
    /\bpaid\s+ASV\b/i,
    /\b(?:is|are)\s+(?:PCI\s+)?(?:DSS\s+)?(?:fully\s+)?(?:compliant|certified|audit[- ]ready)\b/i,
    /\b(?:received|obtained|achieved|holds?|has)\s+(?:a\s+)?(?:PCI\s+)?(?:DSS\s+)?certification\b/i,
    /\bdefinitively\s+(?:SAQ\s+[A-Z-]+|assigned\s+to\s+an?\s+SAQ)\b/i,
  ];
  if (prohibited.some((pattern) => pattern.test(serialised))) {
    fail("Invalid report: prohibited overclaim detected. Use a preliminary classification or a qualified requirement instead.");
  }
}

function validate(data) {
  requireOnlyKeys(data, ["schemaVersion", "report"], "root");
  if (data.schemaVersion !== 2) fail("Invalid report: schemaVersion must be 2.");
  requireOnlyKeys(data.report, ["title", "subject", "generatedAt", "assessment", "provenance", "inventory", "outcome", "executiveSummary", "scope", "paymentFlow", "findings", "claimLedger", "controls", "remediation", "unknowns", "sources", "disclaimer"], "report");
  const report = data.report;
  for (const field of ["title", "subject", "generatedAt", "disclaimer"]) requireString(report[field], `report.${field}`);
  if (report.disclaimer !== DISCLAIMER) fail("Invalid report: the required non-certification disclaimer is missing or changed.");

  requireOnlyKeys(report.assessment, ["repository", "commit", "environment", "assessmentType"], "report.assessment");
  for (const field of ["repository", "commit", "environment", "assessmentType"]) requireString(report.assessment[field], `report.assessment.${field}`);

  requireOnlyKeys(report.provenance, ["assessedSource", "deployedRuntime"], "report.provenance");
  requireOnlyKeys(report.provenance.assessedSource, ["commit", "branch", "worktreeState", "capturedAt", "evidence"], "report.provenance.assessedSource");
  for (const field of ["commit", "branch", "worktreeState", "capturedAt", "evidence"]) requireString(report.provenance.assessedSource[field], `report.provenance.assessedSource.${field}`);
  requireOnlyKeys(report.provenance.deployedRuntime, ["status", "exactCommitStatus", "evidence"], "report.provenance.deployedRuntime");
  for (const field of ["status", "exactCommitStatus", "evidence"]) requireString(report.provenance.deployedRuntime[field], `report.provenance.deployedRuntime.${field}`);

  requireOnlyKeys(report.inventory, ["integrationScope", "integrationCategory", "routedPattern", "paymentPattern", "frameworkRuntime", "stripeSdk", "stripeApiVersion", "webhookApiVersion", "versionEvidence", "upgradeAssessment", "paymentPageScripts", "serviceProviders"], "report.inventory");
  for (const field of ["integrationScope", "integrationCategory", "routedPattern", "paymentPattern", "frameworkRuntime", "stripeSdk", "stripeApiVersion", "webhookApiVersion", "versionEvidence", "upgradeAssessment"]) requireString(report.inventory[field], `report.inventory.${field}`);
  if (!["web-ecommerce", "out-of-current-skill-scope"].includes(report.inventory.integrationScope)) {
    fail("Invalid report: report.inventory.integrationScope must be web-ecommerce or out-of-current-skill-scope.");
  }
  if (!INTEGRATION_CATEGORIES.has(report.inventory.integrationCategory)) fail("Invalid report: report.inventory.integrationCategory is unsupported.");
  if (!ROUTED_PATTERNS.has(report.inventory.routedPattern)) fail("Invalid report: report.inventory.routedPattern is unsupported.");
  validateItems(report.inventory.paymentPageScripts, ["party", "owner", "purpose", "source", "changeControl", "paymentImpact", "evidence"], "report.inventory.paymentPageScripts");
  validateItems(report.inventory.serviceProviders, ["provider", "role", "paymentSecurityImpact", "responsibility", "status", "evidence"], "report.inventory.serviceProviders");
  if (report.inventory.integrationScope === "web-ecommerce" && report.inventory.paymentPageScripts.length === 0) {
    fail("Invalid report: a web-ecommerce assessment requires a payment-page script inventory.");
  }
  if (report.inventory.integrationScope === "web-ecommerce" && (report.inventory.integrationCategory === "routed-specialist" || report.inventory.routedPattern !== "not-applicable")) {
    fail("Invalid report: a routed specialist pattern cannot be classified as web-ecommerce.");
  }
  if (report.inventory.integrationScope === "out-of-current-skill-scope" && (report.inventory.integrationCategory !== "routed-specialist" || report.inventory.routedPattern === "not-applicable")) {
    fail("Invalid report: routed assessments require routed-specialist category and routedPattern.");
  }
  if (report.inventory.serviceProviders.length === 0) fail("Invalid report: service-provider responsibility inventory is required.");

  requireOnlyKeys(report.outcome, ["classification", "confidence", "rawCardDataExposure", "pciDependencies", "businessLaunchRules", "defenseInDepth", "keyUncertainty"], "report.outcome");
  for (const field of ["classification", "confidence", "rawCardDataExposure", "keyUncertainty"]) requireString(report.outcome[field], `report.outcome.${field}`);
  if (!CLASSIFICATIONS.has(report.outcome.classification)) fail("Invalid report: outcome classification must use a supported preliminary label.");
  for (const field of ["pciDependencies", "businessLaunchRules", "defenseInDepth"]) {
    requireArray(report.outcome[field], `report.outcome.${field}`);
    report.outcome[field].forEach((item, index) => requireString(item, `report.outcome.${field}[${index}]`));
  }
  if (report.inventory.integrationScope === "out-of-current-skill-scope" && report.outcome.classification !== "Out of scope — specialist Stripe integration") {
    fail("Invalid report: routed assessments must be classified as out of scope for this skill.");
  }
  if (report.outcome.classification === "Potential SAQ D / urgent specialist review" && !/\b(?:can reach|reaches|observed|may touch)\b/i.test(report.outcome.rawCardDataExposure)) {
    fail("Invalid report: urgent raw-card classification requires explicit exposure evidence.");
  }

  for (const field of ["executiveSummary", "unknowns"]) {
    requireArray(report[field], `report.${field}`);
    report[field].forEach((item, index) => requireString(item, `report.${field}[${index}]`));
  }

  requireOnlyKeys(report.scope, ["included", "excluded", "methodology"], "report.scope");
  for (const field of ["included", "excluded", "methodology"]) {
    requireArray(report.scope[field], `report.scope.${field}`);
    report.scope[field].forEach((item, index) => requireString(item, `report.scope.${field}[${index}]`));
  }

  requireArray(report.paymentFlow, "report.paymentFlow");
  report.paymentFlow.forEach((item, index) => {
    requireOnlyKeys(item, ["step", "actor", "action", "evidence"], `report.paymentFlow[${index}]`);
    if (!Number.isInteger(item.step) || item.step < 1) fail(`Invalid report: report.paymentFlow[${index}].step must be a positive integer.`);
    for (const field of ["actor", "action", "evidence"]) requireString(item[field], `report.paymentFlow[${index}].${field}`);
  });

  validateItems(report.findings, ["id", "title", "severity", "status", "category", "statementType", "observation", "consequence", "recommendation", "verification", "confidence", "counterEvidence"], "report.findings", ["id", "title", "severity", "status", "category", "statementType", "observation", "consequence", "recommendation", "verification", "confidence", "counterEvidence", "evidence", "sourceIds"]);
  report.findings.forEach((item, index) => {
    if (!STATEMENT_TYPES.has(item.statementType)) fail(`Invalid report: report.findings[${index}].statementType is not an allowed evidence class.`);
    for (const field of ["evidence", "sourceIds"]) {
      requireArray(item[field], `report.findings[${index}].${field}`);
      item[field].forEach((value, valueIndex) => requireString(value, `report.findings[${index}].${field}[${valueIndex}]`));
    }
    if (item.sourceIds.length === 0) fail(`Invalid report: report.findings[${index}].sourceIds must not be empty.`);
  });

  validateItems(report.claimLedger, ["id", "claim", "type", "status", "evidence", "applicability", "counterEvidence", "confidence"], "report.claimLedger", ["id", "claim", "type", "status", "evidence", "applicability", "counterEvidence", "confidence", "sourceIds"]);
  report.claimLedger.forEach((item, index) => {
    if (!STATEMENT_TYPES.has(item.type)) fail(`Invalid report: report.claimLedger[${index}].type is not an allowed evidence class.`);
    if (!CLAIM_STATUSES.has(item.status)) fail(`Invalid report: report.claimLedger[${index}].status is not an allowed claim status.`);
    requireArray(item.sourceIds, `report.claimLedger[${index}].sourceIds`);
    item.sourceIds.forEach((value, valueIndex) => requireString(value, `report.claimLedger[${index}].sourceIds[${valueIndex}]`));
    if (item.sourceIds.length === 0) fail(`Invalid report: report.claimLedger[${index}].sourceIds must not be empty.`);
  });

  if (report.inventory.integrationScope === "web-ecommerce" && report.claimLedger.length === 0) fail("Invalid report: a web-ecommerce assessment requires a non-empty claim ledger.");
  requireOnlyKeys(report.controls, ["technical", "operational"], "report.controls");
  for (const kind of ["technical", "operational"]) validateItems(report.controls[kind], ["control", "status", "evidence"], `report.controls.${kind}`);

  requireOnlyKeys(report.remediation, ["pciDependencies", "businessLaunchRules", "defenseInDepth"], "report.remediation");
  for (const phase of ["pciDependencies", "businessLaunchRules", "defenseInDepth"]) validateItems(report.remediation[phase], ["action", "timing", "owner", "verification"], `report.remediation.${phase}`);
  validateItems(report.sources, ["id", "title", "publisher", "authority", "url", "retrievedAt", "applicability", "counterEvidence", "confidence"], "report.sources", ["id", "title", "publisher", "authority", "url", "retrievedAt", "versionOrDate", "applicability", "counterEvidence", "confidence"]);
  report.sources.forEach((source, index) => {
    if (source.versionOrDate !== undefined) requireString(source.versionOrDate, `report.sources[${index}].versionOrDate`);
  });
  if (report.inventory.integrationScope === "web-ecommerce" && report.sources.length === 0) fail("Invalid report: a web-ecommerce assessment requires sources.");

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
  rejectProhibitedOverclaims(data);
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
  const actionSummary = (items) => items.length ? list(items) : '<p class="print-note">None identified from the evidence reviewed.</p>';
  const provenanceRows = [
    ["Assessed source", escapeHtml(report.provenance.assessedSource.commit)],
    ["Branch", escapeHtml(report.provenance.assessedSource.branch)],
    ["Worktree", escapeHtml(report.provenance.assessedSource.worktreeState)],
    ["Source captured", escapeHtml(report.provenance.assessedSource.capturedAt)],
    ["Assessed-source evidence", escapeHtml(report.provenance.assessedSource.evidence)],
    ["Exact deployed commit", escapeHtml(report.provenance.deployedRuntime.exactCommitStatus)],
    ["Runtime evidence", `${badge(report.provenance.deployedRuntime.status)} ${escapeHtml(report.provenance.deployedRuntime.evidence)}`],
  ];
  const versionRows = [["Integration scope", escapeHtml(report.inventory.integrationScope)], ["Payment pattern", escapeHtml(report.inventory.paymentPattern)], ["Framework and runtime", escapeHtml(report.inventory.frameworkRuntime)], ["Stripe SDK", escapeHtml(report.inventory.stripeSdk)], ["Stripe API version", escapeHtml(report.inventory.stripeApiVersion)], ["Webhook API version", escapeHtml(report.inventory.webhookApiVersion)], ["Version evidence", escapeHtml(report.inventory.versionEvidence)], ["Upgrade/drift assessment", escapeHtml(report.inventory.upgradeAssessment)]];
  const scriptRows = report.inventory.paymentPageScripts.map((item) => [escapeHtml(item.party), escapeHtml(item.owner), escapeHtml(item.purpose), escapeHtml(item.source), escapeHtml(item.changeControl), escapeHtml(item.paymentImpact), escapeHtml(item.evidence)]);
  const providerRows = report.inventory.serviceProviders.map((item) => [escapeHtml(item.provider), escapeHtml(item.role), escapeHtml(item.paymentSecurityImpact), escapeHtml(item.responsibility), badge(item.status), escapeHtml(item.evidence)]);

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
      <div><h4>Confidence</h4><p>${escapeHtml(finding.confidence)}</p></div>
      <div><h4>Counter-evidence result</h4><p>${escapeHtml(finding.counterEvidence)}</p></div>
      <div class="finding__wide"><h4>Evidence</h4>${finding.evidence.map((item) => `<div class="evidence">${escapeHtml(item)}</div>`).join("")}</div>
      <div class="finding__wide"><h4>Sources</h4><p>${sourceLinks(finding.sourceIds, sourceMap)}</p></div>
    </div>
  </article>`).join("");

  const ledgerRows = report.claimLedger.map((item) => [
    escapeHtml(item.id), escapeHtml(item.claim), escapeHtml(item.type), badge(item.status), escapeHtml(item.evidence), escapeHtml(item.applicability), escapeHtml(item.counterEvidence), escapeHtml(item.confidence), sourceLinks(item.sourceIds, sourceMap),
  ]);

  const controlTable = (items) => renderTable(["Control", "Status", "Evidence"], items.map((item) => [escapeHtml(item.control), badge(item.status), escapeHtml(item.evidence)]));
  const remediationTable = (items) => renderTable(["Action", "Timing", "Owner", "Verification"], items.map((item) => [escapeHtml(item.action), escapeHtml(item.timing), escapeHtml(item.owner), escapeHtml(item.verification)]));

  const sources = report.sources.map((source) => `<li id="source-${slug(source.id)}"><span class="source-id">${escapeHtml(source.id)}</span><br><strong>${escapeHtml(source.title)}</strong><br>${escapeHtml(source.authority)} · ${escapeHtml(source.publisher)}${source.versionOrDate ? ` · ${escapeHtml(source.versionOrDate)}` : ""} · Retrieved ${escapeHtml(source.retrievedAt)}<br><span class="meta-label">Applicability</span> ${escapeHtml(source.applicability)}<br><span class="meta-label">Counter-evidence result</span> ${escapeHtml(source.counterEvidence)}<br><span class="meta-label">Confidence</span> ${escapeHtml(source.confidence)}<br><a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a></li>`).join("");

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
            <div><span class="meta-label">PCI obligations and validation dependencies</span>${actionSummary(report.outcome.pciDependencies)}</div>
            <div><span class="meta-label">Business launch rules</span>${actionSummary(report.outcome.businessLaunchRules)}</div>
            <div style="grid-column: 1 / -1"><span class="meta-label">Defence-in-depth hardening</span>${actionSummary(report.outcome.defenseInDepth)}</div>
      </div>
    </div>
  </section>
  <section aria-labelledby="executive-summary">${sectionHeading(2, "executive-summary", "Executive summary")}${list(report.executiveSummary)}</section>
  <section aria-labelledby="scope-methodology">
    ${sectionHeading(3, "scope-methodology", "Scope and methodology")}
    <div class="split"><div class="subsection"><h3>Included</h3>${list(report.scope.included)}</div><div class="subsection"><h3>Excluded</h3>${list(report.scope.excluded)}</div></div>
    <div class="subsection" style="margin-top: 2rem"><h3>Methodology</h3>${list(report.scope.methodology)}</div>
  </section>
  <section aria-labelledby="assessment-provenance">${sectionHeading(4, "assessment-provenance", "Assessment provenance")}${renderTable(["Record", "Value"], provenanceRows)}</section>
  <section aria-labelledby="integration-inventory">${sectionHeading(5, "integration-inventory", "Integration and version inventory")}${renderTable(["Record", "Value"], versionRows)}</section>
  <section aria-labelledby="payment-page-scripts">${sectionHeading(6, "payment-page-scripts", "Payment-page script inventory")}${renderTable(["Party", "Owner", "Purpose", "Source", "Change control", "Payment impact", "Evidence"], scriptRows)}</section>
  <section aria-labelledby="service-providers">${sectionHeading(7, "service-providers", "Service-provider responsibilities")}${renderTable(["Provider", "Role", "Payment-security impact", "Responsibility", "Status", "Evidence"], providerRows)}</section>
  <section aria-labelledby="card-data-flow">
    ${sectionHeading(8, "card-data-flow", "Architecture and card-data flow")}
    <ol class="flow">${report.paymentFlow.map((item) => `<li><span class="flow__step">${item.step}</span><div><h3>${escapeHtml(item.actor)}</h3><p>${escapeHtml(item.action)}</p><div class="evidence">${escapeHtml(item.evidence)}</div></div></li>`).join("")}</ol>
  </section>
  <section aria-labelledby="findings-summary">${sectionHeading(9, "findings-summary", "Findings summary")}${renderTable(["Reference", "Finding", "Severity", "Status"], findingsRows)}</section>
  <section aria-labelledby="detailed-findings">${sectionHeading(10, "detailed-findings", "Detailed findings")}${findings || '<p>No findings were provided.</p>'}</section>
  <section aria-labelledby="claim-ledger">${sectionHeading(11, "claim-ledger", "Claim ledger")}${renderTable(["Reference", "Claim", "Type", "Status", "Evidence or qualification", "Applicability", "Counter-evidence result", "Confidence", "Sources"], ledgerRows)}</section>
  <section aria-labelledby="controls">
    ${sectionHeading(12, "controls", "Technical and operational controls")}
    <div class="subsection"><h3>Technical controls</h3>${controlTable(report.controls.technical)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Operational controls</h3>${controlTable(report.controls.operational)}</div>
  </section>
  <section aria-labelledby="remediation">
    ${sectionHeading(13, "remediation", "Prioritised remediation")}
    <div class="subsection"><h3>PCI obligations and validation dependencies</h3>${remediationTable(report.remediation.pciDependencies)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Business launch rules</h3>${remediationTable(report.remediation.businessLaunchRules)}</div>
    <div class="subsection" style="margin-top: 2rem"><h3>Defence-in-depth hardening</h3>${remediationTable(report.remediation.defenseInDepth)}</div>
  </section>
  <section aria-labelledby="unknowns">${sectionHeading(14, "unknowns", "Residual unknowns")}${list(report.unknowns)}</section>
  <section aria-labelledby="sources">${sectionHeading(15, "sources", "Sources")}<ol class="source-list">${sources}</ol></section>
  <p class="disclaimer">${escapeHtml(report.disclaimer)}</p>
  <p class="print-note">This self-contained report was generated locally. It does not load external scripts, styles, fonts or images.</p>`;
}

function renderTableOfContents() {
  const sections = [
    ["preliminary-outcome", "Preliminary outcome"], ["executive-summary", "Executive summary"], ["scope-methodology", "Scope and methodology"],
    ["assessment-provenance", "Assessment provenance"], ["integration-inventory", "Integration and versions"], ["payment-page-scripts", "Payment-page scripts"], ["service-providers", "Service providers"],
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
