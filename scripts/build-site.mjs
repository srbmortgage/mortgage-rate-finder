import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../site.config.mjs";
import { homePage, servicePages, statePages } from "../site.pages.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const allPages = [
  { ...homePage, type: "home" },
  ...statePages.map((page) => ({ ...page, type: "state" })),
  ...servicePages.map((page) => ({ ...page, type: "service" })),
];

const stateLinks = statePages.map((page) => ({
  href: `/${page.slug}/`,
  label: `${page.stateName} Mortgage Loan Officer`,
}));

const serviceLinks = servicePages.map((page) => ({
  href: `/${page.slug}/`,
  label: page.title,
}));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteUrl(path) {
  const cleaned = path === "/" ? "" : path.replace(/\/$/, "");
  return `${siteConfig.baseUrl}${cleaned || "/"}`;
}

function pagePath(page) {
  return page.slug ? `/${page.slug}/` : "/";
}

function wordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function paragraphs(items) {
  return items.map((text) => `<p>${escapeHtml(text)}</p>`).join("\n");
}

function linkList(links) {
  return links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("\n");
}

function sharedFaq(page) {
  if (page.type === "state") {
    return [
      {
        q: `Can Srikanth help with mortgages in ${page.stateName}?`,
        a: `Yes. Srikanth Reddy Bollampalli is licensed to help borrowers in ${page.stateName} with purchase loans, refinance options, HELOCs, FHA, conventional, VA, jumbo, and first-time buyer financing, subject to program and underwriting guidelines.`,
      },
      {
        q: `What loan programs are common for ${page.stateName} home buyers?`,
        a: `${page.stateName} borrowers often compare conventional, FHA, VA, jumbo, and home equity options. The right fit depends on credit, income, assets, property type, occupancy, loan amount, and long-term goals.`,
      },
      {
        q: `Is a rate estimate the same as a loan approval?`,
        a: `No. A rate estimate, calculator result, or rate update is not an approval, commitment to lend, rate quote, or rate lock. Final terms depend on verified application details and underwriting.`,
      },
      {
        q: `How do I start a mortgage conversation in ${page.stateName}?`,
        a: `You can apply through the Apply Now button or use the Get Rate Alert button to share basic details for periodic email updates and follow-up from Srikanth.`,
      },
    ];
  }

  if (page.type === "service") {
    return [
      {
        q: `Who should consider ${page.serviceName}s?`,
        a: `${page.serviceName}s may fit ${page.audience}. The best option depends on credit profile, property type, occupancy, income, assets, and the purpose of the financing.`,
      },
      {
        q: `Can this loan type be used in multiple states?`,
        a: `Srikanth is licensed in GA, FL, TN, NC, SC, MD, and TX and can help borrowers compare this option across those licensed states, subject to investor and program availability.`,
      },
      {
        q: `What information is needed to review options?`,
        a: `Borrowers typically discuss loan amount, property location, credit profile, income, assets, occupancy, and timeline. A complete application may require additional documents and disclosures.`,
      },
      {
        q: `Does this page guarantee a rate or approval?`,
        a: `No. This page is educational only. Rates, eligibility, and approval depend on verified application information, market conditions, collateral, and underwriting guidelines.`,
      },
    ];
  }

  return [
    {
      q: "Which states does Srikanth serve as a mortgage loan officer?",
      a: "Srikanth Reddy Bollampalli is licensed in Georgia, Florida, Tennessee, North Carolina, South Carolina, Maryland, and Texas.",
    },
    {
      q: "What loan types can borrowers discuss?",
      a: "Borrowers can discuss purchase loans, refinance mortgages, HELOCs, FHA, conventional, VA, jumbo, investment property loans, and first-time home buyer programs.",
    },
    {
      q: "Is the payment calculator an official loan estimate?",
      a: "No. The calculator is for planning only and does not replace a Loan Estimate, approval, commitment to lend, rate quote, or rate lock.",
    },
    {
      q: "How can I get rate updates?",
      a: "Use the Get Rate Alert button to open the rate update form and request periodic email updates from Srikanth.",
    },
  ];
}

function stateContent(page) {
  const services = ["home purchase loans", "mortgage refinance", "HELOCs", "FHA loans", "conventional loans", "VA loans", "jumbo loans", "investment property loans"];
  return `
    <section class="seo-section">
      <h2>${escapeHtml(page.primaryKeyword)} guidance for local borrowers</h2>
      ${paragraphs([
        `${siteConfig.shortName} helps ${page.stateName} borrowers understand mortgage options before they make a major financing decision. Whether you are buying a primary residence, refinancing an existing mortgage, using home equity, or comparing first-time home buyer loans, the conversation should start with your goals, timeline, property location, credit profile, income, assets, and comfort with monthly payment. ${page.marketNote}`,
        `A ${page.primaryKeyword} should do more than quote a payment. The useful work is explaining what the numbers mean, which program guidelines matter, and how each choice affects cash to close, mortgage insurance, documentation, and long-term flexibility. Srikanth works with borrowers across ${page.stateName} and is also licensed in GA, FL, TN, NC, SC, MD, and TX, which helps when a family is relocating or comparing homes across state lines.`,
        `For ${page.secondaryKeywords[0]}, buyers may compare low down payment options, conventional loans, FHA loans, VA loans for eligible borrowers, and jumbo financing for higher-priced homes. Down payment, reserves, property type, and occupancy all affect the right path. A clear preapproval discussion helps borrowers understand what they may be comfortable offering before they sign a contract.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>${escapeHtml(page.secondaryKeywords[1])} and home equity options</h2>
      ${paragraphs([
        `Homeowners considering ${page.secondaryKeywords[1]} should review more than the advertised rate. A refinance may be used to change the loan term, evaluate cash-out goals, consolidate debts, remove or adjust mortgage insurance, or compare a fixed-rate structure with other options. The useful question is whether the refinance supports a clear financial goal after costs, timing, and break-even considerations are reviewed.`,
        `A HELOC or home equity loan may be appropriate when the borrower wants to keep an existing first mortgage and access equity for renovations, reserves, education expenses, or other planned needs. Home equity products can have different draw periods, repayment terms, variable-rate features, and combined loan-to-value limits, so they should be reviewed carefully alongside cash-out refinance options.`,
        `Borrowers in ${page.localKeywords.join(", ")}, and other ${page.stateName} communities often need practical guidance on property taxes, insurance, appraisal expectations, and closing timelines. The details vary by property and loan program, but a structured conversation can keep the process understandable from the first estimate through underwriting.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>Loan programs available in ${escapeHtml(page.stateName)}</h2>
      ${paragraphs([
        `Common programs include ${services.join(", ")}. Conventional loans may work well for borrowers with established credit and flexible down payment options. FHA loans may help borrowers who need more flexible credit or down payment guidelines. VA loans can be powerful for eligible veterans, service members, and surviving spouses. Jumbo loans can support higher loan amounts when the property price exceeds conforming limits.`,
        `Investment property loans require a different review than primary residence financing because occupancy, reserves, rental income, and property cash flow may matter. First-time home buyer programs also deserve careful explanation because assistance, gift funds, mortgage insurance, and seller credits can affect affordability and approval. Srikanth can help borrowers compare these choices without turning the conversation into jargon.`,
        `No web page can determine final eligibility. The next step is to apply or request a rate alert so Srikanth can understand the scenario and explain available options. All loans remain subject to credit approval, verification, appraisal, acceptable title, investor requirements, and program guidelines.`,
      ])}
    </section>
  `;
}

function serviceContent(page) {
  return `
    <section class="seo-section">
      <h2>${escapeHtml(page.primaryKeyword)} guidance from a licensed mortgage loan officer</h2>
      ${paragraphs([
        `${page.title} can be an important part of a borrower plan, but the right answer depends on the full picture. Srikanth helps ${page.audience} compare program options across GA, FL, TN, NC, SC, MD, and TX. The review starts with purpose, property state, loan amount, FICO score, income, assets, occupancy, timeline, and comfort with payment.`,
        `A strong mortgage conversation connects the loan program to the borrower's real goal. For ${page.primaryKeyword}, that may include ${page.benefits.join(", ")}. Instead of focusing only on one advertised rate, borrowers should understand estimated payment, closing costs, cash to close, rate structure, documentation, and how the loan may perform over time.`,
        `Srikanth is a mortgage loan originator with Barrett Financial Group and is licensed in Georgia, Florida, Tennessee, North Carolina, South Carolina, Maryland, and Texas. That multi-state coverage can help borrowers who are relocating, buying an investment property, or comparing opportunities in more than one market.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>How ${escapeHtml(page.secondaryKeywords[0])} options are reviewed</h2>
      ${paragraphs([
        `Borrowers should expect a clear review of credit, income, assets, liabilities, property type, occupancy, and loan-to-value. For ${page.secondaryKeywords[0]}, those details can influence pricing, documentation, reserves, mortgage insurance, and the investor guidelines that apply. A careful review early in the process can prevent surprises later.`,
        `Program choices may include ${page.loanTypes.join(", ")} depending on the scenario. Each option has tradeoffs. A lower down payment may preserve cash but can involve mortgage insurance or different pricing. A shorter term may reduce total interest but increase monthly payment. A larger loan amount may require more reserves or different documentation.`,
        `The goal is not to push every borrower into the same product. The goal is to make the decision understandable. Srikanth can help compare payment, cash to close, rate structure, equity use, and closing timeline so borrowers can choose a direction with better context.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>${escapeHtml(page.secondaryKeywords[1])} questions to ask before moving forward</h2>
      ${paragraphs([
        `Before selecting a loan path, borrowers should ask what documentation will be needed, how long the process may take, whether the property type creates any special requirements, and how changes in rate or loan amount could affect approval. These questions are especially important for first-time buyers, self-employed borrowers, investment property buyers, and homeowners comparing refinance or equity options.`,
        `A payment calculator can help with early planning, but it is not a Loan Estimate or a rate lock. Taxes, insurance, HOA dues, mortgage insurance, discount points, lender credits, and prepaid items can all change the final picture. That is why a personalized review matters before making a purchase offer, refinancing, or drawing on home equity.`,
        `Use the Apply Now button when you are ready to begin a full application. Use Get Rate Alert if you want periodic email updates and a lighter touch conversation first. Final terms are subject to credit approval, verification, appraisal, acceptable title, and program guidelines.`,
      ])}
    </section>
  `;
}

function homeContent() {
  return `
    <section class="seo-section">
      <h2>Mortgage loan officer for purchase, refinance, and HELOC planning</h2>
      ${paragraphs([
        `${siteConfig.shortName} helps borrowers compare mortgage options across Georgia, Florida, Tennessee, North Carolina, South Carolina, Maryland, and Texas. The site is built for people who want practical guidance on home purchase loans, refinance mortgages, HELOCs, FHA loans, conventional loans, VA loans, jumbo loans, investment property loans, and first-time home buyer programs.`,
        `A mortgage decision should be understandable before it becomes urgent. Buyers may need a preapproval conversation before making an offer. Homeowners may want to know whether a refinance still makes sense after closing costs. Others may want to understand a HELOC, home equity loan, or cash-out refinance before starting a renovation or debt planning conversation.`,
        `The best starting point is a clear review of goals, loan amount, FICO score, property ZIP code, current mortgage balance when applicable, and preferred loan type. Srikanth can explain options without treating the borrower like a spreadsheet. The goal is to understand the numbers, the guidelines, and the next step.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>Loan options for GA, FL, TN, NC, SC, MD, and TX borrowers</h2>
      ${paragraphs([
        `Conventional loans can be useful for borrowers with established credit, flexible down payment options, and a desire to compare mortgage insurance structures. FHA loans may help borrowers who need more flexible credit or down payment guidelines. VA loans can be especially valuable for eligible veterans, service members, and surviving spouses. Jumbo loans may be needed when the loan amount exceeds conforming limits.`,
        `Refinance loans can be used to review rate, term, cash-out, mortgage insurance, or long-term payment goals. HELOCs and home equity loans may help homeowners access equity while keeping an existing first mortgage in place. Investment property loans require careful review of occupancy, reserves, rental income, and long-term cash flow assumptions.`,
        `Because Srikanth is licensed across seven states, borrowers can compare local market details while keeping one consistent mortgage contact. That is helpful for relocations, investment purchases, and families deciding between multiple markets.`,
      ])}
    </section>

    <section class="seo-section">
      <h2>Start with an application or request mortgage rate alerts</h2>
      ${paragraphs([
        `Borrowers who are ready for a complete review can use Apply Now to begin the application path. Borrowers who are still watching the market can use Get Rate Alert to share basic details and request periodic email updates. Neither path is a guarantee of approval, a commitment to lend, a rate quote, or a rate lock.`,
        `Helpful preparation includes reviewing income documents, asset statements, current mortgage information, purchase timeline, target payment, property state, and ZIP code. The more complete the information, the easier it is to compare programs and avoid vague estimates.`,
        `All mortgage options are subject to credit approval, verification, appraisal, acceptable title, investor requirements, and program guidelines. This site is educational and designed to help borrowers ask better questions before making a major home financing decision.`,
      ])}
    </section>
  `;
}

function pageContent(page) {
  if (page.type === "state") return stateContent(page);
  if (page.type === "service") return serviceContent(page);
  return homeContent();
}

function ctaBlock() {
  return `
    <div class="seo-cta-row">
      <a class="primary-button" href="${siteConfig.applyUrl}">Apply Now</a>
      <button class="secondary-button" type="button" data-open-rate-modal>Get Rate Alert</button>
    </div>
  `;
}

function breadcrumbs(page) {
  const items = [{ href: "/", label: "Home" }];
  if (page.slug) items.push({ href: `/${page.slug}/`, label: page.title });
  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      ${items.map((item, index) => (
        index === items.length - 1
          ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
          : `<a href="${item.href}">${escapeHtml(item.label)}</a><span aria-hidden="true">/</span>`
      )).join("")}
    </nav>
  `;
}

function relatedLinks(page) {
  const stateSubset = page.type === "state"
    ? stateLinks.filter((link) => !link.href.includes(page.slug))
    : stateLinks;
  const serviceSubset = page.type === "service"
    ? serviceLinks.filter((link) => !link.href.includes(page.slug)).slice(0, 4)
    : serviceLinks.slice(0, 4);

  return `
    <section class="related-section" aria-labelledby="related-title">
      <h2 id="related-title">Related mortgage resources</h2>
      <div class="related-grid">
        <div>
          <h3>Licensed states</h3>
          <ul>${linkList(stateSubset)}</ul>
        </div>
        <div>
          <h3>Loan programs</h3>
          <ul>${linkList(serviceSubset)}</ul>
        </div>
      </div>
    </section>
  `;
}

function faqSection(page) {
  const faq = sharedFaq(page);
  return `
    <section id="faq" class="faq-section" aria-labelledby="faq-title">
      <div class="section-intro">
        <p class="eyebrow">Borrower questions</p>
        <h2 id="faq-title">Mortgage FAQs</h2>
      </div>
      <div class="faq-list">
        ${faq.map((item) => `
          <details>
            <summary>${escapeHtml(item.q)}</summary>
            <p>${escapeHtml(item.a)}</p>
          </details>
        `).join("")}
      </div>
    </section>
  `;
}

function calculatorSection() {
  return `
    <section id="calculator" class="tool-section" aria-labelledby="calculator-title">
      <div class="section-intro">
        <p class="eyebrow">Payment planning</p>
        <h2 id="calculator-title">Estimate a monthly mortgage payment</h2>
        <p>Use this planning calculator to understand principal, interest, taxes, insurance, and possible mortgage insurance before you request a personalized Loan Estimate.</p>
      </div>
      <div class="calculator-layout">
        <form class="calculator-form" id="paymentForm">
          <label>Home price <input id="homePrice" type="number" min="50000" step="5000" value="425000" /></label>
          <label>Down payment <input id="downPayment" type="number" min="0" step="1000" value="85000" /></label>
          <label>Interest rate <input id="interestRate" type="number" min="0" step="0.125" value="6.625" /></label>
          <label>Loan term
            <select id="loanTerm">
              <option value="360" selected>30 years</option>
              <option value="240">20 years</option>
              <option value="180">15 years</option>
            </select>
          </label>
          <label>Annual property taxes <input id="taxes" type="number" min="0" step="250" value="5100" /></label>
          <label>Annual homeowners insurance <input id="insurance" type="number" min="0" step="100" value="1800" /></label>
        </form>
        <aside class="payment-summary" aria-live="polite">
          <span>Estimated monthly payment</span>
          <strong id="monthlyPayment">$0</strong>
          <dl>
            <div><dt>Principal &amp; interest</dt><dd id="principalInterest">$0</dd></div>
            <div><dt>Taxes &amp; insurance</dt><dd id="taxInsurance">$0</dd></div>
            <div><dt>Estimated mortgage insurance</dt><dd id="mortgageInsurance">$0</dd></div>
            <div><dt>Estimated loan amount</dt><dd id="loanAmount">$0</dd></div>
          </dl>
          <p>Calculator results are estimates and exclude items such as HOA dues, flood insurance, discount points, lender credits, and closing costs.</p>
        </aside>
      </div>
    </section>
  `;
}

function header(pageType = "default") {
  const nav = pageType === "home"
    ? [
        { href: "#calculator", label: "Calculator" },
        { href: "#options", label: "Loan options" },
        { href: "#timeline", label: "Process" },
        { href: "#faq", label: "FAQ" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/home-purchase-loans/", label: "Purchase" },
        { href: "/mortgage-refinance/", label: "Refinance" },
        { href: "/heloc-loans/", label: "HELOC" },
        { href: "/fha-loans/", label: "FHA" },
      ];

  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="${escapeHtml(siteConfig.shortName)} mortgage home">
        <span class="brand-mark" aria-hidden="true">SRB</span>
        <span><strong>${escapeHtml(siteConfig.brandName)}</strong><small>MLO NMLS #${siteConfig.nmls.mlo}</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary navigation">
        ${nav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
      </nav>
      <div class="header-contact" aria-label="Srikanth contact details">
        <a href="tel:${siteConfig.phonePrimaryHref}">${siteConfig.phonePrimary}</a>
        <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>
      </div>
      <button class="header-rate-button" type="button" data-open-rate-modal>Get Rate Alert</button>
      <a class="header-action" href="${siteConfig.applyUrl}">Apply now</a>
    </header>
  `;
}

function homeHero() {
  return `
    <section class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(siteConfig.brokerage)} | NMLS #${siteConfig.nmls.brokerage}</p>
        <h1>Clear home financing steps with Srikanth.</h1>
        <p class="hero-text">Estimate payments, compare common loan paths, see what lenders typically ask for, and connect with a licensed mortgage loan originator when you are ready for a personalized quote.</p>
        <div class="hero-actions">
          <a class="primary-button" href="${siteConfig.applyUrl}">Apply now</a>
          <a class="secondary-button" href="#calculator">Estimate payment</a>
          <button class="secondary-button" type="button" data-open-rate-modal>Get Rate Alert</button>
        </div>
        <div class="trust-row" aria-label="Borrower protections">
          <span>Licensed in GA, FL, TN, NC, SC, MD, and TX</span>
          <span>No obligation</span>
          <span>Equal housing opportunity</span>
        </div>
      </div>

      <div class="hero-visual" aria-label="Borrower mortgage planning dashboard preview">
        <div class="visual-panel visual-panel-main">
          <span>Estimated monthly payment</span>
          <strong id="heroPayment">$2,752</strong>
          <div class="payment-bars" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="visual-panel visual-panel-rate">
          <span>Loan readiness</span>
          <strong>Checklist</strong>
          <ul><li>Income</li><li>Assets</li><li>Credit</li></ul>
        </div>
        <div class="visual-panel visual-panel-home">
          <span aria-hidden="true" class="home-icon"></span>
          <strong>Plan before you offer</strong>
        </div>
      </div>
    </section>
  `;
}

function loanOptionsSection() {
  const cards = [
    ["Conventional", "Often used by borrowers with established credit, flexible down payments, and strong documentation."],
    ["FHA", "May fit borrowers who need more flexible credit or down payment guidelines, subject to FHA rules."],
    ["VA", "Available to eligible service members, veterans, and surviving spouses with VA entitlement."],
    ["Refinance", "Used to evaluate rate, term, cash-out, debt consolidation, or other financial goals."],
    ["HELOC", "A revolving home equity line that may help with renovations or flexible borrowing needs."],
    ["Jumbo", "Used for higher-value homes when loan amounts exceed conforming loan limits."],
  ];
  return `
    <section id="options" class="content-section" aria-labelledby="options-title">
      <div class="section-intro">
        <p class="eyebrow">Loan paths</p>
        <h2 id="options-title">Common mortgage options borrowers ask about</h2>
      </div>
      <div class="option-grid">
        ${cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function checklistSection() {
  const items = [
    "Government-issued ID",
    "Recent pay stubs",
    "W-2s or 1099s",
    "Two months of bank statements",
    "Purchase contract, if available",
    "Homeowners insurance contact",
    "Current mortgage statement",
    "Asset or gift documentation",
  ];
  return `
    <section id="checklist" class="checklist-section" aria-labelledby="checklist-title">
      <div class="section-intro">
        <p class="eyebrow">Get ready</p>
        <h2 id="checklist-title">Documents lenders commonly request</h2>
      </div>
      <div class="checklist-grid">
        ${items.map((item) => `<label><input type="checkbox" /> ${item}</label>`).join("")}
      </div>
    </section>
  `;
}

function timelineSection() {
  const steps = [
    ["Conversation", "Discuss goals, budget, timeline, property type, and the loan options that may fit."],
    ["Application", "Submit secure information so credit, income, assets, and eligibility can be reviewed."],
    ["Disclosures", "Review required disclosures, including a Loan Estimate when a complete application is received."],
    ["Processing and underwriting", "Documentation, appraisal, title, insurance, and conditions are reviewed before final approval."],
    ["Closing", "Review final terms, sign closing documents, and complete funding according to program rules."],
  ];
  return `
    <section id="timeline" class="content-section" aria-labelledby="timeline-title">
      <div class="section-intro">
        <p class="eyebrow">What happens next</p>
        <h2 id="timeline-title">A simpler view of the mortgage process</h2>
      </div>
      <ol class="timeline-list">
        ${steps.map(([title, text], index) => `
          <li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${title}</h3><p>${text}</p></div></li>
        `).join("")}
      </ol>
    </section>
  `;
}

function hero(page) {
  const support = page.type === "home"
    ? "Mortgage guidance for purchase, refinance, HELOC, FHA, conventional, VA, jumbo, and first-time buyer loans across GA, FL, TN, NC, SC, MD, and TX."
    : `Helpful mortgage guidance for ${page.primaryKeyword}, including ${page.secondaryKeywords.join(", ")}.`;
  return `
    <section class="seo-hero">
      <div>
        ${breadcrumbs(page)}
        <p class="eyebrow">${escapeHtml(siteConfig.brokerage)} | NMLS #${siteConfig.nmls.brokerage}</p>
        <h1>${escapeHtml(page.h1)}</h1>
        <p class="hero-text">${escapeHtml(support)}</p>
        ${ctaBlock()}
        <div class="trust-row" aria-label="Borrower protections">
          <span>Licensed in GA, FL, TN, NC, SC, MD, and TX</span>
          <span>No obligation</span>
          <span>Equal housing opportunity</span>
        </div>
      </div>
      <figure class="seo-hero-media">
        <img src="${siteConfig.socialImage}" alt="Mortgage planning dashboard for purchase and refinance borrowers" />
      </figure>
    </section>
  `;
}

function rateModal() {
  return `
    <div class="rate-modal" id="rateModal" role="dialog" aria-modal="true" aria-labelledby="rateModalTitle" hidden>
      <div class="rate-modal-backdrop" data-close-rate-modal></div>
      <div class="rate-modal-panel">
        <div class="rate-modal-header">
          <div>
            <p class="eyebrow">Periodic rate updates</p>
            <h2 id="rateModalTitle">Stay posted on mortgage rate opportunities</h2>
          </div>
          <button class="modal-close-button" type="button" aria-label="Close rate updates form" data-close-rate-modal>&times;</button>
        </div>
        <form class="rate-lead-form" id="rateLeadForm" action="${siteConfig.rateAlert.action}" method="POST">
          <input type="hidden" name="_subject" value="${siteConfig.rateAlert.subject}" />
          <input type="hidden" name="form_name" value="${siteConfig.rateAlert.subject}" />
          <div class="lead-form-grid">
            <label>Name <input name="name" type="text" autocomplete="name" required /></label>
            <label>Purchase price <input name="purchase_price" type="number" min="0" step="1000" required /></label>
            <label>FICO score <input name="fico_score" type="number" min="300" max="850" step="1" required /></label>
            <label>Current loan balance <input name="current_loan_balance" type="number" min="0" step="1000" /></label>
            <label>Contact number <input name="contact_number" type="tel" autocomplete="tel" required /></label>
            <label>Email address <input name="email" type="email" autocomplete="email" required /></label>
            <label>Loan purpose
              <select name="loan_purpose" required>
                <option value="Purchase">Purchase</option>
                <option value="Refinance">Refinance</option>
              </select>
            </label>
            <label>ZIP code <input name="zip_code" type="text" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" required /></label>
            <label class="full-field">Product interest
              <select name="product_interest" id="productInterest" required>
                <option value="Fixed">Fixed</option>
                <option value="ARM">ARM</option>
                <option value="Both">Both</option>
              </select>
            </label>
          </div>
          <fieldset class="term-fieldset" id="fixedTermsFieldset">
            <legend>Fixed terms</legend>
            <label><input type="checkbox" name="fixed_terms" value="30-year" checked /> 30-year</label>
            <label><input type="checkbox" name="fixed_terms" value="20-year" /> 20-year</label>
            <label><input type="checkbox" name="fixed_terms" value="15-year" /> 15-year</label>
            <label><input type="checkbox" name="fixed_terms" value="10-year" /> 10-year</label>
          </fieldset>
          <p class="modal-disclosure">This is not a loan application, approval, commitment to lend, rate quote, or rate lock. By submitting, you agree to receive periodic email rate updates from Srikanth.</p>
          <div class="modal-actions">
            <button class="primary-button" type="submit">Submit rate update request</button>
            <button class="secondary-button" type="button" data-close-rate-modal>Cancel</button>
          </div>
          <p class="form-status" id="rateFormStatus" role="status"></p>
        </form>
      </div>
    </div>
  `;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <strong>${escapeHtml(siteConfig.shortName)}</strong>
        <p>Mortgage Loan Originator. MLO NMLS #${siteConfig.nmls.mlo}. ${siteConfig.brokerage} NMLS #${siteConfig.nmls.brokerage}. Licensed in GA, FL, TN, NC, SC, MD, and TX.</p>
      </div>
      <div class="footer-contact">
        <strong>Contact</strong>
        <a href="${siteConfig.profileUrl}">barrettfinancial.com/srikanth</a>
        <a href="tel:${siteConfig.phonePrimaryHref}">${siteConfig.phonePrimary}</a>
        <a href="tel:${siteConfig.phoneSecondaryHref}">${siteConfig.phoneSecondary}</a>
        <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>
      </div>
      <div class="footer-eho">
        <svg viewBox="0 0 64 64" role="img" aria-label="Equal Housing Opportunity logo">
          <path d="M8 30 32 10l24 20" />
          <path d="M14 29v25h36V29" />
          <path d="M22 36h20" />
          <path d="M22 44h20" />
        </svg>
        <strong>Equal Housing Opportunity</strong>
      </div>
      <p class="footer-disclaimer">This is not a commitment to lend. All loans are subject to credit approval, verification, appraisal, acceptable title, and program guidelines.</p>
    </footer>
  `;
}

function jsonLd(page, faq) {
  const url = absoluteUrl(pagePath(page));
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteConfig.baseUrl}/#website` },
      primaryImageOfPage: `${siteConfig.baseUrl}${siteConfig.socialImage}`,
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteConfig.baseUrl}/#business`,
      name: siteConfig.name,
      legalName: `${siteConfig.shortName} - ${siteConfig.brokerage}`,
      alternateName: siteConfig.shortName,
      url: siteConfig.profileUrl,
      telephone: siteConfig.phonePrimary,
      email: siteConfig.email,
      image: `${siteConfig.baseUrl}${siteConfig.socialImage}`,
      priceRange: "$$",
      areaServed: siteConfig.states.map((state) => ({ "@type": "AdministrativeArea", name: state.name })),
      memberOf: {
        "@type": "Organization",
        name: siteConfig.brokerage,
        identifier: `NMLS ${siteConfig.nmls.brokerage}`,
      },
      identifier: `MLO NMLS ${siteConfig.nmls.mlo}`,
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: page.type === "home" ? "Mortgage loan officer services" : page.h1,
      serviceType: page.primaryKeyword,
      provider: { "@id": `${siteConfig.baseUrl}/#business` },
      areaServed: siteConfig.states.map((state) => state.name),
      broker: { "@id": `${siteConfig.baseUrl}/#business` },
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  if (page.type === "service" || page.type === "home") {
    graph.push({
      "@type": "MortgageLoan",
      "@id": `${url}#mortgage-loan`,
      name: page.type === "home" ? "Mortgage loan options" : page.title,
      provider: { "@id": `${siteConfig.baseUrl}/#business` },
      description: page.description,
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function head(page, faq) {
  const url = absoluteUrl(pagePath(page));
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${siteConfig.baseUrl}${siteConfig.socialImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="stylesheet" href="/styles.css?v=9" />
    <script type="application/ld+json">${jsonLd(page, faq)}</script>
  `;
}

function renderPage(page) {
  const faq = sharedFaq(page);
  if (page.type === "home") {
    const main = `
      ${homeHero()}
      <section class="notice-band" aria-label="Important mortgage disclosure">
        <strong>Important:</strong>
        <span>This website provides general education and sample estimates only. It is not a loan approval, commitment to lend, lock agreement, or advertisement of currently available rates.</span>
      </section>
      <main>
        ${calculatorSection()}
        ${loanOptionsSection()}
        ${checklistSection()}
        ${timelineSection()}
        <section class="seo-home-section" aria-labelledby="home-seo-title">
          <div class="section-intro">
            <p class="eyebrow">Mortgage resources</p>
            <h2 id="home-seo-title">Mortgage loan officer guidance across licensed states</h2>
          </div>
          ${homeContent()}
        </section>
        ${relatedLinks(page)}
        ${faqSection(page)}
      </main>
    `;

    return `<!doctype html>
<html lang="en">
  <head>${head(page, faq)}</head>
  <body>
    ${header(page.type)}
    ${main}
    ${rateModal()}
    ${footer()}
    <script src="/app.js"></script>
  </body>
</html>
`;
  }

  const main = `
    ${hero(page)}
    <section class="notice-band" aria-label="Important mortgage disclosure">
      <strong>Important:</strong>
      <span>This website provides general education and sample estimates only. It is not a loan approval, commitment to lend, lock agreement, or advertisement of currently available rates.</span>
    </section>
    <main class="seo-main">
      ${pageContent(page)}
      ${ctaBlock()}
      ${page.type === "home" ? calculatorSection() : ""}
      ${relatedLinks(page)}
      ${faqSection(page)}
    </main>
  `;

  return `<!doctype html>
<html lang="en">
  <head>${head(page, faq)}</head>
  <body>
    ${header(page.type)}
    ${main}
    ${rateModal()}
    ${footer()}
    <script src="/app.js"></script>
  </body>
</html>
`;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = allPages.map((page) => `
  <url>
    <loc>${absoluteUrl(pagePath(page))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.type === "home" ? "1.0" : "0.8"}</priority>
  </url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>
`;
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${siteConfig.baseUrl}/sitemap.xml
`;
}

function keywordMap() {
  const rows = allPages.map((page) => {
    const path = pagePath(page);
    const secondary = page.secondaryKeywords?.join(", ") || "";
    return `| \`${path}\` | ${page.primaryKeyword} | ${secondary} |`;
  }).join("\n");
  return `# SEO Keyword Map

| Page | Primary keyword | Secondary keywords |
| --- | --- | --- |
${rows}
`;
}

async function writeGeneratedFile(path, content) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

function validatePage(page, html) {
  const count = wordCount(html);
  const titleLength = page.title.length;
  const descriptionLength = page.description.length;
  const h1Count = (html.match(/<h1>/g) || []).length;
  const errors = [];

  if (titleLength > 60) errors.push(`${pagePath(page)} title is ${titleLength} chars`);
  if (descriptionLength > 155) errors.push(`${pagePath(page)} description is ${descriptionLength} chars`);
  if (h1Count !== 1) errors.push(`${pagePath(page)} has ${h1Count} h1 elements`);
  if (count < 800 || count > 1200) errors.push(`${pagePath(page)} has ${count} words`);

  return errors;
}

async function build() {
  const errors = [];

  for (const page of allPages) {
    const html = renderPage(page);
    errors.push(...validatePage(page, html));
    const outputPath = page.slug ? `${page.slug}/index.html` : "index.html";
    await writeGeneratedFile(outputPath, html);
  }

  await writeGeneratedFile("sitemap.xml", sitemap());
  await writeGeneratedFile("robots.txt", robots());
  await writeGeneratedFile("keyword-map.md", keywordMap());

  if (errors.length) {
    throw new Error(`Build validation failed:\n${errors.join("\n")}`);
  }

  console.log(`Generated ${allPages.length} pages, sitemap.xml, robots.txt, and keyword-map.md`);
}

build().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
