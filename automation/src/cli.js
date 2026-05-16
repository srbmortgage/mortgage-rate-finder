import { chromium } from "playwright";
import { DEFAULT_LENDER_WORKBOOK_URL } from "./config.js";
import { login, priceScenario } from "./adapters/pennymac.js";
import { findLenderLogin, summarizeLenderCandidate } from "./lenders.js";
import {
  appendResult,
  appendRunLog,
  downloadWorkbook,
  getActiveScenarios,
  readWorkbook,
  writeWorkbook,
} from "./workbooks.js";
import { parseArgs, timestamp } from "./utils.js";

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));
const lenderName = args.lender || "Pennymac";
const lenderWorkbookUrl = process.env.LENDER_WORKBOOK_URL || DEFAULT_LENDER_WORKBOOK_URL;

if (!command) {
  fail("Missing command. Use find-lender, dry-login, or run.");
}

if (command === "find-lender") {
  await findLenderCommand();
} else if (command === "dry-login") {
  await browserCommand({ stopAfterLogin: true });
} else if (command === "run") {
  await browserCommand({ stopAfterLogin: false });
} else {
  fail(`Unknown command: ${command}`);
}

async function findLenderCommand() {
  const lenderWorkbook = await downloadWorkbook(lenderWorkbookUrl);
  const lender = findLenderLogin(lenderWorkbook, lenderName);
  if (!lender) fail(`No lender match found for ${lenderName}.`);
  console.log(JSON.stringify(summarizeLenderCandidate(lender), null, 2));
}

async function browserCommand({ stopAfterLogin }) {
  const workbookPath = args.workbook;
  if (!workbookPath) fail("Missing --workbook path.");

  const lenderWorkbook = await downloadWorkbook(lenderWorkbookUrl);
  const lender = findLenderLogin(lenderWorkbook, lenderName);
  if (!lender) fail(`No lender match found for ${lenderName}.`);

  console.log(
    `Using lender ${lender.lenderName} from ${lender.sheetName}; username=${Boolean(
      lender.username,
    )}; password=${Boolean(lender.password)}.`,
  );

  const automationWorkbook = readWorkbook(workbookPath);
  const scenarios = stopAfterLogin ? [] : getActiveScenarios(automationWorkbook);

  const browser = await chromium.launch({
    headless: false,
    slowMo: Number(args.slowMo || 100),
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const loginResult = await login(page, lender, { stopAfterLogin });
    appendRunLog(automationWorkbook, {
      ScenarioId: "",
      LenderName: lender.lenderName,
      Step: "Login",
      Status: loginResult.status,
      Message: loginResult.message,
    });

    if (stopAfterLogin) {
      await writeWorkbook(workbookPath, automationWorkbook);
      console.log("Dry login completed. Workbook run log updated.");
      return;
    }

    for (const scenario of scenarios) {
      await runScenario(page, automationWorkbook, workbookPath, scenario);
    }

    console.log(`Completed ${scenarios.length} active scenario(s).`);
  } finally {
    if (!args.keepOpen) await browser.close();
  }
}

async function runScenario(page, automationWorkbook, workbookPath, scenario) {
  appendRunLog(automationWorkbook, {
    ScenarioId: scenario.ScenarioId,
    LenderName: lenderName,
    Step: "ScenarioStart",
    Status: "Started",
    Message: `Started scenario at ${timestamp()}`,
  });

  try {
    const result = await priceScenario(page, scenario);
    appendResult(automationWorkbook, result);
    appendRunLog(automationWorkbook, {
      ScenarioId: scenario.ScenarioId,
      LenderName: lenderName,
      Step: "Pricing",
      Status: result.Status,
      Message: result.ErrorMessage || "Scenario priced.",
    });
  } catch (error) {
    appendResult(automationWorkbook, {
      ScenarioId: scenario.ScenarioId,
      LenderName: lenderName,
      Product: scenario.Product,
      Rate: "",
      APR: "",
      Points: "",
      Fees: "",
      Payment: "",
      LockDays: scenario.LockDays,
      Timestamp: timestamp(),
      Status: "Error",
      RawSummary: "",
      ErrorMessage: error.message,
    });
    appendRunLog(automationWorkbook, {
      ScenarioId: scenario.ScenarioId,
      LenderName: lenderName,
      Step: "Pricing",
      Status: "Error",
      Message: error.message,
    });
  } finally {
    await writeWorkbook(workbookPath, automationWorkbook);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
