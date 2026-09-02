import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const skillDir = path.join(root, "skills", "stripe-pci-readiness");
const failures = [];

const requiredSkillFiles = [
  "skills/stripe-pci-readiness/SKILL.md",
  "skills/stripe-pci-readiness/references/audit-checklist.md",
  "skills/stripe-pci-readiness/references/source-policy.md",
  "skills/stripe-pci-readiness/references/html-report.md",
  "skills/stripe-pci-readiness/assets/copy-paste-prompt.md",
  "skills/stripe-pci-readiness/assets/report-template.html",
  "skills/stripe-pci-readiness/assets/report.schema.json",
  "skills/stripe-pci-readiness/scripts/render-report.mjs",
  "tests/fixtures/misleading-saq-a-assessment.md",
  "tests/fixtures/misleading-saq-a-assessment.expected.md",
];

const requiredPublicFiles = [
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  ".github/workflows/validate.yml",
];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function requireFiles(files) {
  for (const relativePath of files) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      fail(`Missing required file: ${relativePath}`);
    }
  }
}

function validateFrontmatter() {
  const relativePath = "skills/stripe-pci-readiness/SKILL.md";
  if (!fs.existsSync(path.join(root, relativePath))) return;

  const content = read(relativePath);
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail("SKILL.md must start with YAML frontmatter");
    return;
  }

  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const folderName = path.basename(skillDir);

  if (name !== folderName) fail("Skill name must match its folder name");
  if (!/^[a-z0-9-]{1,64}$/.test(name ?? "")) fail("Skill name must use lowercase letters, digits, and hyphens");
  if (!description) fail("Skill description is required");
  if (description && !description.startsWith("Use when ")) fail('Skill description must start with "Use when "');
  if (match[1].length > 1024) fail("Skill frontmatter must not exceed 1024 characters");
}

function validateLocalMarkdownLinks() {
  const markdownFiles = requiredSkillFiles.filter((file) => file.endsWith(".md") && fs.existsSync(path.join(root, file)));
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const relativePath of markdownFiles) {
    const content = read(relativePath);
    for (const match of content.matchAll(linkPattern)) {
      const target = match[1].trim();
      if (/^(?:https?:|mailto:|#)/.test(target)) continue;
      const withoutAnchor = target.split("#", 1)[0];
      const resolved = path.resolve(root, path.dirname(relativePath), withoutAnchor);
      if (!fs.existsSync(resolved)) fail(`Broken local link in ${relativePath}: ${target}`);
    }
  }
}

function validateGuidanceContract() {
  const guidanceFiles = [
    "skills/stripe-pci-readiness/SKILL.md",
    "skills/stripe-pci-readiness/references/audit-checklist.md",
    "skills/stripe-pci-readiness/references/source-policy.md",
    "skills/stripe-pci-readiness/references/html-report.md",
    "skills/stripe-pci-readiness/assets/copy-paste-prompt.md",
  ].filter((file) => fs.existsSync(path.join(root, file)));

  if (guidanceFiles.length !== 5) return;
  const contentByFile = new Map(guidanceFiles.map((file) => [file, read(file)]));
  const allGuidance = [...contentByFile.values()].join("\n");

  for (const file of [
    "skills/stripe-pci-readiness/SKILL.md",
    "skills/stripe-pci-readiness/references/audit-checklist.md",
    "skills/stripe-pci-readiness/assets/copy-paste-prompt.md",
  ]) {
    if (!contentByFile.get(file).includes("source-policy.md")) {
      fail(`${file} must route to source-policy.md`);
    }
  }

  if (!contentByFile.get("skills/stripe-pci-readiness/SKILL.md").includes("html-report.md")) {
    fail("SKILL.md must route completed assessments to html-report.md");
  }

  const requiredConcepts = [
    ["not verified", /not verified/i],
    ["counter-evidence", /counter-evidence/i],
    ["claim ledger", /claim ledger/i],
    ["read-only", /read-only/i],
    ["redaction", /redact/i],
    ["accepting entity", /accepting entit/i],
    ["ASV", /\bASV\b/],
    ["non-certification disclaimer", /technical PCI-readiness assessment, not certification or legal advice/i],
  ];

  for (const [label, pattern] of requiredConcepts) {
    if (!pattern.test(allGuidance)) fail(`Guidance is missing required concept: ${label}`);
  }

  const sourcePolicy = contentByFile.get("skills/stripe-pci-readiness/references/source-policy.md");
  for (const url of [
    "https://www.pcisecuritystandards.org/faqs/1604/",
    "https://www.pcisecuritystandards.org/faqs/1588/",
    "https://docs.stripe.com/security/guide",
  ]) {
    if (!sourcePolicy.includes(url)) fail(`Source policy is missing authoritative baseline: ${url}`);
  }

  const unfinished = /\b(?:TODO|TBD|FIXME)\b|\[insert[^\]]*\]|<your[-_ ][^>]+>/i;
  for (const [file, content] of contentByFile) {
    if (unfinished.test(content)) fail(`Unfinished scaffold placeholder found in ${file}`);
  }
}

function validateSecretSafety() {
  function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if ([".git", "node_modules"].includes(entry.name)) return [];
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolutePath) : [path.relative(root, absolutePath)];
    });
  }

  const files = walk(root);
  const likelyStripeSecret = /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b|\bwhsec_[A-Za-z0-9]{16,}\b/;
  for (const file of files) {
    if (likelyStripeSecret.test(read(file))) fail(`Possible Stripe secret found in ${file}`);
  }
}

function validatePublicPackage() {
  if (requiredPublicFiles.some((file) => !fs.existsSync(path.join(root, file)))) return;

  const readme = read("README.md");
  const license = read("LICENSE");
  const security = read("SECURITY.md");
  const contributing = read("CONTRIBUTING.md");
  const workflow = read(".github/workflows/validate.yml");

  if (!/Apache License\s+Version 2\.0/i.test(license)) fail("LICENSE must contain Apache License 2.0");
  if (!/not affiliated with or endorsed by (?:Stripe|the PCI Security Standards Council)/i.test(readme)) {
    fail("README must contain the Stripe and PCI SSC non-affiliation notice");
  }
  if (!/private vulnerability reporting/i.test(security)) fail("SECURITY.md must provide private vulnerability reporting guidance");
  if (!/do not (?:include|submit|send).*(?:card|payment).*(?:data|credential)/is.test(security)) {
    fail("SECURITY.md must prohibit submitting payment credentials or card data");
  }
  if (!/primary source/i.test(contributing) || !/retriev/i.test(contributing) || !/secondary source/i.test(contributing)) {
    fail("CONTRIBUTING.md must enforce primary-source, retrieval-date, and secondary-source rules");
  }
  if (!/permissions:\s*\n\s*contents:\s*read/m.test(workflow)) fail("Workflow must use read-only contents permission");
  if (!/npm test/.test(workflow)) fail("Workflow must run npm test");
  if (/\bsecrets\./.test(workflow)) fail("Validation workflow must not consume repository secrets");
}

requireFiles(requiredSkillFiles);
requireFiles(requiredPublicFiles);
validateFrontmatter();
validateLocalMarkdownLinks();
validateGuidanceContract();
validateSecretSafety();
validatePublicPackage();

if (failures.length > 0) {
  console.error("Skill validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Skill validation passed.");
