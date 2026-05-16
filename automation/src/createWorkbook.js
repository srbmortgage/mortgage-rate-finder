import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAutomationWorkbook, writeWorkbook } from "./workbooks.js";
import { parseArgs } from "./utils.js";

const args = parseArgs(process.argv.slice(2));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.resolve(__dirname, "../data/pricing-automation.xlsx");
const outPath = path.resolve(args.out || defaultPath);

const workbook = createAutomationWorkbook();
await writeWorkbook(outPath, workbook);
console.log(`Created automation workbook: ${outPath}`);
