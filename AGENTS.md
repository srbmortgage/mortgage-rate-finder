# Agent Instructions

## Project Context

This project is a static browser app for an MLO, or Mortgage Loan Officer. The goal is to help compare borrower needs against lender pricing for:

- Purchase
- Refinance
- HELOC
- HELOAN

The app should help identify the best possible lender options using borrower scenario fields such as loan purpose, property value, current balance, requested loan amount, credit score, state, product, LTV, and CLTV.

## Architecture

- `index.html`: App structure and form controls.
- `styles.css`: Responsive UI styling.
- `app.js`: Sample lender data, scenario logic, quote matching, payment estimates, CSV export.
- `automation/`: Local lender portal automation runner. Keep it separate from the static app.
- `README.md`: Human-facing project overview and integration notes.

The static app is intentionally dependency-free. Automation code may use its own dependencies inside `automation/`.

## Development Rules

- Keep changes small and directly tied to the user request.
- Preserve the static-app model unless a backend or persistence layer is explicitly requested.
- Use the existing data shape in `app.js` when adding lender fields.
- Treat rates in the repo as sample data only, not live market rates.
- Do not commit lender credentials, downloaded lender workbooks, generated automation workbooks, screenshots, or browser session files.
- Never print credential values in logs, terminal output, docs, or test fixtures.
- For HELOC and HELOAN logic, evaluate combined loan-to-value when borrower debt includes an existing first mortgage.
- For purchase logic, include down payment in cash-to-close estimates.
- For refinance logic, avoid treating cash-out request amounts as down payment.

## Token-Saving Practices

- Read only the files needed for the current task.
- Prefer `rg` for search and targeted `sed -n` ranges for file reads.
- Avoid pasting whole files into chat unless necessary.
- Summarize large unchanged sections instead of repeating them.
- Use `git diff -- <file>` only for files being edited.
- When modifying code, make focused patches with `apply_patch`.
- In final responses, mention only changed files, verification, and important caveats.

## Verification

For JavaScript changes, run:

```bash
node --check app.js
```

For automation changes, run:

```bash
cd automation
npm run check
```

If browser tooling is available, also refresh or open:

```text
file:///Users/admin/Documents/New%20project/mortgage-rate-finder/index.html
```

Check at least one purchase scenario and one HELOC or HELOAN scenario after changing matching logic.
