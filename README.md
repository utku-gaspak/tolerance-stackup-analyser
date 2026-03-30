# Tolerance Stackup Analysis

Engineering-focused 1D tolerance stackup calculator built with Next.js, TypeScript, and Tailwind CSS.

Live app: https://tolstackup.com

The UI is intentionally industrial and worksheet-like: black/white/gray, compact tables, explicit borders, and panel-based engineering output.

## What It Does

- Defines a linear tolerance chain
- Calculates total nominal using `F-01`
- Calculates worst-case min/max using `F-02`
- Calculates an RSS band using `F-03`
- Shows a live stack equation and current signed nominal expression
- Provides a formula reference panel for `F-01` to `F-03`
- Runs an optional Monte Carlo estimate with histogram output
- Validates invalid numeric input and tolerance rules
- Loads sample presets aligned with `V-01`, `V-02`, and `V-03`

## Scope

This project is intentionally small and practical.

Included in MVP:

- editable stack rows
- label, nominal, plus tolerance, minus tolerance, direction
- live stack equation summary
- live results
- formula reference
- Monte Carlo distribution panel
- validation feedback
- sample presets
- industrial engineering-style UI

Not included in MVP:

- auth
- database
- multi-user features
- CAD integration
- advanced GD&T
- Monte Carlo simulation

## Formulas

The calculation core follows `docs/FORMULAS.md`.

- `F-01` Total nominal stack: `Σ(direction_i * n_i)`
- `F-02` Worst-case stack bounds: deterministic min/max propagation
- `F-03` RSS approximation: `sqrt(Σ(effective_tol_i^2))`
- `F-04` Monte Carlo simulation: random sampled assemblies using a normal distribution clipped to row tolerances

Important note:

- RSS is an approximation, not a guarantee
- worst-case is conservative and deterministic
- formulas are implemented as pure utilities in `lib/stackup.ts`
- Monte Carlo is implemented separately in `lib/monte-carlo.ts`

## Assumptions

The app follows `docs/ASSUMPTIONS.md`.

- `A-01` 1D linear chain only
- `A-02` RSS contributors are independent
- `A-03` asymmetric tolerances are allowed
- `A-04` units must stay consistent
- `A-05` no advanced GD&T in MVP
- `A-06` negative tolerances are invalid input
- `A-07` deterministic core comes first
- `A-08` approximation labels must be honest

## Validation Cases

Manual validation cases live in `docs/VALIDATION_CASES.md`.

- `V-01` all positive contributors
- `V-02` mixed positive and negative directions
- `V-03` asymmetric tolerance example
- `V-04` zero tolerance row
- `V-05` invalid input handling

Current implementation is validated against `V-01`, `V-02`, and `V-03` in the calculation core, and the UI handles `V-04` and `V-05` validation states.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## Project Structure

- `app/` - app router entry points and global styles
- `components/` - UI components
- `lib/` - types, formulas, sample data, validation
- `docs/` - engineering source-of-truth docs

## Key Files

- `lib/types.ts` - domain types
- `lib/stackup.ts` - pure calculation utilities
- `lib/monte-carlo.ts` - Monte Carlo simulation utilities
- `lib/validation.ts` - input validation helpers
- `lib/sample-data.ts` - preset stacks for validation and demo
- `components/StackTable.tsx` - table shell
- `components/StackRowEditor.tsx` - row editor
- `components/ResultsPanel.tsx` - deterministic results panel
- `components/FormulaPanel.tsx` - formula reference panel
- `components/CurrentStackExpressionPanel.tsx` - live signed expression panel
- `components/MonteCarloPanel.tsx` - simulation panel
- `tests/` - core calculation and simulation tests

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
- `npm test` - run core calculation and simulation tests
- `npm run test:watch` - run tests in watch mode

## How To Use

1. Load a sample preset or edit the default rows.
2. Change nominal values, tolerances, and direction.
3. Watch the results update live.
4. Review the live stack equation and current signed expression.
5. Run Monte Carlo when you want a distribution estimate.
6. Fix any highlighted validation errors.

## Result Interpretation

- Total nominal: baseline stack value
- Worst-case min/max: deterministic bounds using `F-02`
- RSS min/max: approximate statistical band using `F-03`
- Monte Carlo: sampled distribution summary, not a deterministic guarantee

## Validation Rules

- nominal must be numeric and non-empty
- plus tolerance must be numeric and not negative
- minus tolerance must be numeric and not negative
- direction must be `+` or `-`
- zero tolerance is allowed

## Sample Output Targets

These are the expected results for the documented validation cases:

- `V-01`: total nominal `35.00`, worst-case `34.65` to `35.35`
- `V-02`: total nominal `35.00`, worst-case `34.65` to `35.35`
- `V-03`: total nominal `60.00`, worst-case `59.70` to `60.70`

## Current Status

Implemented:

- scaffolded Next.js app
- core calculation utilities
- input validation
- sample presets
- editable stack UI
- deterministic results panel
- formula reference panel
- current stack expression panel
- Monte Carlo simulation panel
- validation messaging
- automated tests for `V-01` to `V-05`
- simulation test coverage

Next possible additions:

- tighter mobile polish
- yield / pass-rate on top of Monte Carlo
- additional sample cases
- export/report output

## Notes

- `tolerance-stackup-builder-agent/` is ignored in this repo
- formulas live in `docs/FORMULAS.md`
- assumptions live in `docs/ASSUMPTIONS.md`
- validation cases live in `docs/VALIDATION_CASES.md`
