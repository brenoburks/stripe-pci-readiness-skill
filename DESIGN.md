---
name: Stripe PCI Readiness Report
description: A calm, evidence-first technical dossier for PCI readiness findings.
colors:
  paper: "#ffffff"
  paper-muted: "#f3f7f8"
  ink: "#17262c"
  ink-muted: "#526269"
  rule: "#c8d4d8"
  accent: "#24778e"
  accent-soft: "#e4f3f7"
  critical: "#a93832"
  warning: "#9a5b08"
  positive: "#23714f"
typography:
  display:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 720
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.018em"
  body:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "0.055em"
rounded:
  none: "0"
  subtle: "4px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "64px"
components:
  outcome-panel:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.subtle}"
    padding: "24px"
  finding:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.subtle}"
    padding: "24px 0"
  evidence-block:
    backgroundColor: "{colors.paper-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.subtle}"
    padding: "16px"
---

# Design System: Stripe PCI Readiness Report

## Overview

**Creative North Star: "The Assurance Dossier"**

The report feels like a carefully prepared technical review handed across a table. It is calm, exacting and accountable. The result is visible before the supporting detail, while every consequential statement remains traceable to evidence and a source.

This is a product document, not a marketing page. The layout is predictable, moderately dense and optimised for focused reading on screen or paper. It rejects neon cyber dashboards, dark hacker interfaces, compliance-certificate styling, unreadable spreadsheet dumps and editorial effects that suggest more certainty than the evidence supports.

**Key Characteristics:**

- Outcome first, provenance always visible.
- White paper, graphite text and one restrained blue accent.
- Flat surfaces separated by rules, spacing and tonal contrast.
- The same information architecture on desktop, mobile and print.
- No external fonts, images, scripts or network dependencies.

## Colors

The palette is a cool neutral system with a single assurance-blue accent. Semantic colours communicate severity or verified state only.

### Primary

- **Assurance Blue:** Used for navigation, focus, key references and the preliminary outcome boundary.
- **Pale Signal:** Used behind the lead outcome and carefully selected evidence callouts.

### Neutral

- **Paper:** The main reading surface and print background.
- **Cool Paper:** Secondary evidence and metadata surfaces.
- **Graphite Ink:** All primary copy and headings.
- **Muted Graphite:** Supporting copy and metadata.
- **Document Rule:** Dividers, tables and boundaries.

### Semantic

- **Critical Red:** Urgent exposure or launch-blocking risk only.
- **Caution Ochre:** Material risk or unresolved requirement only.
- **Verified Green:** Verified positive state only, never general decoration.

**The Evidence Colour Rule.** Colour must never be the sole carrier of meaning. Every state includes a text label.

**The One Accent Rule.** Assurance Blue is the only non-semantic accent and occupies less than ten percent of the page.

## Typography

**Display Font:** Native user-interface sans-serif stack

**Body Font:** Native user-interface sans-serif stack

**Label/Mono Font:** Native monospace stack

**Character:** Familiar system type keeps the report fast, portable and neutral. Strong weight and controlled spacing create authority without imitating a legal certificate.

### Hierarchy

- **Display** (720, 2.5rem, 1.05): Report title and preliminary outcome only.
- **Headline** (700, 1.5rem, 1.2): Major report sections.
- **Title** (680, 1.125rem, 1.3): Finding titles and subsection headings.
- **Body** (400, 1rem, 1.6): Long-form analysis, limited to approximately 72 characters per line.
- **Label** (650, 0.75rem, 1.35): Evidence references, categories and compact metadata. Uppercase is limited to short labels.

**The Two-Speed Rule.** The opening summary can be scanned in under one minute; the detailed body supports line-by-line technical review.

**The Plain-Language Rule.** Define PCI terminology on first use and never use formal tone to conceal uncertainty.

## Elevation

The report is flat. It uses no decorative shadows. Depth comes from paper tones, one-pixel rules, spacing and a small number of bounded callouts. Screen and print therefore preserve the same hierarchy.

**The Flat Evidence Rule.** Findings are separated by whitespace and rules, not floating card stacks. Nested cards are forbidden.

## Components

### Outcome panel

The opening decision surface contains the preliminary classification, confidence, raw card-data exposure, PCI validation dependencies, business launch rules, defence-in-depth hardening and most important uncertainty. It uses Pale Signal, one restrained Assurance Blue rule and plain-language qualifiers.

### Findings

Each finding is a numbered document section, not a dashboard tile. It contains severity, category, status, observation, consequence, exact evidence, recommendation, verification method and source references in a consistent order.

### Severity labels

Labels use a semantic colour, explicit severity word and strong text contrast. They are compact rectangles with subtle corners, not decorative pills.

### Evidence blocks

Evidence uses Cool Paper and monospace reference labels. Code, paths and commands wrap safely and never force horizontal page overflow.

### Tables

Summary and claim-ledger tables use aligned columns, tabular numerals and visible headers. On narrow screens each row becomes a labelled record. No core information is hidden. Print keeps tables intact where possible and repeats table headers.

### Navigation

The screen report includes a skip link and a restrained table of contents. Desktop may keep the contents visible beside the document. Mobile places it in normal flow. Print removes navigation and exposes useful link destinations.

**The Native Document Rule.** Core content requires no JavaScript. Semantic HTML and CSS provide navigation, disclosure, responsiveness and print behaviour.

## Do's and Don'ts

### Do

- **Do** lead with the preliminary outcome, confidence and material uncertainty.
- **Do** keep body text at 1rem or larger and use a 1.6 line height for analysis.
- **Do** maintain a 4px spacing system with 8px to 12px within groups and 48px to 64px between major sections.
- **Do** show text labels alongside all severity and verification colours.
- **Do** make every link meaningful out of context and every table understandable without colour.
- **Do** preserve logical page breaks, full source URLs and legible contrast when printed.

### Don't

- **Don't** use neon cyber dashboards or dark hacker UI.
- **Don't** make the report resemble a compliance certificate or claim a pass the evidence cannot support.
- **Don't** reduce detailed evidence to an unreadable spreadsheet.
- **Don't** use AI editorial mood, decorative gradients, glass effects, stock imagery or fake charts.
- **Don't** wrap every section in a card or place cards inside cards.
- **Don't** use animation, hover-only controls, external assets or required client-side scripts.
- **Don't** show secrets, complete card numbers, CVC values or personal data.
