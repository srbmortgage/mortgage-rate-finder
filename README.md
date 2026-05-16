# Mortgage Loan Officer Website

A static, borrower-facing mortgage website for Srikanth Reddy Bollampalli at Barrett Financial Group. The domain uses SRB as initials, but the site identity is the licensed MLO name for compliance clarity. It focuses on useful education, payment planning, loan options, document readiness, process clarity, and compliance-conscious disclosures.

## What it includes

- Static-generated SEO site with homepage, state landing pages, and loan-service pages.
- Payment calculator with principal and interest, taxes, insurance, estimated mortgage insurance, and loan amount.
- Plain-language pages for conventional, FHA, VA, refinance, HELOC, jumbo, purchase, and investment property financing.
- FAQ sections with matching JSON-LD on each generated page.
- Header contact links and an Apply Now call to action for the Barrett Financial profile page.
- Rate update overlay form for lead capture, configured for Formspree email delivery.
- `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph tags, breadcrumbs, and keyword map.
- Compliance reminders with MLO, brokerage, NMLS, licensed state, phone, email, and website details from the business card.

## Run it

Open `index.html` in a browser. No build step or package install is required.

To regenerate all SEO pages after editing config or page data:

```bash
node scripts/build-site.mjs
```

The generator reads:

- `site.config.mjs` for base URL, MLO profile, licensing, Apply Now URL, and rate alert settings.
- `site.pages.mjs` for state pages, service pages, metadata, keyword targets, and page-specific details.
- `scripts/build-site.mjs` for templates, JSON-LD, sitemap, robots file, and validation.

Generated pages are written to clean URL folders such as `fha-loans/index.html`.

Business card details currently used:

- Srikanth Reddy Bollampalli, Mortgage Loan Originator
- MLO NMLS #2460039
- Barrett Financial Group, NMLS #181106
- Licensed in GA, NC, SC, TN, FL, MD, and TX
- `srikanth@barrettfinancial.com`
- `(470)-223-5655` and `(404)-200-3346`
- `www.barrettfinancial.com/srikanth`

Before publishing, confirm any required legal name, company name, licensing, state disclosures, privacy policy, and fair lending language.

## SEO publishing setup

The canonical production domain is configured as `https://www.srbmortgage.com` in `site.config.mjs`. If the domain ever changes, update `baseUrl` and rerun:

```bash
node scripts/build-site.mjs
```

This updates canonical URLs, Open Graph URLs, `sitemap.xml`, and `robots.txt`.

## Rate update form setup

The `Get Rate Alert` header button opens an overlay lead form. It posts to Formspree:

```html
https://formspree.io/f/mqadzdln
```

Before accepting live submissions, make sure the Formspree form is verified in your Formspree account and the notification email is configured.

## Compliance note

The site is written to avoid promising approval, guaranteed terms, live rates, or locked pricing. Have your compliance team review final copy, licensing disclosures, state requirements, privacy practices, and any lead capture workflow before using it with borrowers.

## Project structure

```text
mortgage-rate-finder/
  index.html
  styles.css
  app.js
  README.md
```

## Local portal automation

The `automation/` folder is separate from this static borrower page. It contains a local runner for lender portal pricing and workbook-based quote collection.
