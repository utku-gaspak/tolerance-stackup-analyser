# Design Plan

## Goal

Keep the current industrial, worksheet-like style while making the app usable on a 13-inch MacBook Air without zooming or page-level horizontal scrolling.

## Problems To Solve

- The left stack table is too wide for smaller laptop viewports.
- The current multi-panel desktop layout is preserved too early in the responsive range.
- The table uses explicit widths that make shrinking difficult.

## Approach

1. Make the page width fluid with a sensible max width, not an ultra-wide fixed layout.
2. Switch from a 3-column desktop arrangement to a stacked layout earlier, likely around `lg` instead of `xl`.
3. Keep the stack table primary and push supporting panels below it on smaller screens.
4. Reduce table density on narrow viewports by lowering padding, font sizes, and possibly hiding lower-priority columns.
5. Allow horizontal scrolling only inside the table container if needed, never for the whole page.
6. Preserve the same visual language: borders, grayscale palette, compact spacing, and clear section separation.

## Layout Rules

- Desktop wide screens: keep the current side-by-side worksheet composition.
- Mid-size laptops: stack panels vertically and keep only the table prominent.
- Small laptops / tablets: use compact table styling and tighter section spacing.
- Mobile: prioritize read/write flow over multi-panel density.

## Likely Code Changes

- Adjust the root page grid breakpoints in `app/page.tsx`.
- Replace unsupported width classes with valid Tailwind sizing.
- Rework `StackTable` column priorities so essential fields remain visible first.
- Tighten spacing in `ResultsPanel`, `MonteCarloPanel`, and formula sections at smaller widths.

## Success Criteria

- No need to zoom out on a 13-inch MacBook Air.
- No page-level horizontal scroll for the main layout.
- The app still feels like an engineering worksheet on a large monitor.
- The stack table remains readable and editable.
