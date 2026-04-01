# PDF Report Layout

## Goal

Create a generated PDF report that feels like an official engineering document while still matching the app's industrial black/white worksheet language.

The PDF should be printable, readable, and structured enough to hand to a colleague or attach to a review package.

## Design Principles

- Keep the visual language consistent with the web app: black borders, grayscale fills, compact tables, and tabular numerals.
- Reduce UI chrome: no buttons, no controls, no interactive cues.
- Favor clarity over decoration: clean section hierarchy, concise labels, and strong spacing.
- Make it feel like a formal report, not a screenshot of the website.
- Preserve the engineering tone: explicit formulas, assumptions, and validation status.

## Page Format

- Default size: A4 portrait.
- Margins: moderate printable margins on all sides.
- Orientation: portrait by default; landscape only if the table becomes too dense later.
- Pagination: allow content to flow across pages naturally.
- Header and footer: repeated on each page.
- Page numbers: bottom right or centered in the footer.

## Header

The report header should appear at the top of page 1 and repeat in compact form on following pages.

Header content:

- Project name: `Tolerance Stackup Analysis`
- Report title: `Full Stackup Report`
- Report timestamp: generated date and time
- Units: `mm`
- Report version or build label, if available later

Header styling:

- Strong top border
- Small uppercase label line
- Prominent title
- Compact metadata row beneath the title

## Section Order

Use this order for the full report:

1. Report header
2. Executive summary
3. Validation summary
4. Stack definition table
5. Stack equation summary
6. Deterministic results
7. Monte Carlo summary
8. Assumptions and notes
9. Footer

## Executive Summary

This should be the first boxed content block after the header.

Include:

- Total nominal
- Worst-case min/max
- RSS min/max
- RSS tolerance
- Monte Carlo sample count, if run
- Overall validation state

Layout:

- Use a compact grid of value cards or a two-column summary table.
- Keep labels small and uppercase.
- Emphasize values with larger type and tabular numerals.

## Validation Summary

This section should state whether the current report inputs are valid.

Include:

- Valid / invalid state
- Row count
- Error count
- Zero-tolerance row count
- Any notable validation messages

Styling:

- Green is not necessary; use neutral and black styling to stay aligned with the app.
- If invalid, use a stronger border or shaded warning box.
- If valid, use a clean confirmation box.

## Stack Definition Table

This is the main body of the report.

Columns:

- Row number
- Label
- Direction
- Nominal
- Upper tolerance
- Lower tolerance
- Signed contribution

Table behavior:

- Keep borders strong and consistent.
- Use a compact row height.
- Prefer one row per line with no wrapping unless a label is long.
- Repeat the table header on new pages if the table spans pages.

Styling details:

- Header row with a dark or gray fill.
- Alternating row shading may be used sparingly.
- Numbers aligned to the right.
- Direction shown clearly as `+` or `-`.

## Stack Equation Summary

Include a concise formula section that mirrors the live equation in the app.

Include:

- Signed nominal expression by row
- Final nominal total

Style:

- Show as a compact monospace-like block or inline boxed tokens.
- Keep it readable but not overly wide.

## Deterministic Results

This section should present the calculation results clearly.

Include:

- Total nominal
- Worst-case min
- Worst-case max
- RSS tolerance
- RSS min
- RSS max

Presentation:

- Two-column or three-column result table.
- Emphasize the worst-case and RSS bands.
- Use a formal table rather than cards if the report should feel more official.

## Monte Carlo Summary

If Monte Carlo was run, include a dedicated section.

Include:

- Sample count
- Seed, if relevant and exposed
- Mean
- Min / max
- 5th percentile
- 95th percentile
- Histogram summary

Presentation options:

- Small summary table for the statistics.
- A compact bar-style histogram rendered with simple blocks or shaded rectangles.
- Keep the chart minimal and document-like, not dashboard-like.

## Assumptions and Notes

This section should reinforce the modeling scope.

Include:

- 1D linear chain only
- RSS assumes independent contributors
- Asymmetric tolerances are allowed
- RSS and Monte Carlo are approximations, not guarantees
- Units must be consistent

The notes section should be brief and formal.

## Footer

Footer content:

- Project name or short report label
- Page number
- Optional contact or source reference

Footer styling:

- Thin top border
- Small muted text
- Keep it unobtrusive

## Visual Language

The PDF should reuse the website's identity, but in a more formal document form.

Use:

- Black borders
- White background
- Light gray section fills
- Tabular numerals
- Compact uppercase labels

Avoid:

- Large decorative graphics
- Bright accent colors
- Rounded, playful cards
- Heavy shadows
- Dashboard-style spacing

## Recommended Implementation Shape

Generate the PDF from a report data object rather than from rendered DOM.

Suggested structure:

- `report.metadata`
- `report.validation`
- `report.rows`
- `report.results`
- `report.monteCarlo`
- `report.notes`

This keeps the export deterministic and easier to test.

## Success Criteria

- The PDF reads like an official engineering report.
- The style still matches the app's worksheet identity.
- It is easy to print and review.
- The layout remains readable across multiple pages.
