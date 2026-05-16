import { promptToContinue, timestamp } from "../utils.js";

const USERNAME_SELECTORS = [
  'input[name="username"]',
  'input[name="userName"]',
  'input[name="userid"]',
  'input[name="userId"]',
  'input[type="email"]',
  'input[autocomplete="username"]',
  'input[id*="user" i]',
  'input[placeholder*="user" i]',
  'input[placeholder*="email" i]',
];

const PASSWORD_SELECTORS = [
  'input[name="password"]',
  'input[type="password"]',
  'input[autocomplete="current-password"]',
  'input[id*="pass" i]',
  'input[placeholder*="pass" i]',
];

const SUBMIT_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button:has-text("Log In")',
  'button:has-text("Login")',
  'button:has-text("Sign In")',
  'text=Log In',
  'text=Login',
  'text=Sign In',
];

const PRICING_LINK_SELECTORS = [
  'text=Price Scenarios',
  'text=Pricing',
  'text=Price a Loan',
  'text=Quick Price',
  'text=Quick Quote',
  'text=Rate Quote',
  'a[href*="pricing" i]',
  'a[href*="quote" i]',
];

export async function login(page, lender, options = {}) {
  if (!lender.loginUrl) {
    throw new Error("Pennymac login URL was not found in the lender workbook.");
  }
  if (!lender.username || !lender.password) {
    throw new Error("Pennymac credentials were not found or could not be parsed.");
  }

  await page.goto(lender.loginUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await fillFirst(page, USERNAME_SELECTORS, lender.username, "username");
  if (!(await fillOptional(page, PASSWORD_SELECTORS, lender.password))) {
    await clickFirst(page, NEXT_SELECTORS, "next/continue");
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(2500);
    await fillFirst(page, PASSWORD_SELECTORS, lender.password, "password");
  }
  await clickFirst(page, SUBMIT_SELECTORS, "login submit");

  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await promptToContinue(
    "If Pennymac shows MFA, verification, terms, or a dashboard checkpoint, complete it in the browser.",
  );

  if (options.stopAfterLogin) {
    return {
      status: "LoggedInPaused",
      message: "Stopped after login checkpoint by request.",
    };
  }

  return {
    status: "LoggedIn",
    message: "Login flow completed through manual checkpoint.",
  };
}

const NEXT_SELECTORS = [
  'button:has-text("Next")',
  'button:has-text("Continue")',
  'button:has-text("Submit")',
  'input[type="submit"]',
  'button[type="submit"]',
  'text=Next',
  'text=Continue',
];

export async function priceScenario(page, scenario) {
  await navigateToPricing(page);
  await promptToContinue(
    `Enter or verify scenario ${scenario.ScenarioId} in Pennymac pricing. The runner will extract visible pricing text after you continue.`,
  );

  const rawSummary = await extractVisiblePricingSummary(page);
  const quote = parsePricingSummary(rawSummary);

  return {
    ScenarioId: scenario.ScenarioId,
    LenderName: "Pennymac",
    Product: quote.product || scenario.Product,
    Rate: quote.rate,
    APR: quote.apr,
    Points: quote.points,
    Fees: quote.fees,
    Payment: quote.payment,
    LockDays: scenario.LockDays,
    Timestamp: timestamp(),
    Status: quote.rate ? "Priced" : "NeedsReview",
    RawSummary: rawSummary.slice(0, 30000),
    ErrorMessage: quote.rate ? "" : "Could not confidently parse a rate from the visible page text.",
  };
}

async function navigateToPricing(page) {
  const clicked = await clickOptional(page, PRICING_LINK_SELECTORS);
  if (clicked) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    return;
  }
  await promptToContinue(
    "I could not find a Pennymac pricing link automatically. Please navigate to the pricing or quick quote page.",
  );
}

async function extractVisiblePricingSummary(page) {
  return page.locator("body").innerText({ timeout: 10000 });
}

function parsePricingSummary(text) {
  return {
    rate: captureNumber(text, /(?:note rate|interest rate|rate)\s*[:\s]+(\d{1,2}\.\d{2,3})\s*%?/i),
    apr: captureNumber(text, /apr\s*[:\s]+(\d{1,2}\.\d{2,3})\s*%?/i),
    points: captureNumber(text, /(?:points|pts)\s*[:\s-]+(-?\d{1,2}\.\d{1,3})/i),
    fees: captureMoney(text, /(?:fees|lender fees|origination)\s*[:\s$]+([\d,]+(?:\.\d{2})?)/i),
    payment: captureMoney(text, /(?:payment|monthly payment|p&i)\s*[:\s$]+([\d,]+(?:\.\d{2})?)/i),
    product: captureText(text, /(?:product|program)\s*[:\s]+(.{3,80})/i),
  };
}

function captureNumber(text, regex) {
  const match = text.match(regex);
  return match ? Number(match[1].replace(/,/g, "")) : "";
}

function captureMoney(text, regex) {
  const match = text.match(regex);
  return match ? Number(match[1].replace(/,/g, "")) : "";
}

function captureText(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

async function fillFirst(page, selectors, value, label) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    await locator.fill(value);
    return;
  }
  throw new Error(`Could not find ${label} field.`);
}

async function fillOptional(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    await locator.fill(value);
    return true;
  }
  return false;
}

async function clickFirst(page, selectors, label) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    await locator.click();
    return;
  }
  throw new Error(`Could not find ${label} button.`);
}

async function clickOptional(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    await locator.click();
    return true;
  }
  return false;
}
