from __future__ import annotations

import argparse
from pathlib import Path

from openpyxl import Workbook


SCENARIO_HEADERS = [
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
    "CurrentMortgageBalance",
    "CashOutAmount",
    "CLTV",
    "DTI",
    "EscrowWaiver",
    "Notes",
    "Active",
]

RESULT_HEADERS = [
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
]

RUN_LOG_HEADERS = ["Timestamp", "ScenarioId", "LenderName", "Step", "Status", "Message"]


def add_sheet(workbook: Workbook, title: str, headers: list[str], rows: list[list[object]] | None = None) -> None:
    sheet = workbook.create_sheet(title)
    sheet.append(headers)
    for row in rows or []:
        sheet.append(row)
    sheet.freeze_panes = "A2"
    for column in sheet.columns:
        max_len = max(len(str(cell.value or "")) for cell in column)
        sheet.column_dimensions[column[0].column_letter].width = min(max(max_len + 2, 12), 32)


def build_workbook(output_path: Path) -> None:
    workbook = Workbook()
    workbook.remove(workbook.active)

    add_sheet(
        workbook,
        "PricingScenarios",
        SCENARIO_HEADERS,
        [
            [
                "PURCHASE-001",
                "Purchase",
                "TX",
                425000,
                340000,
                740,
                "Primary",
                "Single Family",
                "30-year fixed",
                30,
                "",
                "",
                80,
                42,
                "No",
                "Sample purchase scenario",
                "Yes",
            ],
            [
                "REFI-001",
                "Refinance",
                "TX",
                500000,
                360000,
                760,
                "Primary",
                "Single Family",
                "30-year fixed",
                30,
                340000,
                20000,
                72,
                38,
                "No",
                "Sample cash-out refinance scenario",
                "Yes",
            ],
        ],
    )
    add_sheet(workbook, "PricingResults", RESULT_HEADERS)
    add_sheet(workbook, "RunLog", RUN_LOG_HEADERS)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    workbook.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a pricing automation workbook.")
    parser.add_argument("--out", default="data/pricing-automation.xlsx", help="Output workbook path.")
    args = parser.parse_args()
    output_path = Path(args.out).resolve()
    build_workbook(output_path)
    print(f"Created automation workbook: {output_path}")


if __name__ == "__main__":
    main()
