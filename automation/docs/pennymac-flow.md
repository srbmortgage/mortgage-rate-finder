# Pennymac TPO Flow Notes

Observed from a manual login session on the Pennymac POWER+ portal.

## Login

1. Open the `LoginURL` from the `Conventional` workbook tab.
   - Current selected URL: `https://power.pennymac.com/#/content/idplogin`
2. Enter username on the first login screen.
3. Continue to the next login step.
4. Complete password and any MFA/verification prompts manually if required.
5. Successful login lands in POWER+ with the user profile visible.

Do not log or screenshot credential fields.

## Post-Login Landing Page

The logged-in page showed these primary navigation items:

- `Welcome`
- `Pipeline`
- `Add New Loan`
- `Price Scenarios`
- `Tools & Resources`

## Pricing Entry Point

Use `Price Scenarios` as the first target for pricing automation.

V1 automation should:

1. Log in and pause for manual MFA.
2. Click `Price Scenarios`.
3. Record the next screen's required fields.
4. Map each field to the `PricingScenarios` workbook columns.
5. Extract rate results into `PricingResults`.

## Known Automation Notes

- The workbook's `Wholesale Website` column points to the public Pennymac TPO site.
- The workbook's `LoginURL` column points to the POWER+ login portal and must be preferred.
- Login is multi-step; username may appear before password.
