const paymentForm = document.querySelector("#paymentForm");
const rateModal = document.querySelector("#rateModal");
const rateLeadForm = document.querySelector("#rateLeadForm");
const productInterest = document.querySelector("#productInterest");
const fixedTermsFieldset = document.querySelector("#fixedTermsFieldset");
const rateFormStatus = document.querySelector("#rateFormStatus");
const rateModalOpeners = document.querySelectorAll("[data-open-rate-modal]");
const rateModalClosers = document.querySelectorAll("[data-close-rate-modal]");

const elements = {
  homePrice: document.querySelector("#homePrice"),
  downPayment: document.querySelector("#downPayment"),
  interestRate: document.querySelector("#interestRate"),
  loanTerm: document.querySelector("#loanTerm"),
  taxes: document.querySelector("#taxes"),
  insurance: document.querySelector("#insurance"),
  monthlyPayment: document.querySelector("#monthlyPayment"),
  heroPayment: document.querySelector("#heroPayment"),
  principalInterest: document.querySelector("#principalInterest"),
  taxInsurance: document.querySelector("#taxInsurance"),
  mortgageInsurance: document.querySelector("#mortgageInsurance"),
  loanAmount: document.querySelector("#loanAmount"),
};

let lastFocusedElement = null;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function numberFromInput(input) {
  return Number(input.value) || 0;
}

function calculatePrincipalAndInterest(principal, annualRate, months) {
  const monthlyRate = annualRate / 100 / 12;

  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;

  return (
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1)
  );
}

function estimateMortgageInsurance(homePrice, downPayment, loanAmount) {
  if (homePrice <= 0 || loanAmount <= 0) return 0;

  const downPaymentPercent = downPayment / homePrice;
  if (downPaymentPercent >= 0.2) return 0;

  return (loanAmount * 0.006) / 12;
}

function updatePaymentEstimate() {
  if (!paymentForm) return;

  const homePrice = numberFromInput(elements.homePrice);
  const downPayment = Math.min(numberFromInput(elements.downPayment), homePrice);
  const loanAmount = Math.max(homePrice - downPayment, 0);
  const rate = numberFromInput(elements.interestRate);
  const termMonths = numberFromInput(elements.loanTerm);
  const monthlyTaxes = numberFromInput(elements.taxes) / 12;
  const monthlyInsurance = numberFromInput(elements.insurance) / 12;
  const principalInterest = calculatePrincipalAndInterest(loanAmount, rate, termMonths);
  const mortgageInsurance = estimateMortgageInsurance(homePrice, downPayment, loanAmount);
  const totalPayment = principalInterest + monthlyTaxes + monthlyInsurance + mortgageInsurance;

  elements.monthlyPayment.textContent = currency.format(totalPayment);
  elements.heroPayment.textContent = currency.format(totalPayment);
  elements.principalInterest.textContent = currency.format(principalInterest);
  elements.taxInsurance.textContent = currency.format(monthlyTaxes + monthlyInsurance);
  elements.mortgageInsurance.textContent = currency.format(mortgageInsurance);
  elements.loanAmount.textContent = currency.format(loanAmount);
}

function setRateFormStatus(message, isError = false) {
  if (!rateFormStatus) return;

  rateFormStatus.textContent = message;
  rateFormStatus.classList.toggle("error", isError);
}

function openRateModal() {
  if (!rateModal || !rateLeadForm) return;

  lastFocusedElement = document.activeElement;
  rateModal.hidden = false;
  document.body.classList.add("modal-open");
  setRateFormStatus("");
  rateLeadForm.querySelector("input[name='name']").focus();
}

function closeRateModal() {
  if (!rateModal) return;

  rateModal.hidden = true;
  document.body.classList.remove("modal-open");
  setRateFormStatus("");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function syncFixedTerms() {
  if (!productInterest || !fixedTermsFieldset) return;

  const shouldShowFixedTerms = productInterest.value === "Fixed" || productInterest.value === "Both";
  fixedTermsFieldset.hidden = !shouldShowFixedTerms;

  fixedTermsFieldset.querySelectorAll("input").forEach((input) => {
    input.disabled = !shouldShowFixedTerms;
  });
}

function fixedTermSelected() {
  if (!fixedTermsFieldset) return true;

  if (fixedTermsFieldset.hidden) return true;
  return Boolean(fixedTermsFieldset.querySelector("input:checked"));
}

async function submitRateLeadForm(event) {
  event.preventDefault();

  if (!fixedTermSelected()) {
    setRateFormStatus("Please choose at least one fixed term.", true);
    return;
  }

  const formData = new FormData(rateLeadForm);

  setRateFormStatus("Sending your request...");

  try {
    const response = await fetch(rateLeadForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Submission failed");
    }

    rateLeadForm.reset();
    syncFixedTerms();
    setRateFormStatus("Thank you. Your rate update request has been sent.");
  } catch (error) {
    setRateFormStatus(
      "Something went wrong while sending this request. Please email Srikanth directly at srikanth@barrettfinancial.com.",
      true,
    );
  }
}

if (paymentForm) {
  paymentForm.addEventListener("input", updatePaymentEstimate);
}

rateModalOpeners.forEach((button) => button.addEventListener("click", openRateModal));
rateModalClosers.forEach((button) => button.addEventListener("click", closeRateModal));

if (productInterest) {
  productInterest.addEventListener("change", syncFixedTerms);
}

if (rateLeadForm) {
  rateLeadForm.addEventListener("submit", submitRateLeadForm);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && rateModal && !rateModal.hidden) {
    closeRateModal();
  }
});

updatePaymentEstimate();
syncFixedTerms();
