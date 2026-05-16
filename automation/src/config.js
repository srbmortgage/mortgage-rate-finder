export const DEFAULT_LENDER_WORKBOOK_URL =
  "https://docs.google.com/spreadsheets/d/1iGgdPOYfdsr4b_omUxZSjz9z0Wq8uZvo/export?format=xlsx";

export const REQUIRED_SCENARIO_COLUMNS = [
  "ScenarioId",
  "LoanPurpose",
  "State",
  "PropertyValue",
  "LoanAmount",
  "CreditScore",
  "Occupancy",
  "PropertyType",
  "Product",
  "LockDays",
];

export const OPTIONAL_SCENARIO_COLUMNS = [
  "CurrentMortgageBalance",
  "CashOutAmount",
  "CLTV",
  "DTI",
  "EscrowWaiver",
  "Notes",
  "Active",
];

export const RESULT_COLUMNS = [
  "ScenarioId",
  "LenderName",
  "Product",
  "Rate",
  "APR",
  "Points",
  "Fees",
  "Payment",
  "LockDays",
  "Timestamp",
  "Status",
  "RawSummary",
  "ErrorMessage",
];

export const RUN_LOG_COLUMNS = [
  "Timestamp",
  "ScenarioId",
  "LenderName",
  "Step",
  "Status",
  "Message",
];
