import { normalizeHeader, normalizeText } from "./utils.js";

const LENDER_HEADER_PATTERNS = ["lender name"];
const LOGIN_URL_HEADER_PATTERNS = ["loginurl", "loginurl and overlays"];
const WEBSITE_HEADER_PATTERNS = ["wholesale website"];
const CREDENTIAL_HEADER_PATTERNS = ["login / pwd", "userid / pwd", "user id / pwd", "password"];

export function findLenderLogin(workbook, lenderName, preferredSheets = ["Conventional"]) {
  const target = normalizeText(lenderName);
  const candidates = [];

  const sheetNames = sortPreferredSheets(workbook.SheetNames, preferredSheets);

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = sheetToRows(sheet);
    if (!rows.length) continue;

    const headerIndex = rows.findIndex((row) =>
      row.some((cell) => normalizeHeader(cell).includes("lender name")),
    );
    if (headerIndex < 0) continue;

    const headers = rows[headerIndex].map(normalizeHeader);
    const lenderColumn = findHeaderIndex(headers, LENDER_HEADER_PATTERNS);
    const loginUrlColumns = findAllHeaderIndexes(headers, LOGIN_URL_HEADER_PATTERNS);
    const websiteColumns = findAllHeaderIndexes(headers, WEBSITE_HEADER_PATTERNS);
    const credentialColumns = findAllHeaderIndexes(headers, CREDENTIAL_HEADER_PATTERNS);

    if (lenderColumn < 0) continue;

    for (const row of rows.slice(headerIndex + 1)) {
      const rawName = row[lenderColumn];
      if (!rawName || !normalizeText(rawName).includes(target)) continue;

      const loginUrl = firstNonEmpty(row, loginUrlColumns) || firstNonEmpty(row, websiteColumns);
      const credentialText = firstNonEmpty(row, credentialColumns);
      const credentials = parseCredentialText(credentialText);

      candidates.push({
        sheetName,
        lenderName: String(rawName).trim(),
        loginUrl,
        username: credentials.username,
        password: credentials.password,
        hasCredentials: Boolean(credentials.username || credentials.password),
        credentialSource: credentialText ? "workbook" : "",
      });
    }
  }

  return chooseBestCandidate(candidates);
}

export function summarizeLenderCandidate(candidate) {
  if (!candidate) return null;
  return {
    sheetName: candidate.sheetName,
    lenderName: candidate.lenderName,
    loginUrl: candidate.loginUrl,
    hasUsername: Boolean(candidate.username),
    hasPassword: Boolean(candidate.password),
    credentialSource: candidate.credentialSource,
  };
}

function sheetToRows(sheet) {
  return XLSXUtils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
}

function findHeaderIndex(headers, patterns) {
  return headers.findIndex((header) => patterns.some((pattern) => header.includes(pattern)));
}

function findAllHeaderIndexes(headers, patterns) {
  return headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => patterns.some((pattern) => header.includes(pattern)))
    .map(({ index }) => index);
}

function firstNonEmpty(row, indexes) {
  for (const index of indexes) {
    const value = row[index];
    if (value) return String(value).trim();
  }
  return "";
}

function parseCredentialText(value) {
  const text = String(value || "").trim();
  if (!text) return { username: "", password: "" };

  const lines = text
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
  const joined = lines.join(" ");

  const username =
    capture(joined, /(?:user(?:name|id)?|login|email)\s*[:=-]\s*([^\s,|]+)/i) ||
    compactCredentialPart(text, 0) ||
    (lines.length >= 2 ? lines[0] : "");
  const password =
    capture(joined, /(?:pwd|pass(?:word)?)\s*[:=-]\s*([^\s,|]+)/i) ||
    compactCredentialPart(text, 1) ||
    (lines.length >= 2 ? lines[1] : "");

  return {
    username: cleanCredential(username),
    password: cleanCredential(password),
  };
}

function compactCredentialPart(text, index) {
  if (!text || /\s/.test(text.trim())) return "";
  const parts = text.split(/[/|,]/).map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[index] || "" : "";
}

function capture(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function cleanCredential(value) {
  return String(value || "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function chooseBestCandidate(candidates) {
  if (!candidates.length) return null;
  const withUrlAndCredentials = candidates.find(
    (candidate) => candidate.loginUrl && candidate.hasCredentials,
  );
  if (withUrlAndCredentials) return withUrlAndCredentials;
  const withUrl = candidates.find((candidate) => candidate.loginUrl);
  return withUrl || candidates[0];
}

function sortPreferredSheets(sheetNames, preferredSheets) {
  const preferred = preferredSheets
    .map((sheet) => sheetNames.find((name) => name.toLowerCase() === sheet.toLowerCase()))
    .filter(Boolean);
  const preferredSet = new Set(preferred);
  return [...preferred, ...sheetNames.filter((sheet) => !preferredSet.has(sheet))];
}

// Local alias keeps the import surface narrow for tests and avoids exporting XLSX directly.
import XLSX from "xlsx";
const XLSXUtils = XLSX.utils;
