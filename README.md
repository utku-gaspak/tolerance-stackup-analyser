# Tolerance Stackup Analysis

Engineering-focused 1D tolerance stackup calculator built with Next.js, TypeScript, and Tailwind CSS.

Live app: https://tolstackup.com

The UI is intentionally industrial and worksheet-like: black/white/gray, compact tables, explicit borders, and panel-based engineering output.

## Status

Core MVP roadmap completed.

This release closes the initial product polish phase:

- core UX cleanup completed
- helper/reference panel visibility improved
- review automation added
- PDF export stabilized
- GA4 added with working consent flow
- privacy policy and privacy settings added

The project is now in a stable niche MVP state.

Future work should be treated as:

- maintenance
- bug fixes
- optional feature expansion
- productization work

## Overview

This app models a linear stack of dimensions and evaluates it with deterministic and statistical methods.

It currently supports:

- editable stack rows with label, nominal, plus tolerance, minus tolerance, and direction
- live total nominal, worst-case, and RSS results
- live stack equation and signed nominal expression
- what-if tolerance scaling globally and per row
- Monte Carlo simulation with histogram output
- optional lower and upper spec limits with yield estimate
- sensitivity ranking for dominant RSS contributors
- CSV import and CSV export for stack rows
- PDF export and JSON export for the current report state
- saved variant snapshots with side-by-side comparison
- engineering unit switching between `mm` and `in`
- validation messaging for invalid and zero-tolerance rows
- sample presets covering the main reference scenarios

## Scope

This project is intentionally practical and narrow in scope.

Included:

- 1D linear chain stackups
- deterministic stack calculations
- statistical approximation views
- exportable engineering review output
- lightweight scenario exploration

Not included:

- auth
- database
- multi-user collaboration
- CAD integration
- advanced GD&T

## Formulas

The deterministic calculation core is implemented in `lib/stackup.ts`.

- `F-01` Total nominal stack: `Σ(direction_i × n_i)`
- `F-02` Worst-case stack bounds: deterministic min/max propagation
- `F-03` RSS approximation: `sqrt(Σ(((t_plus_i + t_minus_i)/2)^2))`
- `F-04` Monte Carlo simulation: bounded random sampling around each row nominal

Important notes:

- worst-case is conservative and deterministic
- RSS uses average row tolerance and assumes independent contributors
- Monte Carlo uses a normal sample with sigma approximated from average row tolerance, then clips each sample to row bounds
- RSS and Monte Carlo are approximations, not guarantees

## Assumptions

- `A-01` 1D linear chain only
- `A-02` RSS contributors are treated as independent
- `A-03` asymmetric tolerances are allowed
- `A-04` zero tolerance rows are valid and stay fixed at nominal
- `A-05` negative tolerances are invalid input
- `A-06` unit conversions must stay internally consistent
- `A-07` deterministic results come first; statistical views are secondary
- `A-08` statistical wording in UI and exports should stay explicit

## Validation Cases

Validation coverage lives in `tests/`.

- `V-01` all positive contributors
- `V-02` mixed positive and negative directions
- `V-03` asymmetric tolerance example
- `V-04` zero tolerance row
- `V-05` invalid input handling

Current implementation covers deterministic logic, Monte Carlo edge cases, PDF/JSON report shaping, and variant comparison behavior with automated tests.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Vitest
- jsPDF

## Project Structure

- `app/` - app router entry points and page composition
- `components/` - UI panels and editors
- `hooks/` - page-level state orchestration
- `lib/` - calculation, conversion, validation, export, and report helpers
- `tests/` - deterministic, Monte Carlo, export, and comparison tests

## Key Files

- `app/page.tsx` - main app composition and state wiring
- `components/StackTable.tsx` - stack definition table, CSV actions, and what-if controls
- `components/ResultsPanel.tsx` - deterministic results, sensitivity view, spec check, exports, and saved variant comparison
- `components/MonteCarloPanel.tsx` - Monte Carlo controls and distribution output
- `hooks/useReportExport.ts` - JSON/PDF report export wiring
- `hooks/useSavedVariants.ts` - saved snapshot state and comparison selection
- `hooks/useWhatIfScenario.ts` - global and per-row what-if scaling
- `lib/stackup.ts` - pure deterministic calculation utilities
- `lib/monte-carlo.ts` - Monte Carlo simulation utilities
- `lib/sensitivity.ts` - RSS contribution analysis
- `lib/units.ts` - `mm` / `in` conversion helpers
- `lib/pdf-report-data.ts` - shared report payload builder for PDF and JSON
- `lib/pdf-export.ts` - PDF rendering
- `lib/json-export.ts` - JSON report export

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Build for production

```bash
npm run build
```

### 4. Start the production server

```bash
npm run start
```

## Scripts

- `npm run dev` - start the local dev server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript without emitting files
- `npm run check` - run lint, type-check, and tests together
- `npm test` - run the Vitest suite
- `npm run test:watch` - run tests in watch mode

## Review Automation

Use the review scripts to generate desktop screenshots, mobile screenshots, and a PDF export for UI review or regression checks.

Scripts:

- `scripts/capture-screenshots.mjs`
- `scripts/export-pdf.mjs`
- `scripts/review-artifacts.sh`

NPM commands:

- `npm run shots`
- `npm run pdf`
- `npm run review:artifacts`

Local usage:

```bash
npm run dev
```

In another terminal:

```bash
BASE_URL=http://localhost:3000 npm run review:artifacts
```

When using `http://localhost:3000`, the dev server must already be running.

Production usage:

```bash
BASE_URL=https://tolstackup.com npm run review:artifacts
```

In that case, no local dev server is needed.

Output files are written to:

- `artifacts/screenshots/`
- `artifacts/downloads/`

Generated screenshots, PDFs, and other review artifacts are local outputs only and should not be committed.

## How To Use

1. Choose `mm` or `in` from the unit toggle.
2. Load a preset or edit the current rows directly in the stack table.
3. Adjust nominal values, tolerances, and direction.
4. Use the what-if controls if you want to scale tolerances globally or by row without changing the base stack.
5. Review total nominal, worst-case, RSS, sensitivity, and spec-check output in the results panel.
6. Run Monte Carlo when you want a distribution estimate and optional yield against spec limits.
7. Save snapshots if you want to compare two valid variants side by side.
8. Export the current report as PDF or JSON when you need to share the analysis state.

## Result Interpretation

- Total nominal: baseline signed stack value
- Worst-case min/max: deterministic bounds from row limits
- RSS min/max: approximate statistical band from average row tolerances
- Sensitivity: rows ranked by RSS contribution share
- Spec check: deterministic go / no-go against configured limits using worst-case bounds
- Monte Carlo: sampled distribution summary and optional yield estimate

## Exports

The app supports:

- CSV export for stack rows
- CSV import for stack rows
- PDF report export for engineering review
- JSON report export using the same report payload model as the PDF

PDF and JSON exports include:

- validation summary
- stack definition
- deterministic results
- Monte Carlo summary and histogram when available
- assumptions and notes
- active engineering unit

## Monte Carlo And Spec Limits

The Monte Carlo panel estimates the distribution of the finished stack using repeated bounded random samples.

What it shows:

- mean, min, max
- P05 and P95 bounds
- histogram of sampled totals
- yield and in-spec count when lower and/or upper spec limits are set

Spec limits are optional acceptance limits for the simulated total stack value.

- lower spec limit = minimum acceptable total
- upper spec limit = maximum acceptable total
- either side may be left blank
- yield is the fraction of Monte Carlo samples inside the configured band

Monte Carlo output should be treated as an estimate, not a deterministic release criterion.

## Validation Rules

- label is required
- nominal must be numeric and non-empty
- plus tolerance must be numeric and non-negative
- minus tolerance must be numeric and non-negative
- direction must be `+` or `-`
- zero tolerance is allowed

## Sample Output Targets

These are the expected deterministic targets for the documented reference cases:

- `V-01`: total nominal `35.00`, worst-case `34.65` to `35.35`
- `V-02`: total nominal `35.00`, worst-case `34.65` to `35.35`
- `V-03`: total nominal `60.00`, worst-case `59.70` to `60.70`

## Current Status

Implemented:

- deterministic stack calculations
- editable stack UI
- validation messaging
- sample presets
- what-if tolerance scaling
- Monte Carlo simulation with optional spec limits
- sensitivity analysis
- CSV import/export
- PDF and JSON report export
- saved variant comparison
- engineering unit switching
- automated tests for deterministic logic, Monte Carlo, exports, and comparison flows

Open product work:

- dominance warnings based on sensitivity share

## Notes

- `tolerance-stackup-builder-agent/` is ignored in this repo
- formulas live primarily in `lib/stackup.ts`
- shared report shaping lives in `lib/pdf-report-data.ts`
- validation and behavior coverage live in `tests/`
