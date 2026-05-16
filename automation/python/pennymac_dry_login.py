from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from find_lender import DEFAULT_LENDER_WORKBOOK_URL, download, find_lender

ROOT = Path(__file__).resolve().parents[1]
PYTHON_DEPS = ROOT / ".python-deps"
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", str(ROOT / ".playwright-browsers"))
if str(PYTHON_DEPS) not in sys.path:
    sys.path.insert(0, str(PYTHON_DEPS))

from playwright.sync_api import Page, TimeoutError, sync_playwright


USERNAME_SELECTORS = [
    'input[name="username"]',
    'input[name="userName"]',
    'input[name="userid"]',
    'input[name="userId"]',
    'input[type="email"]',
    'input[autocomplete="username"]',
    'input[id*="user" i]',
    'input[placeholder*="user" i]',
    'input[placeholder*="email" i]',
]

PASSWORD_SELECTORS = [
    'input[name="password"]',
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[id*="pass" i]',
    'input[placeholder*="pass" i]',
]

SUBMIT_SELECTORS = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Log In")',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'text=Log In',
    'text=Login',
    'text=Sign In',
]

NEXT_SELECTORS = [
    'button:has-text("Next")',
    'button:has-text("Continue")',
    'button:has-text("Submit")',
    'input[type="submit"]',
    'button[type="submit"]',
    'text=Next',
    'text=Continue',
]


def fill_first(page: Page, selectors: list[str], value: str, label: str) -> None:
    for selector in selectors:
        locator = page.locator(selector).first
        try:
            if locator.count() and locator.is_visible(timeout=750):
                locator.fill(value)
                print(f"Filled {label}.")
                return
        except TimeoutError:
            continue
    raise RuntimeError(f"Could not find {label} field.")


def click_first(page: Page, selectors: list[str], label: str) -> None:
    for selector in selectors:
        locator = page.locator(selector).first
        try:
            if locator.count() and locator.is_visible(timeout=750):
                locator.click()
                print(f"Clicked {label}.")
                return
        except TimeoutError:
            continue
    raise RuntimeError(f"Could not find {label}.")


def try_fill_password(page: Page, password: str) -> bool:
    try:
        fill_first(page, PASSWORD_SELECTORS, password, "password")
        return True
    except RuntimeError:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Open Pennymac and perform a dry login.")
    parser.add_argument("--lender", default="Pennymac")
    parser.add_argument("--url", default=DEFAULT_LENDER_WORKBOOK_URL)
    parser.add_argument("--file", help="Use a local lender workbook instead of downloading.")
    parser.add_argument("--preferred-sheet", action="append", default=["Conventional"])
    parser.add_argument("--keep-open", action="store_true", help="Keep browser open after login click.")
    parser.add_argument("--no-submit", action="store_true", help="Fill credentials but do not click login.")
    parser.add_argument(
        "--diagnose-after-username",
        action="store_true",
        help="After username/next, print visible controls without credential values.",
    )
    args = parser.parse_args()

    workbook_path = Path(args.file).resolve() if args.file else download(args.url)
    lender = find_lender(workbook_path, args.lender, args.preferred_sheet)
    if not lender:
        raise SystemExit(f"No lender match found for {args.lender}")
    if not lender["username"] or not lender["password"]:
        raise SystemExit("Lender credentials were not found or could not be parsed.")

    print(
        f"Opening {lender['lenderName']} from {lender['sheetName']} at {lender['loginUrl']}. "
        "Credentials will not be printed."
    )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False, slow_mo=100)
        page = browser.new_page()
        page.goto(lender["loginUrl"], wait_until="domcontentloaded", timeout=60000)
        fill_first(page, USERNAME_SELECTORS, lender["username"], "username")
        if not try_fill_password(page, lender["password"]):
            click_first(page, NEXT_SELECTORS, "next/continue")
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            page.wait_for_timeout(2500)
            if args.diagnose_after_username:
                print_visible_controls(page)
                input("Press Enter to close the browser...")
                browser.close()
                return
            fill_first(page, PASSWORD_SELECTORS, lender["password"], "password")
        if args.no_submit:
            print("Stopped before clicking login because --no-submit was set.")
        else:
            click_first(page, SUBMIT_SELECTORS, "login")
            print("Login clicked. Complete MFA or portal checks manually if prompted.")

        input("Press Enter to close the browser..." if not args.keep_open else "Press Enter when done watching...")
        if not args.keep_open:
            browser.close()


def print_visible_controls(page: Page) -> None:
    controls = page.evaluate(
        """() => Array.from(document.querySelectorAll('input,button,a,select'))
          .filter((el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
          })
          .slice(0, 80)
          .map((el) => ({
            tag: el.tagName,
            type: el.getAttribute('type') || '',
            name: el.getAttribute('name') || '',
            id: el.id || '',
            placeholder: el.getAttribute('placeholder') || '',
            text: (el.innerText || el.value || '').trim().slice(0, 80),
            aria: el.getAttribute('aria-label') || ''
          }))"""
    )
    print(f"Current URL: {page.url}")
    print(f"Title: {page.title()}")
    for control in controls:
        print(control)


if __name__ == "__main__":
    main()
