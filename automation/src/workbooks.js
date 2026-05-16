import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";
import {
  OPTIONAL_SCENARIO_COLUMNS,
  REQUIRED_SCENARIO_COLUMNS,
  RESULT_COLUMNS,
  RUN_LOG_COLUMNS,
} from "./config.js";
import { timestamp } from "./utils.js";

export async function downloadWorkbook(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Workbook download failed with HTTP ${response.status}`);
  }
  const bytes = await response.arrayBuffer();
  return XLSX.read(Buffer.from(bytes), { type: "buffer", cellDates: true });
}

export function readWorkbook(filePath) {
  return XLSX.readFile(filePath, { cellDates: true });
}

export async function writeWorkbook(filePath, workbook) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  XLSX.writeFile(workbook, filePath);
}

export function rowsFromSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

export function replaceSheet(workbook, sheetName, rows, headers) {
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  workbook.Sheets[sheetName] = sheet;
  if (!workbook.SheetNames.includes(sheetName)) workbook.SheetNames.push(sheetName);
}

export function createAutomationWorkbook() {
  const workbook = XLSX.utils.book_new();
  const scenarioHeaders = [...REQUIRED_SCENARIO_COLUMNS, ...OPTIONAL_SCENARIO_COLUMNS];
  const scenarioRows = [
    {
      ScenarioId: "PURCHASE-001",
      LoanPurpose: "Purchase",
      State: "TX",
      PropertyValue: 425000,
      LoanAmount: 340000,
      CreditScore: 740,
      Occupancy: "Primary",
      PropertyType: "Single Family",
      Product: "30-year fixed",
      LockDays: 30,
      CurrentMortgageBalance: "",
      CashOutAmount: "",
      CLTV: 80,
      DTI: 42,
      EscrowWaiver: "No",
      Notes: "Sample purchase scenario",
      Active: "Yes",
    },
    {
      ScenarioId: "REFI-001",
      LoanPurpose: "Refinance",
      State: "TX",
      PropertyValue: 500000,
      LoanAmount: 360000,
      CreditScore: 760,
      Occupancy: "Primary",
      PropertyType: "Single Family",
      Product: "30-year fixed",
      LockDays: 30,
      CurrentMortgageBalance: 340000,
      CashOutAmount: 20000,
      CLTV: 72,
      DTI: 38,
      EscrowWaiver: "No",
      Notes: "Sample cash-out refinance scenario",
      Active: "Yes",
    },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(scenarioRows, { header: scenarioHeaders }),
    "PricingScenarios",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([], { header: RESULT_COLUMNS }),
    "PricingResults",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet([], { header: RUN_LOG_COLUMNS }),
    "RunLog",
  );
  return workbook;
}

export function getActiveScenarios(workbook) {
  const rows = rowsFromSheet(workbook, "PricingScenarios");
  const missingHeaders = REQUIRED_SCENARIO_COLUMNS.filter(
    (header) => !rows.length || !Object.prototype.hasOwnProperty.call(rows[0], header),
  );
  if (missingHeaders.length) {
    throw new Error(`PricingScenarios is missing columns: ${missingHeaders.join(", ")}`);
  }
  return rows
    .filter((row) => String(row.Active || "Yes").toLowerCase() !== "no")
    .map(normalizeScenario);
}

export function appendResult(workbook, result) {
  const rows = rowsFromSheet(workbook, "PricingResults");
  rows.push(normalizeOutputRow(result, RESULT_COLUMNS));
  replaceSheet(workbook, "PricingResults", rows, RESULT_COLUMNS);
}

export function appendRunLog(workbook, logRow) {
  const rows = rowsFromSheet(workbook, "RunLog");
  rows.push(
    normalizeOutputRow(
      {
        Timestamp: timestamp(),
        ...logRow,
      },
      RUN_LOG_COLUMNS,
    ),
  );
  replaceSheet(workbook, "RunLog", rows, RUN_LOG_COLUMNS);
}

function normalizeScenario(row) {
  return {
    ScenarioId: String(row.ScenarioId || "").trim(),
    LoanPurpose: String(row.LoanPurpose || "").trim(),
    State: String(row.State || "").trim().toUpperCase(),
    PropertyValue: row.PropertyValue,
    LoanAmount: row.LoanAmount,
    CreditScore: row.CreditScore,
    Occupancy: String(row.Occupancy || "").trim(),
    PropertyType: String(row.PropertyType || "").trim(),
    Product: String(row.Product || "").trim(),
    LockDays: row.LockDays,
    CurrentMortgageBalance: row.CurrentMortgageBalance,
    CashOutAmount: row.CashOutAmount,
    CLTV: row.CLTV,
    DTI: row.DTI,
    EscrowWaiver: row.EscrowWaiver,
    Notes: row.Notes,
  };
}

function normalizeOutputRow(row, headers) {
  return Object.fromEntries(headers.map((header) => [header, row[header] ?? ""]));
}
