import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9/ ]/g, "")
    .trim();
}

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number(String(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : "";
}

export function timestamp() {
  return new Date().toISOString();
}

export function redact(value) {
  if (!value) return "";
  return "[redacted]";
}

export async function promptToContinue(message) {
  const rl = readline.createInterface({ input, output });
  try {
    await rl.question(`${message}\nPress Enter to continue...`);
  } finally {
    rl.close();
  }
}

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}
