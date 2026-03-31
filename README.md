# Tolerance Stackup Analysis

A web-based 1D tolerance stackup calculator built for fast engineering checks.

**Live demo:** https://tolstackup.com

## Overview

This project helps evaluate simple linear tolerance chains with a clean engineering-focused interface.

It supports:
- total nominal stack calculation
- worst-case minimum and maximum bounds
- RSS approximation
- Monte Carlo estimate with histogram output
- live stack expression preview
- validation for invalid input rows

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Vitest

## Why I Built It

I wanted to build a small but credible engineering product that connects software development with real mechanical design logic.

Instead of creating another generic CRUD demo, I chose a niche calculator that reflects my engineering background and produces something immediately useful and easy to demonstrate.

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Tests

```bash
npm test
```

## Notes

- The app is intentionally limited to **1D linear stackups**.
- Worst-case is deterministic and conservative.
- RSS and Monte Carlo are estimation methods and should be interpreted accordingly.
