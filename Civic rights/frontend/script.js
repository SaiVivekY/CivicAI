/**
 * ==============================================================================
 * CivicAI - Frontend Interaction & Guidance Engine
 * Designed for College Hackathon
 * ==============================================================================
 * 
 * Project Purpose:
 * AI-powered civic and legal rights assistant for Indian citizens.
 * 
 * Architecture Note:
 * This file handles UI interactions, sample queries, loading animations,
 * dynamic guidance rendering, and the draft generator modal.
 * 
 * The main backend integration hook is isolated in:
 *   >>> function getGuidance(userQuery) <<<
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components and event listeners
  initNavigation();
  initTextareaControls();
  initSamplePrompts();
  initCategoryCards();
  initGuidanceAction();
  initDraftModal();
  initPrintButton();
});

/* ==============================================================================
   1. DOM ELEMENTS SELECTION
   ============================================================================== */
const elements = {
  // Input elements
  problemInput: document.getElementById('problem-input'),
  charCount: document.getElementById('textarea-char-count'),
  btnClearInput: document.getElementById('btn-clear-input'),
  btnGetGuidance: document.getElementById('btn-get-guidance'),
  
  // Results & Loading elements
  resultsContainer: document.getElementById('results-container'),
  loadingState: document.getElementById('loading-state'),
  loadingStepText: document.getElementById('loading-step-text'),
  loadingProgressFill: document.getElementById('loading-progress-fill'),
  resultsContent: document.getElementById('results-content'),
  
  // Results Fields
  resCategoryBadge: document.getElementById('res-category-badge'),
  resJurisdictionBadge: document.getElementById('res-jurisdiction-badge'),
  resTitle: document.getElementById('res-title'),
  resSummaryIntro: document.getElementById('res-summary-intro'),
  resUnderstandingContent: document.getElementById('res-understanding-content'),
  resStepsContent: document.getElementById('res-steps-content'),
  resDocsContent: document.getElementById('res-docs-content'),
  resSourcesContent: document.getElementById('res-sources-content'),
  
  // Draft Modal elements
  btnGenerateDraft: document.getElementById('btn-generate-draft'),
  draftModal: document.getElementById('draft-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  modalDocType: document.getElementById('modal-doc-type'),
  modalDraftTitle: document.getElementById('modal-draft-title'),
  draftTextContent: document.getElementById('draft-text-content'),
  btnCopyDraft: document.getElementById('btn-copy-draft'),
  btnDownloadDraft: document.getElementById('btn-download-draft'),
  copyStatusMsg: document.getElementById('copy-status-msg'),

  // Header & Navigation
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  navLinksMenu: document.getElementById('nav-links-menu'),
  btnPrintResults: document.getElementById('btn-print-results'),
};

// Current active guidance data (stored for draft generation)
let currentGuidanceData = null;


/* ==============================================================================
   2. SAMPLE DATA / MOCK KNOWLEDGE BASE (INDIAN CIVIC & LEGAL CONTEXT)
   ============================================================================== */
const SAMPLE_QUERIES = {
  tenant: {
    query: "My landlord has not returned my security deposit of ₹45,000 even though I vacated 2 months ago and left the apartment in good condition with all utility bills paid.",
    category: "Tenant Rights",
    jurisdiction: "State Rent Control & Model Tenancy Provisions",
    title: "Unlawful Security Deposit Retention by Landlord",
    summaryIntro: "Your landlord is legally obligated to refund the security deposit within the agreed notice period (usually 30 days) minus justified deductions.",
    understanding: {
      narrative: "Under Indian tenancy jurisprudence and standard rental agreements, the security deposit is held in trust by the landlord solely as collateral against unpaid rent or physical damages exceeding normal wear and tear. Retaining the deposit beyond the agreed timeframe without providing an itemized claim of deductions constitutes a breach of contract and unjust enrichment under the Indian Contract Act, 1872.",
      statutes: [
        "Model Tenancy Act (Sec. 11) - Deposit refund mandatory upon handover minus agreed repairs.",
        "Indian Contract Act, 1872 (Sec. 73) - Compensation for breach of contractual terms.",
        "State Rent Control Acts / Civil Remedy for summary recovery under Order 37 of CPC."
      ]
    },
    steps: [
      {
        heading: "Send a Written Demand Notice (Email & WhatsApp)",
        timeframe: "Day 1 - 7",
        instruction: "Send a formal notice demanding the refund within 7 working days. Attach the handover confirmation, photos of the vacant flat, and last electricity/water receipts.",
        tip: "Avoid verbal phone calls only; written paper trails serve as primary evidence in court/tribunal."
      },
      {
        heading: "Issue a Formal Advocate Legal Notice",
        timeframe: "Day 8 - 20",
        instruction: "If the landlord fails to comply, issue a formal legal notice via Registered Post AD / Speed Post with a 15-day compliance deadline, citing interest claims at 12-18% p.a.",
        tip: "Most landlords settle upon receiving a formal legal notice to avoid litigation costs."
      },
      {
        heading: "Approach the Rent Authority / Consumer Commission / Civil Court",
        timeframe: "Day 21+",
        instruction: "File a complaint before the local Rent Authority/Rent Tribunal (if notified in your state) or file a Summary Suit under Order XXXVII of the Code of Civil Procedure (CPC) for liquidated debt recovery.",
        tip: "If the tenancy agreement included maintenance services by a corporate landlord or broker, an NCH Consumer complaint can also be logged."
      }
    ],
    documents: [
      { name: "Original Rental / Lease Agreement", purpose: "Proof of security deposit amount & refund terms" },
      { name: "Bank Transfer / UPI Transaction Proof", purpose: "Proof that deposit was actually paid to landlord" },
      { name: "Move-out / Handover Inspection Photos or Video", purpose: "Evidence that property was returned in good order" },
      { name: "Cleared Utility Bills (Electricity, Water, Gas)", purpose: "Proves no outstanding utility liabilities" },
      { name: "Written Notice / Communication Trail (Email/WhatsApp)", purpose: "Proof of timely intimation and refusal to pay" }
    ],
    sources: [
      { name: "National Legal Services Authority (NALSA)", url: "https://nalsa.gov.in", desc: "Citizen legal aid and pre-litigation mediation assistance." },
      { name: "State Rent Control Portals / e-Courts", url: "https://ecourts.gov.in", desc: "Directory of District Courts and local Rent Tribunals." },
      { name: "India Code - Contract Act", url: "https://www.indiacode.nic.in", desc: "Statutory provisions on breach of contract and monetary claims." }
    ],
    draft: {
      type: "Legal Notice for Security Deposit Refund",
      title: "FORMAL LEGAL NOTICE FOR REFUND OF SECURITY DEPOSIT",
      template: `REGISTERED SPEED POST WITH ACKNOWLEDGEMENT DUE / EMAIL

To,
[LANDLORD NAME]
[LANDLORD COMPLETE ADDRESS]
Phone: [LANDLORD PHONE NUMBER]
Email: [LANDLORD EMAIL ADDRESS]

Date: [CURRENT DATE, e.g. 20 August 2026]

SUBJECT: FORMAL DEMAND NOTICE FOR IMMEDIATE REFUND OF SECURITY DEPOSIT OF RS. [AMOUNT IN NUMBERS, e.g. ₹45,000/-] FOR PREMISES SITUATED AT [RENTED APARTMENT FULL ADDRESS]

Dear Sir/Madam,

Under instructions from and on behalf of my client / the undersigned, [YOUR FULL NAME], residing at [YOUR CURRENT RESIDENTIAL ADDRESS], I hereby state and serve you with this formal legal notice:

1. That the undersigned occupied the premises situated at [RENTED APARTMENT FULL ADDRESS] as a tenant under the Rental Agreement dated [DATE OF RENTAL AGREEMENT] on a monthly rent of Rs. [MONTHLY RENT].

2. That at the inception of the tenancy, the undersigned deposited an interest-free refundable security deposit of Rs. [AMOUNT, e.g. ₹45,000/-] via [BANK TRANSACTION ID / UPI REF] on [PAYMENT DATE].

3. That as per the agreed terms, the undersigned served a [30-DAY / 1-MONTH] notice of vacation and peacefully handed over vacant possession of the premises to you on [MOVE-OUT DATE]. All utility dues (electricity, water, maintenance) were fully cleared.

4. That during the handover inspection, the property was found to be in clean, habitable condition without any damage beyond standard wear and tear.

5. That despite repeated reminders dated [DATE 1] and [DATE 2], you have failed and neglected to refund the legitimate security deposit of Rs. [AMOUNT], in blatant violation of the terms of the agreement and the law of the land.

THEREFORE, I hereby call upon you to immediately refund the total sum of Rs. [AMOUNT] into my bank account details mentioned below, within 7 (Seven) days of receipt of this notice, failing which I shall be constrained to initiate appropriate civil and criminal proceedings against you before the competent Court / Rent Authority, claiming the principal amount with interest @ 18% p.a. and full litigation damages, solely at your risk and consequence.

BANK DETAILS FOR TRANSFER:
Account Holder: [YOUR NAME]
Bank Name: [BANK NAME]
Account Number: [ACCOUNT NUMBER]
IFSC Code: [IFSC CODE]
UPI ID: [UPI ID]

Yours faithfully,

_______________________
[YOUR FULL NAME / ADVOCATE NAME]
[CONTACT NUMBER]
[EMAIL ADDRESS]`
    }
  },

  consumer: {
    query: "I purchased a smartphone from an e-commerce website 3 months ago. The display malfunctioned under warranty, but the brand service center rejected repair claiming spurious physical damage and the portal refuses to replace or refund.",
    category: "Consumer Rights",
    jurisdiction: "Consumer Protection Act, 2019",
    title: "Deficiency in Service & Unfair Trade Practice for Warranty Denial",
    summaryIntro: "Under the Consumer Protection Act, 2019, arbitrary denial of warranty for defective manufacturing without forensic proof constitutes 'Deficiency in Service'.",
    understanding: {
      narrative: "Under the Consumer Protection Act, 2019, consumers are entitled to redressal against unfair trade practices and defective goods. A manufacturer and authorized service center cannot arbitrarily reject in-warranty repair claims by alleging physical damage without providing a technical inspection report and photographic proof. Both the e-commerce marketplace and the product manufacturer are liable under Product Liability provisions (Chapter VI of CPA 2019).",
      statutes: [
        "Consumer Protection Act, 2019 (Sec. 2(11)) - Deficiency in service by seller and manufacturer.",
        "Consumer Protection Act, 2019 (Sec. 84) - Product Liability of Manufacturer.",
        "Consumer Protection (E-Commerce) Rules, 2020 - Mandatory grievance redressal mechanism."
      ]
    },
    steps: [
      {
        heading: "Escalate to E-commerce & Brand Grievance Officer",
        timeframe: "Day 1 - 3",
        instruction: "Email the official Grievance Officer of the manufacturer and e-commerce portal quoting the job sheet number, purchase invoice, and warranty card.",
        tip: "Under E-Commerce Rules 2020, grievance officers must acknowledge complaints within 48 hours and resolve within 1 month."
      },
      {
        heading: "Register Grievance on National Consumer Helpline (NCH)",
        timeframe: "Day 4 - 10",
        instruction: "Lodge a complaint on consumerhelpline.gov.in or call Toll-Free 1915 or send WhatsApp to 8800001915. NCH acts as a government-backed pre-litigation conciliation platform.",
        tip: "Over 80% of registered company complaints are settled amicably during the NCH conciliation phase."
      },
      {
        heading: "File Online Consumer Complaint via e-Daakhil",
        timeframe: "Day 15+",
        instruction: "If unaddressed, file a formal complaint with the District Consumer Disputes Redressal Commission via the online e-Daakhil portal (edaakhil.nic.in) claiming replacement, full refund, and mental harassment compensation.",
        tip: "No lawyer is compulsory for filing cases in the District Consumer Commission."
      }
    ],
    documents: [
      { name: "Original Tax Invoice / Purchase Receipt", purpose: "Proof of purchase, price paid, and date of transaction" },
      { name: "Manufacturer Warranty Card", purpose: "Proof of active warranty duration and terms" },
      { name: "Service Center Job Sheet / Inspection Slip", purpose: "Proof that device was submitted within warranty period" },
      { name: "Photographs / Video of the Device Condition", purpose: "Visual evidence refuting claims of external physical damage" },
      { name: "Email correspondence with Support / Grievance Team", purpose: "Documentation of rejection and grievance escalation" }
    ],
    sources: [
      { name: "National Consumer Helpline (NCH)", url: "https://consumerhelpline.gov.in", desc: "Toll-free 1915 - Pre-litigation consumer grievance portal." },
      { name: "e-Daakhil Portal", url: "https://edaakhil.nic.in", desc: "Filing consumer complaints online before Consumer Commissions." },
      { name: "Dept. of Consumer Affairs Guidelines", url: "https://consumeraffairs.nic.in", desc: "Statutory rights under Consumer Protection Act 2019." }
    ],
    draft: {
      type: "Consumer Grievance & Demand Notice",
      title: "FORMAL CONSUMER GRIEVANCE & DEMAND NOTICE",
      template: `VIA EMAIL AND REGISTERED POST

To,
1. The Grievance Officer / Nodal Officer,
   [COMPANY / BRAND NAME], [SERVICE CENTER ADDRESS]
   Email: [BRAND GRIEVANCE EMAIL]

2. The Customer Support Head,
   [E-COMMERCE PLATFORM NAME], [PLATFORM ADDRESS]
   Email: [E-COMMERCE GRIEVANCE EMAIL]

Date: [CURRENT DATE, e.g. 20 August 2026]

SUBJECT: FORMAL NOTICE UNDER CONSUMER PROTECTION ACT, 2019 FOR UNFAIR TRADE PRACTICE & DEFICIENCY IN SERVICE REGARDING [PRODUCT NAME & MODEL] (INVOICE NO: [INVOICE NUMBER])

Dear Sir/Madam,

I, [YOUR FULL NAME], residing at [YOUR ADDRESS], am a bonafide consumer who purchased [PRODUCT NAME, MODEL & SERIAL/IMEI NUMBER] from your platform on [PURCHASE DATE] vide Invoice No. [INVOICE NUMBER] for a total consideration of Rs. [AMOUNT PAID, e.g. ₹28,999/-].

1. The said product comes with a standard manufacturer warranty of [1 YEAR / 2 YEARS] expiring on [WARRANTY EXPIRY DATE].

2. On [DATE OF DEFECT], the product developed an inherent manufacturing defect, namely: [DESCRIBE DEFECT, e.g. screen flickering and blank display].

3. On [DATE OF VISITING SERVICE CENTER], I submitted the product to your authorized service center located at [SERVICE CENTER LOCATION] under Job Sheet No. [JOB SHEET NUMBER].

4. To my utter shock, your service personnel wrongfully rejected the warranty claim on the unsubstantiated and baseless pretext of "physical/liquid damage", without providing any technical diagnostic report or evidence.

5. The said conduct constitutes "Deficiency in Service" under Section 2(11) and "Unfair Trade Practice" under Section 2(47) of the Consumer Protection Act, 2019.

THEREFORE, I hereby demand that you:
a) Provide free-of-cost replacement / repair of the unit with genuine parts OR provide a 100% full refund of Rs. [AMOUNT PAID]; and
b) Compensate me Rs. [5,000/-] for harassment and loss of working hours.

If this grievance is not resolved within 7 (Seven) days of receipt of this notice, I shall file a formal complaint before the District Consumer Commission via e-Daakhil and register a formal grievance with the National Consumer Helpline (1915), holding you liable for all legal costs and punitive damages.

Yours sincerely,

_______________________
[YOUR FULL NAME]
[CONTACT NUMBER]
[EMAIL ADDRESS]`
    }
  },

  rti: {
    query: "I filed an RTI application with the Municipal Corporation regarding road construction tenders and budget utilization in my ward 40 days ago, but have received no response from the PIO.",
    category: "RTI & Public Information",
    jurisdiction: "Right to Information Act, 2005",
    title: "Deemed Refusal & Filing of First Appeal under Section 19(1)",
    summaryIntro: "Under Section 7(1) of the RTI Act 2005, the Public Information Officer (PIO) is mandated to provide information within 30 days. Non-response within 30 days is treated as a 'Deemed Refusal'.",
    understanding: {
      narrative: "Under the RTI Act 2005, every citizen has a fundamental right to inspect public records and seek government accountability. If the Public Information Officer (PIO) fails to provide information within 30 days of receiving the application, it is treated as a deemed refusal under Section 7(2). Furthermore, under Section 7(6), once the 30-day limit expires, all requested information must be supplied completely FREE OF COST.",
      statutes: [
        "RTI Act 2005 (Sec. 7(1)) - Mandatory 30-day deadline for disposal of applications.",
        "RTI Act 2005 (Sec. 7(6)) - Information to be supplied free of cost after statutory deadline.",
        "RTI Act 2005 (Sec. 19(1)) - Right to file First Appeal before the First Appellate Authority within 30 days."
      ]
    },
    steps: [
      {
        heading: "Prepare and File First Appeal under Section 19(1)",
        timeframe: "Day 31 - 60",
        instruction: "Submit a First Appeal to the First Appellate Authority (FAA) of the respective Public Authority (higher in rank than the PIO), attaching the original application and payment receipt.",
        tip: "No court fee or application fee is required for filing a First Appeal in Central Government departments and most State departments."
      },
      {
        heading: "Claim Information Free of Charge under Sec. 7(6)",
        timeframe: "During Hearing",
        instruction: "Specifically invoke Section 7(6) in your appeal petition so that the department cannot charge photocopying or inspection fees.",
        tip: "The FAA is legally bound to dispose of the appeal within 30 days (extendable to max 45 days with written reasons)."
      },
      {
        heading: "Escalate to State / Central Information Commission (Second Appeal)",
        timeframe: "Day 75+",
        instruction: "If the FAA fails to decide or upholds the refusal, file a Second Appeal under Section 19(3) with the State Information Commission (SIC) / CIC requesting penalty of ₹250/day (up to ₹25,000) on the defaulting PIO under Section 20(1).",
        tip: "Information Commissions have judicial powers to summon officials and award compensation to citizens."
      }
    ],
    documents: [
      { name: "Original RTI Application Form / Online Receipt", purpose: "Proof of exact questions asked and initial filing" },
      { name: "RTI Application Fee Payment Proof (Postal Order / Online Ref)", purpose: "Proof of valid submission and fee clearance" },
      { name: "Postal Tracking / Speed Post Delivery Confirmation", purpose: "Proof that PIO received the application 30+ days ago" },
      { name: "Previous RTI Registration Number (if filed online)", purpose: "Reference number for automated portal appeal" }
    ],
    sources: [
      { name: "RTI Online Portal (DoPT)", url: "https://rtionline.gov.in", desc: "Central government RTI filing and first appeal tracking." },
      { name: "Central Information Commission (CIC)", url: "https://cic.gov.in", desc: "Apex regulatory and second appeal body for RTI." },
      { name: "Department of Personnel and Training (DoPT)", url: "https://dopt.gov.in", desc: "Official circulars and RTI rules repository." }
    ],
    draft: {
      type: "First Appeal Form under Section 19(1) of RTI Act",
      title: "FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005",
      template: `BEFORE THE FIRST APPELLATE AUTHORITY
[NAME OF PUBLIC AUTHORITY, e.g. Municipal Corporation of Delhi / Greater Chennai Corporation]
[DEPARTMENT ADDRESS]

FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005

1. Name and Address of Appellant:
   Name: [YOUR FULL NAME]
   Address: [YOUR COMPLETE POSTAL ADDRESS]
   Phone: [YOUR PHONE NUMBER]
   Email: [YOUR EMAIL ADDRESS]

2. Details of the Central/State Public Information Officer (CPIO/SPIO):
   Name / Designation: The Public Information Officer (PIO)
   Public Authority: [DEPARTMENT NAME, e.g. Engineering & Works Division]
   Address: [OFFICE ADDRESS]

3. Details of Original RTI Application:
   a) Date of Filing RTI Application: [DATE OF ORIGINAL APPLICATION]
   b) RTI Reference / Reg No. (if any): [RTI REGISTRATION NUMBER]
   c) Mode of Delivery: [Online / Speed Post Tracking No: EK123456789IN]
   d) Date of Delivery to PIO: [DATE DELIVERED]

4. Subject Matter of Information Sought:
   [BRIEF SUMMARY: e.g. Road repair contracts, allocated budget, and contractor inspection reports for Ward No. 42]

5. Ground of Appeal (Check applicable):
   [X] Deemed Refusal: No response received within mandatory 30 days statutory period under Section 7(1).
   [ ] Incomplete / Misleading / False information provided.
   [ ] Unjustified rejection under Section 8 exemptions.

6. Relief / Prayers Sought:
   a) Direct the PIO to immediately provide complete, certified information sought in the original application.
   b) As the statutory 30 days have elapsed, direct that all information and documents be provided FREE OF COST under Section 7(6) of the RTI Act, 2005.
   c) Take appropriate administrative notice of the willful delay by the PIO.

Verification:
I, [YOUR FULL NAME], do hereby declare that the particulars given above are true and correct to the best of my knowledge and belief.

Date: [CURRENT DATE]
Place: [YOUR CITY]

_______________________
(Signature of Appellant)
[YOUR FULL NAME]`
    }
  },

  scheme: {
    query: "How can a low-income family apply for the Ayushman Bharat PM-JAY health card and what are the exact eligibility documents required?",
    category: "Government Schemes & Welfare",
    jurisdiction: "National Health Authority (NHA) & MoHFW",
    title: "Ayushman Bharat PM-JAY Health Coverage Eligibility & Enrollment",
    summaryIntro: "Ayushman Bharat PM-JAY provides health insurance cover of ₹5 Lakh per family per year for secondary and tertiary hospitalisation.",
    understanding: {
      narrative: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) is an entitlement-based scheme based on the Socio-Economic and Caste Census (SECC 2011) database for rural and urban households, as well as state-linked ration card holder registries. There is no open application fee. Beneficiaries can check their eligibility via the official portal or visit any empaneled hospital / Ayushman Arogya Mandir with their Aadhaar and Ration Card.",
      statutes: [
        "National Health Authority (NHA) Operational Guidelines for AB-PMJAY.",
        "National Food Security Act (NFSA) 2013 - Priority household linkages for welfare benefits.",
        "Right to Health as an inherent component of Article 21 (Right to Life) of the Constitution."
      ]
    },
    steps: [
      {
        heading: "Check Eligibility on Official PM-JAY Portal",
        timeframe: "Instant (5 mins)",
        instruction: "Visit beneficiary.nha.gov.in or pmjay.gov.in and enter your Mobile Number or Ration Card / Family ID number to search the beneficiary database.",
        tip: "You can also call the 24x7 toll-free helpline 14555 to verify family inclusion."
      },
      {
        heading: "Visit Nearest Common Service Center (CSC) or Empaneled Hospital",
        timeframe: "Day 1 - 2",
        instruction: "Take your Aadhaar card and Ration Card to the nearest Ayushman Mitra at an empaneled government/private hospital or CSC for biometric e-KYC authentication.",
        tip: "e-KYC verification and Ayushman card generation is completely FREE of cost."
      },
      {
        heading: "Download Digital Ayushman Card (PM-JAY PVC Card)",
        timeframe: "Instant upon eKYC",
        instruction: "Once e-KYC is approved, download your digital Ayushman Card from the BIS portal or Ayushman App on your phone for cashless treatment.",
        tip: "Cashless benefit covers pre-existing conditions from Day 1 of enrollment across 27,000+ empaneled hospitals."
      }
    ],
    documents: [
      { name: "Aadhaar Card of all family members", purpose: "Biometric identity and demographic verification" },
      { name: "Ration Card / NFSA Priority Card / Family ID", purpose: "Proof of family unit composition" },
      { name: "Active Mobile Number linked with Aadhaar", purpose: "OTP verification during online e-KYC" },
      { name: "Income Certificate / BPL Certificate (if asked)", purpose: "State-specific priority verification" }
    ],
    sources: [
      { name: "National Health Authority PM-JAY", url: "https://beneficiary.nha.gov.in", desc: "Official portal for checking eligibility and generating Ayushman Cards." },
      { name: "myScheme Portal", url: "https://myscheme.gov.in", desc: "Centralized discovery platform for all central and state welfare programs." },
      { name: "PM-JAY Toll Free Helpline: 14555", url: "https://pmjay.gov.in", desc: "24x7 citizen inquiry and hospital grievance resolution." }
    ],
    draft: {
      type: "Application for Scheme Enrollment & Grievance",
      title: "APPLICATION FOR VERIFICATION & ENROLLMENT UNDER WELFARE SCHEME",
      template: `To,
The District Health Officer / Nodal Officer (PM-JAY),
Office of the Chief Medical Officer,
[DISTRICT / TALUKA NAME], [STATE]

Date: [CURRENT DATE, e.g. 20 August 2026]

SUBJECT: REQUEST FOR VERIFICATION AND ISSUANCE OF AYUSHMAN BHARAT (PM-JAY) CARD UNDER RATION CARD / SECC BENEFICIARY CATEGORY

Respected Sir/Madam,

I, [YOUR FULL NAME], Son/Daughter/Spouse of [GUARDIAN NAME], residing at [COMPLETE PERMANENT ADDRESS, VILLAGE/WARD, PIN CODE], submit the following representation:

1. That my family belongs to the low-income / priority household category holding valid Ration Card No: [RATION CARD NUMBER].

2. That the details of my family members seeking Ayushman Card issuance are as follows:
   i.   [NAME 1] - Age: [AGE] - Relation: Self - Aadhaar: [AADHAAR NO]
   ii.  [NAME 2] - Age: [AGE] - Relation: Spouse - Aadhaar: [AADHAAR NO]
   iii. [NAME 3] - Age: [AGE] - Relation: Child - Aadhaar: [AADHAAR NO]

3. That our family is listed under eligible priority categories / NFSA database, but our e-KYC card generation could not be completed due to [DATA MISMATCH / PORTAL RECORD SYNC ISSUE].

4. I have attached copies of our valid Aadhaar Cards, Ration Card, and Residence Proof for verification.

THEREFORE, I kindly request your office to verify our records on the Beneficiary Identification System (BIS) and facilitate the generation and activation of our Ayushman Cards at the earliest.

Thanking you,

Yours sincerely,

_______________________
[YOUR FULL NAME]
Phone: [YOUR PHONE NUMBER]
Email: [YOUR EMAIL ADDRESS]`
    }
  },

  civic: {
    query: "There is severe municipal water logging and deep uncovered potholes on our main residential street for 3 weeks. Multiple verbal complaints to the local ward councilor were ignored.",
    category: "Municipal & Civic Redressal",
    jurisdiction: "State Municipal Corporation Act & Citizen Charter",
    title: "Municipal Grievance for Road Repair & Public Safety Hazard",
    summaryIntro: "Municipal Corporations bear a mandatory statutory duty under Municipal Acts to maintain public streets and drainage infrastructure.",
    understanding: {
      narrative: "Under State Municipal Corporation Acts and local Municipal Bye-Laws, the civic authority has a mandatory public duty (and not a discretionary favor) to maintain public streets, lighting, and storm-water drainage. Leaving hazardous open pits and persistent water-logging violates the Municipal Citizen Charter and creates actionable public nuisance under Section 133 of the Code of Criminal Procedure (CrPC).",
      statutes: [
        "State Municipal Corporation Acts - Mandatory duties regarding roads, public health, and drainage.",
        "Code of Criminal Procedure (Sec. 133) - Conditional order for removal of public nuisance.",
        "Citizen Charter - Time-bound SLA (typically 48 to 72 hours) for addressing road hazards."
      ]
    },
    steps: [
      {
        heading: "Lodge Geo-Tagged Complaint on Official Municipal App / CPGRAMS",
        timeframe: "Day 1",
        instruction: "Submit a photo with location metadata on the local Municipal Corporation portal or national CPGRAMS portal (pgportal.gov.in) to generate an official grievance tracking token.",
        tip: "Always save the Grievance ID for subsequent escalation and RTI filing."
      },
      {
        heading: "Submit Joint Citizen Petition to Ward Assistant Engineer & Councilor",
        timeframe: "Day 3 - 5",
        instruction: "Submit a signed petition by 5-10 residents to the Ward Executive Engineer and Municipal Commissioner requesting immediate emergency patching.",
        tip: "Mention the specific risk to school children and two-wheelers to trigger high-priority safety response."
      },
      {
        heading: "File RTI on Sanctioned Road Maintenance Budget & Contractor Warranty",
        timeframe: "Day 7+",
        instruction: "File a 10-rupee RTI asking for the road contractor's name, defective liability warranty period (DLP), and repair budget allocated for your specific ward.",
        tip: "RTI queries on contractor warranty often force contractors to execute repairs immediately to avoid blacklisting."
      }
    ],
    documents: [
      { name: "Geo-tagged Photographs of Potholes & Water logging", purpose: "Visual evidence with date, time, and coordinates" },
      { name: "Previous Grievance Ticket Numbers", purpose: "Proof of civic negligence and repeated follow-ups" },
      { name: "Signatures of Resident Welfare Association (RWA) / Neighbors", purpose: "Demonstrates widespread public grievance" },
      { name: "Exact Ward Number and Landmark Details", purpose: "Defines jurisdiction for the specific Ward Junior Engineer" }
    ],
    sources: [
      { name: "CPGRAMS Citizen Grievance Portal", url: "https://pgportal.gov.in", desc: "Centralized Public Grievance Redress and Monitoring System." },
      { name: "Local Municipal Corporation Portal", url: "https://india.gov.in", desc: "National portal directory of municipal and urban local bodies." },
      { name: "Swachhata / Civic Mobile App", url: "https://swachhbharatmission.gov.in", desc: "Ministry of Housing and Urban Affairs civic reporting platform." }
    ],
    draft: {
      type: "Formal Civic Grievance Petition",
      title: "FORMAL MUNICIPAL COMPLAINT FOR EMERGENCY ROAD REPAIR",
      template: `To,
The Municipal Commissioner / Executive Engineer (Roads & Drainage),
[NAME OF MUNICIPAL CORPORATION, e.g. Bruhat Bengaluru Mahanagara Palike / Municipal Corporation of Delhi]
Ward No: [WARD NUMBER], Division: [DIVISION NAME]
[MUNICIPAL OFFICE ADDRESS]

Date: [CURRENT DATE, e.g. 20 August 2026]

SUBJECT: URGENT CITIZEN PETITION: PERSISTENT SEVERE WATER LOGGING AND HAZARDOUS ROAD POTHOLES AT [STREET / LOCALITY NAME]

Respected Sir/Madam,

We, the undersigned residents and daily commuters of [LOCALITY NAME / STREET NAME], Ward No. [WARD NUMBER], bring to your urgent attention a grave public safety hazard existing in our area for the past [NUMBER OF WEEKS, e.g. 3 weeks]:

1. LOCATION OF HAZARD:
   Exact Street: [STREET NAME, e.g. 4th Cross, 2nd Main Road]
   Nearest Landmark: [e.g. Near Government School / Community Center]
   Ward & Zone: [WARD NO & ZONE NAME]

2. NATURE OF PROBLEM:
   The aforementioned street is afflicted with extensive, deep potholes and severe rainwater stagnation. The accumulated dirty water is posing extreme danger to two-wheeler riders, school children, and elderly pedestrians, and has become a severe mosquito breeding hazard.

3. PREVIOUS INTIMATIONS:
   Informal and digital grievances lodged under Ticket No: [TICKET NUMBER] dated [DATE] have yielded no ground action or repair.

4. STATUTORY OBLIGATION:
   Under the Municipal Corporation Act, maintaining motorable roads and functional storm-water drains is a statutory duty of the Corporation.

THEREFORE, we earnestly request your office to:
a) Deploy an emergency road maintenance crew to fill the hazardous pits within 48 hours; and
b) Clear the blocked storm water drains to allow unobstructed rainwater outflow.

A list of resident signatures and geo-tagged photographs are enclosed herewith.

Yours faithfully,

1. [NAME 1] - [HOUSE NO] - Phone: [PHONE] - Sign: ___________
2. [NAME 2] - [HOUSE NO] - Phone: [PHONE] - Sign: ___________
3. [NAME 3] - [HOUSE NO] - Phone: [PHONE] - Sign: ___________`
    }
  }
};


/* ==============================================================================
   3. PRIMARY GUIDANCE LOGIC (HOOK FOR FUTURE BACKEND / AI API)
   ============================================================================== */

/**
 * Main function to retrieve civic guidance based on user input.
 * 
 * NOTE FOR BACKEND DEVELOPERS:
 * When integrating with a real AI / Python / FastAPI / Gemini backend:
 * 1. Replace the simulated delay with:
 *      const response = await fetch('/api/guidance', {
 *        method: 'POST',
 *        headers: { 'Content-Type': 'application/json' },
 *        body: JSON.stringify({ query: userQuery })
 *      });
 *      const data = await response.json();
 * 2. Pass the structured JSON data to `renderGuidanceResults(data)`.
 * 
 * @param {string} userQuery - The citizen's plain language problem description.
 */
async function getGuidance(userQuery) {
  const trimmed = userQuery.trim();
  
  if (!trimmed) {
    alert("Please describe your civic or legal problem first.");
    elements.problemInput.focus();
    return;
  }

  // 1. Show UI Loading State
  showLoadingState();

  try {
    // Simulate multi-stage AI reasoning steps for great UX presentation
    await simulateLoadingStages();

    // 2. Classify and match against intelligent mock response
    // (In production, replace this block with your actual AI API fetch request)
    const matchedData = resolveQueryToGuidance(trimmed);
    currentGuidanceData = matchedData;

    // 3. Render the structured results
    renderGuidanceResults(matchedData);

    // 4. Hide loading and smoothly reveal results
    hideLoadingState();
    scrollToResults();

  } catch (error) {
    console.error("Error generating guidance:", error);
    hideLoadingState();
    alert("An error occurred while analyzing your problem. Please try again.");
  }
}


/* ==============================================================================
   4. QUERY RESOLUTION / LOCAL MOCK CLASSIFIER
   ============================================================================== */
function resolveQueryToGuidance(query) {
  const lower = query.toLowerCase();

  if (lower.includes("landlord") || lower.includes("deposit") || lower.includes("rent") || lower.includes("tenant") || lower.includes("flat") || lower.includes("evict") || lower.includes("house owner")) {
    return SAMPLE_QUERIES.tenant;
  } else if (lower.includes("phone") || lower.includes("warranty") || lower.includes("product") || lower.includes("flipkart") || lower.includes("amazon") || lower.includes("consumer") || lower.includes("refund") || lower.includes("defective") || lower.includes("bill") || lower.includes("shop") || lower.includes("e-commerce")) {
    return SAMPLE_QUERIES.consumer;
  } else if (lower.includes("rti") || lower.includes("information") || lower.includes("pio") || lower.includes("appeal") || lower.includes("officer") || lower.includes("tender") || lower.includes("records") || lower.includes("transparency")) {
    return SAMPLE_QUERIES.rti;
  } else if (lower.includes("scheme") || lower.includes("ayushman") || lower.includes("health card") || lower.includes("kisan") || lower.includes("pension") || lower.includes("ration") || lower.includes("subsidy") || lower.includes("pm-") || lower.includes("bpl")) {
    return SAMPLE_QUERIES.scheme;
  } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("water") || lower.includes("drain") || lower.includes("garbage") || lower.includes("municipal") || lower.includes("corporation") || lower.includes("panchayat") || lower.includes("street")) {
    return SAMPLE_QUERIES.civic;
  } else {
    // Intelligent dynamic fallback constructed from user prompt
    return {
      category: "General Citizen Rights",
      jurisdiction: "Indian Administrative & Civil Grievance Framework",
      title: "Citizen Problem Analysis & Action Plan",
      summaryIntro: "Analysis of your submitted issue with tailored legal provisions and official citizen recourse avenues in India.",
      understanding: {
        narrative: `You reported: "${query}". Under Indian administrative guidelines and civil law, citizens have statutory entitlements to fair service delivery, transparency, and consumer protection. When dealing with private or governmental entities, establishing a clear written record and following defined grievance channels provides the fastest legal remedy.`,
        statutes: [
          "Constitution of India (Article 21) - Protection of life, personal liberty, and right to dignified living.",
          "Consumer Protection Act 2019 / Citizen Charter Guidelines for service delivery standards.",
          "General Clauses & Specific Relief Act for contractual and administrative obligations."
        ]
      },
      steps: [
        {
          heading: "Establish Written Paper Trail & Formal Demand",
          timeframe: "Day 1 - 5",
          instruction: "Document all facts, transaction receipts, photos, and send a formal intimation letter or email to the concerned party setting a 7-14 day resolution timeline.",
          tip: "Always keep digital copies of timestamps and postal delivery receipts."
        },
        {
          heading: "Lodge Official Online Grievance (CPGRAMS / NCH / State Portal)",
          timeframe: "Day 6 - 15",
          instruction: "File an official ticket on central or state portals (e.g. pgportal.gov.in for government departments or consumerhelpline.gov.in for commercial issues).",
          tip: "Include reference numbers from your previous informal communications."
        },
        {
          heading: "Legal Notice & Escalation to Competent Forum",
          timeframe: "Day 15+",
          instruction: "If the issue remains unresolved, issue a formal advocate notice or approach the District Legal Services Authority (DLSA) / Lok Adalat for pre-litigation settlement.",
          tip: "Free legal aid is available to eligible citizens through NALSA / DLSA across every district in India."
        }
      ],
      documents: [
        { name: "Government Identity Proof (Aadhaar / Voter ID)", purpose: "Citizen identity verification" },
        { name: "Receipts / Invoices / Financial Transactions Proof", purpose: "Substantiates monetary consideration or transaction" },
        { name: "Photographic / Documented Evidence", purpose: "Visual or documentary proof of the grievance" },
        { name: "Written Communications & Previous Ticket IDs", purpose: "Demonstrates prior notice and inaction" }
      ],
      sources: [
        { name: "CPGRAMS Citizen Portal", url: "https://pgportal.gov.in", desc: "Central government grievance redressal mechanism." },
        { name: "National Legal Services Authority (NALSA)", url: "https://nalsa.gov.in", desc: "Free legal services and Lok Adalat dispute resolution." },
        { name: "India Code Repository", url: "https://www.indiacode.nic.in", desc: "Access full texts of central and state statutes." }
      ],
      draft: {
        type: "Formal Representation / Grievance Notice",
        title: "FORMAL CITIZEN REPRESENTATION & GRIEVANCE LETTER",
        template: `To,
[NAME OF CONCERNED AUTHORITY / COMPANY / INDIVIDUAL]
[DESIGNATION / DEPARTMENT]
[ADDRESS]

Date: [CURRENT DATE]

SUBJECT: FORMAL REPRESENTATION REGARDING: [BRIEF SUMMARY OF PROBLEM]

Dear Sir/Madam,

I, [YOUR FULL NAME], residing at [YOUR ADDRESS], bring to your urgent attention the following grievance:

1. STATEMENT OF FACTS:
   [DESCRIBE THE ISSUE IN DETAIL: ${query}]

2. PREVIOUS ACTIONS TAKEN:
   I have previously approached your office/representatives on [DATES], but no effective resolution has been provided till date.

3. LEGAL RIGHT & REQUEST:
   As a citizen/consumer, I am entitled to fair service and redressal under applicable Indian laws and citizen charters.

THEREFORE, I respectfully request you to resolve this matter within 10 (Ten) working days from the receipt of this notice, failing which I shall be compelled to escalate this grievance to the competent statutory Ombudsman / Commission / Consumer Forum.

Yours faithfully,

_______________________
[YOUR FULL NAME]
Phone: [YOUR PHONE NUMBER]
Email: [YOUR EMAIL ADDRESS]`
      }
    };
  }
}


/* ==============================================================================
   5. RESULTS RENDERING
   ============================================================================== */
function renderGuidanceResults(data) {
  // Header badges & title
  elements.resCategoryBadge.textContent = data.category || "Citizen Rights";
  elements.resJurisdictionBadge.textContent = data.jurisdiction || "Indian Law";
  elements.resTitle.textContent = data.title || "Guidance & Action Plan";
  elements.resSummaryIntro.textContent = data.summaryIntro || "Here is your actionable guidance roadmap.";

  // 1. Understanding Section
  let understandingHtml = `
    <p class="understanding-text">${escapeHtml(data.understanding.narrative)}</p>
    <div class="legal-statutes-box">
      <h4 class="statute-title">Key Legal Provisions &amp; Statutes Cited</h4>
      <ul class="statute-list">
  `;
  data.understanding.statutes.forEach(statute => {
    understandingHtml += `
      <li class="statute-item">
        <span class="statute-bullet">§</span>
        <span>${escapeHtml(statute)}</span>
      </li>
    `;
  });
  understandingHtml += `</ul></div>`;
  elements.resUnderstandingContent.innerHTML = understandingHtml;

  // 2. Action Steps Section
  let stepsHtml = '';
  data.steps.forEach((step, index) => {
    stepsHtml += `
      <div class="step-item">
        <div class="step-index-pill">${index + 1}</div>
        <div class="step-details">
          <div class="step-details-header">
            <h4 class="step-heading">${escapeHtml(step.heading)}</h4>
            <span class="step-timeframe-tag">Estimated: ${escapeHtml(step.timeframe)}</span>
          </div>
          <p class="step-instruction">${escapeHtml(step.instruction)}</p>
          ${step.tip ? `<div class="step-pro-tip"><strong>Pro-Tip:</strong> ${escapeHtml(step.tip)}</div>` : ''}
        </div>
      </div>
    `;
  });
  elements.resStepsContent.innerHTML = stepsHtml;

  // 3. Documents Checklist Section
  let docsHtml = '';
  data.documents.forEach((doc, index) => {
    const checkboxId = `doc-check-${index}`;
    docsHtml += `
      <li class="doc-item">
        <input type="checkbox" id="${checkboxId}" class="doc-checkbox" />
        <label for="${checkboxId}" class="doc-info" style="cursor: pointer;">
          <span class="doc-name">${escapeHtml(doc.name)}</span>
          <span class="doc-purpose">${escapeHtml(doc.purpose)}</span>
        </label>
      </li>
    `;
  });
  elements.resDocsContent.innerHTML = docsHtml;

  // 4. Relevant Sources Section
  let sourcesHtml = '';
  data.sources.forEach(src => {
    sourcesHtml += `
      <div class="source-portal-card">
        <div>
          <h4 class="portal-title">${escapeHtml(src.name)}</h4>
          <p class="portal-desc">${escapeHtml(src.desc)}</p>
        </div>
        <a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer" class="portal-link">
          Visit Portal &rarr;
        </a>
      </div>
    `;
  });
  elements.resSourcesContent.innerHTML = sourcesHtml;
}


/* ==============================================================================
   6. DRAFT GENERATOR & MODAL HANDLING
   ============================================================================== */
function initDraftModal() {
  // Open Draft Modal
  elements.btnGenerateDraft.addEventListener('click', () => {
    if (!currentGuidanceData || !currentGuidanceData.draft) {
      alert("Please generate guidance first.");
      return;
    }

    const draft = currentGuidanceData.draft;
    elements.modalDocType.textContent = draft.type || "Formal Legal Draft";
    elements.modalDraftTitle.textContent = draft.title || "Customized Application Draft";
    elements.draftTextContent.value = draft.template || "";
    elements.copyStatusMsg.textContent = "";

    // Show modal
    elements.draftModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Close Draft Modal
  elements.btnCloseModal.addEventListener('click', closeModal);
  
  // Close on outside click
  elements.draftModal.addEventListener('click', (e) => {
    if (e.target === elements.draftModal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.draftModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Copy Draft to Clipboard
  elements.btnCopyDraft.addEventListener('click', async () => {
    const textToCopy = elements.draftTextContent.value;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        elements.draftTextContent.select();
        document.execCommand('copy');
      }
      elements.copyStatusMsg.textContent = "✓ Copied to clipboard successfully!";
      setTimeout(() => {
        elements.copyStatusMsg.textContent = "";
      }, 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      elements.copyStatusMsg.textContent = "Please select all and copy manually (Ctrl+C).";
    }
  });

  // Download Draft as .txt File
  elements.btnDownloadDraft.addEventListener('click', () => {
    const text = elements.draftTextContent.value;
    const filename = (currentGuidanceData && currentGuidanceData.draft && currentGuidanceData.draft.type)
      ? `${currentGuidanceData.draft.type.toLowerCase().replace(/[^a-z0-9]/g, '_')}_draft.txt`
      : 'civic_ai_legal_draft.txt';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

function closeModal() {
  elements.draftModal.classList.add('hidden');
  document.body.style.overflow = '';
}


/* ==============================================================================
   7. UI INTERACTIVITY & HELPER HANDLERS
   ============================================================================== */

// Guidance Trigger Handler
function initGuidanceAction() {
  elements.btnGetGuidance.addEventListener('click', () => {
    const query = elements.problemInput.value;
    getGuidance(query);
  });

  // Allow pressing Ctrl + Enter inside textarea to submit
  elements.problemInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      elements.btnGetGuidance.click();
    }
  });
}

// Textarea Character Counter & Clear Button
function initTextareaControls() {
  const updateCount = () => {
    const len = elements.problemInput.value.length;
    elements.charCount.textContent = `${len} / 1500 characters`;
    if (len > 0) {
      elements.btnClearInput.classList.remove('hidden');
    } else {
      elements.btnClearInput.classList.add('hidden');
    }
  };

  elements.problemInput.addEventListener('input', updateCount);

  elements.btnClearInput.addEventListener('click', () => {
    elements.problemInput.value = '';
    updateCount();
    elements.problemInput.focus();
  });
}

// Sample Quick Chips Handlers
function initSamplePrompts() {
  const chips = document.querySelectorAll('.sample-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleKey = chip.getAttribute('data-sample');
      if (SAMPLE_QUERIES[sampleKey]) {
        elements.problemInput.value = SAMPLE_QUERIES[sampleKey].query;
        elements.problemInput.dispatchEvent(new Event('input'));
        elements.problemInput.focus();
        // Visual cue on input
        elements.problemInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// Category Cards Click Handlers
function initCategoryCards() {
  const cards = document.querySelectorAll('.category-card');
  cards.forEach(card => {
    const selectCategory = () => {
      const catKey = card.getAttribute('data-category');
      if (SAMPLE_QUERIES[catKey]) {
        elements.problemInput.value = SAMPLE_QUERIES[catKey].query;
        elements.problemInput.dispatchEvent(new Event('input'));
        // Smooth scroll to hero input
        const inputSection = document.getElementById('problem-input-section');
        if (inputSection) {
          inputSection.scrollIntoView({ behavior: 'smooth' });
        }
        elements.problemInput.focus();
      }
    };

    card.addEventListener('click', selectCategory);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCategory();
      }
    });
  });
}

// Mobile Navigation Toggle
function initNavigation() {
  if (!elements.mobileMenuToggle || !elements.navLinksMenu) return;

  elements.mobileMenuToggle.addEventListener('click', () => {
    const isExpanded = elements.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    elements.mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
    elements.navLinksMenu.classList.toggle('active');

    const openIcon = elements.mobileMenuToggle.querySelector('.menu-icon-open');
    const closeIcon = elements.mobileMenuToggle.querySelector('.menu-icon-close');
    if (openIcon && closeIcon) {
      openIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    }
  });

  // Close mobile nav when link is clicked
  const navLinks = elements.navLinksMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      elements.navLinksMenu.classList.remove('active');
      elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      const openIcon = elements.mobileMenuToggle.querySelector('.menu-icon-open');
      const closeIcon = elements.mobileMenuToggle.querySelector('.menu-icon-close');
      if (openIcon && closeIcon) {
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    });
  });
}

// Print / Save Button
function initPrintButton() {
  if (elements.btnPrintResults) {
    elements.btnPrintResults.addEventListener('click', () => {
      window.print();
    });
  }
}

// Loading States & Progress Simulation
function showLoadingState() {
  elements.resultsContainer.classList.remove('hidden');
  elements.loadingState.classList.remove('hidden');
  elements.resultsContent.classList.add('hidden');
  elements.btnGetGuidance.disabled = true;
  elements.btnGetGuidance.style.opacity = '0.7';
}

function hideLoadingState() {
  elements.loadingState.classList.add('hidden');
  elements.resultsContent.classList.remove('hidden');
  elements.btnGetGuidance.disabled = false;
  elements.btnGetGuidance.style.opacity = '1';
}

async function simulateLoadingStages() {
  const stages = [
    { text: "1/3: Reading issue & identifying legal domain...", progress: 35, delay: 350 },
    { text: "2/3: Searching Indian statutory acts, portals & dispute precedents...", progress: 70, delay: 450 },
    { text: "3/3: Formulating step-by-step action plan & drafting notice...", progress: 100, delay: 300 }
  ];

  for (const stage of stages) {
    elements.loadingStepText.textContent = stage.text;
    elements.loadingProgressFill.style.width = `${stage.progress}%`;
    await sleep(stage.delay);
  }
}

function scrollToResults() {
  elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Escape HTML to prevent injection
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
