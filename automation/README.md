# Lender Portal Automation

Local desktop automation for logging into lender portals, running pricing scenarios, and writing normalized quote results.

## V1 Scope

- Pilot lender: Pennymac.
- Reads lender login details from the shared Google-exported Excel workbook.
- Keeps the shared lender workbook read-only.
- Reads scenarios from a separate automation workbook.
- Writes results and run logs back to the separate automation workbook.
- Pauses for manual MFA or portal checkpoints.

## Setup

```bash
cd automation
python3 python/create_workbook.py --out data/pricing-automation.xlsx
```

The generated workbook has:

- `PricingScenarios`: borrower scenarios to run.
- `PricingResults`: normalized lender quote output.
- `RunLog`: run status and errors.

## Shared Lender Workbook

By default, the runner reads this public export URL:

```text
https://docs.google.com/spreadsheets/d/1iGgdPOYfdsr4b_omUxZSjz9z0Wq8uZvo/export?format=xlsx
```

You can override it:

```bash
LENDER_WORKBOOK_URL="https://..." npm run find-lender -- --lender Pennymac
```

## Commands

Find Pennymac in the shared workbook without printing credentials using Python:

```bash
python3 python/find_lender.py --lender Pennymac
```

The lookup searches the `Conventional` tab first because that tab carries Pennymac login URL and credential details in this workbook.

If Python Playwright is installed locally in `.python-deps`, launch a visible Pennymac dry login:

```bash
PYTHONPATH=.python-deps PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers \
  python3 python/pennymac_dry_login.py --lender Pennymac
```

Use `--no-submit` to fill the fields without clicking login.

The browser runner is Node/Playwright-based. On a machine with Node/npm available, install dependencies first:

```bash
npm install
```

Then find Pennymac with the Node runner:

```bash
npm run find-lender -- --lender Pennymac
```

Open Pennymac, fill login credentials, then stop after login/MFA:

```bash
npm run dry-login -- --workbook data/pricing-automation.xlsx --lender Pennymac
```

Run all active scenarios:

```bash
npm run run -- --workbook data/pricing-automation.xlsx --lender Pennymac
```

## Safety

- Credential values are never logged by the runner.
- Screenshots are not captured automatically because they may expose borrower or account data.
- If MFA appears, complete it manually in the opened browser, then press Enter in the terminal.
- If Pennymac changes its portal layout, update only `src/adapters/pennymac.js`.

## Pennymac flow notes

See `docs/pennymac-flow.md` for observed login and dashboard steps.
