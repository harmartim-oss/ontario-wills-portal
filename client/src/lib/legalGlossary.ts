/**
 * Comprehensive Legal Glossary for Ontario Estate Planning
 * Includes definitions, examples, and related terms for complex legal concepts
 */

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  plainEnglish: string;
  example?: string;
  relatedTerms?: string[];
  applicableDocuments: ("will" | "poa-property" | "poa-personal")[];
  category: "estate" | "beneficiary" | "executor" | "power" | "legal" | "tax" | "property";
  source?: string; // e.g., "Succession Law Reform Act"
}

export const legalGlossary: GlossaryTerm[] = [
  // Estate & Will Terms
  {
    id: "testator",
    term: "Testator",
    definition: "A person who makes a will or leaves a will at their death.",
    plainEnglish: "The person whose will is being created. This is you when you're creating your will.",
    example: "In a will, the testator is the person who decides how their property will be distributed.",
    applicableDocuments: ["will"],
    category: "estate",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "intestate",
    term: "Intestate",
    definition: "Dying without a valid will or leaving a will that does not dispose of all property.",
    plainEnglish: "When someone dies without a will, their estate is distributed according to Ontario law, not their wishes.",
    example: "If you die intestate in Ontario, your property goes to your spouse, children, or parents according to a fixed formula.",
    applicableDocuments: ["will"],
    category: "estate",
    source: "Succession Law Reform Act, s. 44",
  },
  {
    id: "estate",
    term: "Estate",
    definition: "All property, real and personal, that a person owns at the time of death.",
    plainEnglish: "Everything you own - your house, money, car, investments, and personal items.",
    example: "Your estate includes your home worth $500,000, savings of $100,000, and personal items.",
    applicableDocuments: ["will", "poa-property"],
    category: "estate",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "probate",
    term: "Probate",
    definition: "The legal process of proving a will is valid and administering the estate of a deceased person.",
    plainEnglish: "The court process that confirms your will is real and allows your executor to distribute your property.",
    example: "After you die, your will goes through probate, which typically takes 6-12 months.",
    applicableDocuments: ["will"],
    category: "legal",
    source: "Succession Law Reform Act, s. 1",
  },

  // Beneficiary Terms
  {
    id: "beneficiary",
    term: "Beneficiary",
    definition: "A person who receives property or benefits from a will, trust, or insurance policy.",
    plainEnglish: "Someone who receives money or property from your will.",
    example: "Your spouse, children, or charity can be beneficiaries in your will.",
    applicableDocuments: ["will"],
    category: "beneficiary",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "residuary-estate",
    term: "Residuary Estate",
    definition: "The property remaining after all debts, expenses, and specific bequests have been paid.",
    plainEnglish: "What's left of your estate after paying bills and giving away specific items.",
    example: "If your estate is $500,000, after paying $50,000 in debts and giving $100,000 to your sister, the residuary estate is $350,000.",
    applicableDocuments: ["will"],
    category: "estate",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "bequest",
    term: "Bequest",
    definition: "A gift of personal property (not real estate) made in a will.",
    plainEnglish: "When you leave something specific to someone in your will, like jewelry or a car.",
    example: "You can make a bequest of your grandmother's ring to your daughter.",
    applicableDocuments: ["will"],
    category: "beneficiary",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "devise",
    term: "Devise",
    definition: "A gift of real property (land or buildings) made in a will.",
    plainEnglish: "When you leave real estate (like your house or property) to someone in your will.",
    example: "You can devise your cottage to your son in your will.",
    applicableDocuments: ["will"],
    category: "beneficiary",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "per-stirpes",
    term: "Per Stirpes",
    definition: "Distribution of an estate by family lines; if a beneficiary dies, their share goes to their descendants.",
    plainEnglish: "If a child dies before you, their children (your grandchildren) inherit their share.",
    example: "If you leave your estate per stirpes to your three children, and one child dies, that child's share goes to their children.",
    applicableDocuments: ["will"],
    category: "beneficiary",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "per-capita",
    term: "Per Capita",
    definition: "Distribution of an estate equally among all living beneficiaries in the same generation.",
    plainEnglish: "Each person gets an equal share, regardless of whether their parent is alive or dead.",
    example: "If you leave your estate per capita to your three children, each gets one-third, even if one child's parent died.",
    applicableDocuments: ["will"],
    category: "beneficiary",
    source: "Succession Law Reform Act, s. 1",
  },

  // Executor & Trustee Terms
  {
    id: "executor",
    term: "Executor",
    definition: "A person appointed in a will to manage and distribute the estate according to the will's instructions.",
    plainEnglish: "The person responsible for carrying out your wishes after you die - paying bills, selling property, and giving money to beneficiaries.",
    example: "You might appoint your spouse or adult child as your executor.",
    applicableDocuments: ["will"],
    category: "executor",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "administrator",
    term: "Administrator",
    definition: "A person appointed by the court to manage an estate when there is no valid will or no executor.",
    plainEnglish: "Similar to an executor, but appointed by the court instead of named in a will.",
    example: "If you die without a will, the court appoints an administrator to manage your estate.",
    applicableDocuments: ["will"],
    category: "executor",
    source: "Succession Law Reform Act, s. 44",
  },
  {
    id: "trustee",
    term: "Trustee",
    definition: "A person who holds and manages property for the benefit of another person (the beneficiary).",
    plainEnglish: "Someone who manages money or property for someone else's benefit.",
    example: "A trustee might manage money in a trust for a child until they turn 18.",
    applicableDocuments: ["will"],
    category: "executor",
    source: "Succession Law Reform Act, s. 1",
  },
  {
    id: "guardian",
    term: "Guardian",
    definition: "A person appointed to care for minor children and manage their property.",
    plainEnglish: "The person who will raise your children if you and your spouse die.",
    example: "You might appoint your sister as guardian for your young children.",
    applicableDocuments: ["will"],
    category: "executor",
    source: "Children's Law Reform Act, s. 17",
  },

  // Power of Attorney Terms
  {
    id: "power-of-attorney",
    term: "Power of Attorney",
    definition: "A legal document that gives someone authority to act on your behalf.",
    plainEnglish: "A document that lets someone else make decisions or handle your affairs if you can't.",
    example: "You can give someone power of attorney to manage your property if you become ill.",
    applicableDocuments: ["poa-property", "poa-personal"],
    category: "power",
    source: "Power of Attorney Act, s. 1",
  },
  {
    id: "attorney-in-fact",
    term: "Attorney-in-Fact",
    definition: "A person appointed to act on behalf of another person under a power of attorney.",
    plainEnglish: "The person you choose to make decisions or handle your affairs for you.",
    example: "Your spouse or adult child can be your attorney-in-fact.",
    applicableDocuments: ["poa-property", "poa-personal"],
    category: "power",
    source: "Power of Attorney Act, s. 1",
  },
  {
    id: "durable-power-of-attorney",
    term: "Durable Power of Attorney",
    definition: "A power of attorney that remains valid even if you become mentally incapable.",
    plainEnglish: "A power of attorney that continues to work if you develop dementia or become unable to make decisions.",
    example: "A durable power of attorney ensures your attorney-in-fact can manage your affairs if you have a stroke.",
    applicableDocuments: ["poa-property", "poa-personal"],
    category: "power",
    source: "Power of Attorney Act, s. 1",
  },
  {
    id: "springing-power-of-attorney",
    term: "Springing Power of Attorney",
    definition: "A power of attorney that becomes effective only when a specific condition occurs (usually incapacity).",
    plainEnglish: "A power of attorney that only takes effect if you become unable to make decisions.",
    example: "Your power of attorney 'springs' into effect only if a doctor confirms you have dementia.",
    applicableDocuments: ["poa-property", "poa-personal"],
    category: "power",
    source: "Power of Attorney Act, s. 1",
  },
  {
    id: "capacity",
    term: "Capacity",
    definition: "The legal and mental ability to understand the nature and consequences of your decisions.",
    plainEnglish: "Being mentally able to understand what you're doing and make informed decisions.",
    example: "You must have capacity to create a valid will or power of attorney.",
    applicableDocuments: ["will", "poa-property", "poa-personal"],
    category: "legal",
    source: "Succession Law Reform Act, s. 1",
  },

  // Property & Asset Terms
  {
    id: "real-property",
    term: "Real Property",
    definition: "Land and buildings, including houses, cottages, and commercial property.",
    plainEnglish: "Your house, land, or any buildings you own.",
    example: "Your home and cottage are real property.",
    applicableDocuments: ["will", "poa-property"],
    category: "property",
    source: "Real Property Act",
  },
  {
    id: "personal-property",
    term: "Personal Property",
    definition: "Movable property that is not real estate, such as money, vehicles, jewelry, and furniture.",
    plainEnglish: "Everything you own that isn't real estate - your car, jewelry, furniture, and money.",
    example: "Your car, jewelry, and bank account are personal property.",
    applicableDocuments: ["will", "poa-property"],
    category: "property",
    source: "Personal Property Security Act",
  },
  {
    id: "joint-tenancy",
    term: "Joint Tenancy",
    definition: "Ownership of property by two or more people with right of survivorship.",
    plainEnglish: "When you own property with someone else, and if you die, they automatically own it all.",
    example: "Many couples own their home as joint tenants.",
    applicableDocuments: ["will", "poa-property"],
    category: "property",
    source: "Conveyancing and Law of Property Act, s. 53",
  },
  {
    id: "tenancy-in-common",
    term: "Tenancy in Common",
    definition: "Ownership of property by two or more people without right of survivorship.",
    plainEnglish: "When you own property with someone else, but your share goes to your estate when you die, not to them.",
    example: "Business partners might own commercial property as tenants in common.",
    applicableDocuments: ["will", "poa-property"],
    category: "property",
    source: "Conveyancing and Law of Property Act, s. 53",
  },

  // Tax & Legal Terms
  {
    id: "probate-fee",
    term: "Probate Fee",
    definition: "A fee charged by the court for the probate process, calculated as a percentage of the estate value.",
    plainEnglish: "A fee the court charges to process your will, usually 1-1.5% of your estate.",
    example: "On a $500,000 estate, probate fees might be $5,000-$7,500.",
    applicableDocuments: ["will"],
    category: "tax",
    source: "Administration of Justice Act, s. 1",
  },
  {
    id: "capital-gains",
    term: "Capital Gains",
    definition: "The profit from selling an asset for more than you paid for it.",
    plainEnglish: "The profit you make when you sell something for more than you bought it for.",
    example: "If you bought a stock for $100 and sold it for $150, your capital gain is $50.",
    applicableDocuments: ["will"],
    category: "tax",
    source: "Income Tax Act, s. 38",
  },
  {
    id: "deemed-disposition",
    term: "Deemed Disposition",
    definition: "A tax concept where property is considered sold at fair market value when you die.",
    plainEnglish: "For tax purposes, the government treats your property as if it was sold when you die.",
    example: "If you own a cottage worth $300,000 when you die, capital gains tax may apply.",
    applicableDocuments: ["will"],
    category: "tax",
    source: "Income Tax Act, s. 69",
  },
  {
    id: "spousal-exemption",
    term: "Spousal Exemption",
    definition: "A tax rule that allows property to pass to a spouse without triggering capital gains tax.",
    plainEnglish: "When you leave property to your spouse, there's usually no capital gains tax.",
    example: "You can leave your investment portfolio to your spouse tax-free.",
    applicableDocuments: ["will"],
    category: "tax",
    source: "Income Tax Act, s. 70(6)",
  },

  // Healthcare & Personal Care Terms
  {
    id: "substitute-decision-maker",
    term: "Substitute Decision Maker",
    definition: "A person appointed to make healthcare decisions for someone who cannot make them.",
    plainEnglish: "Someone who makes medical decisions for you if you can't.",
    example: "Your substitute decision maker can decide on surgery or treatment if you're in a coma.",
    applicableDocuments: ["poa-personal"],
    category: "power",
    source: "Health Care Consent Act, s. 1",
  },
  {
    id: "capable",
    term: "Capable",
    definition: "Able to understand information relevant to making a decision about your personal care.",
    plainEnglish: "Being able to understand medical information and make healthcare decisions.",
    example: "You're capable if you understand what a surgery involves and can decide yes or no.",
    applicableDocuments: ["poa-personal"],
    category: "legal",
    source: "Health Care Consent Act, s. 1",
  },
  {
    id: "incapable",
    term: "Incapable",
    definition: "Unable to understand information relevant to making a decision about your personal care.",
    plainEnglish: "Not being able to understand medical information or make healthcare decisions.",
    example: "Someone with advanced dementia might be incapable of making healthcare decisions.",
    applicableDocuments: ["poa-personal"],
    category: "legal",
    source: "Health Care Consent Act, s. 1",
  },
  {
    id: "advance-directive",
    term: "Advance Directive",
    definition: "Instructions about your healthcare preferences if you become unable to communicate.",
    plainEnglish: "Written instructions about what medical care you want or don't want.",
    example: "An advance directive might say you don't want life support if you're in a permanent coma.",
    applicableDocuments: ["poa-personal"],
    category: "power",
    source: "Health Care Consent Act, s. 1",
  },
  {
    id: "living-will",
    term: "Living Will",
    definition: "A document expressing your wishes about end-of-life medical care.",
    plainEnglish: "A document that says what medical treatment you want or don't want at the end of your life.",
    example: "A living will might say you don't want CPR or artificial breathing.",
    applicableDocuments: ["poa-personal"],
    category: "power",
    source: "Health Care Consent Act, s. 1",
  },

  // Specific Ontario Terms
  {
    id: "succession-law-reform-act",
    term: "Succession Law Reform Act",
    definition: "The main Ontario law governing wills, estates, and intestacy.",
    plainEnglish: "The Ontario law that controls how wills work and what happens if you die without a will.",
    example: "The Succession Law Reform Act says you need two witnesses for a valid will.",
    applicableDocuments: ["will"],
    category: "legal",
    source: "Succession Law Reform Act, R.S.O. 1990, c. S.26",
  },
  {
    id: "power-of-attorney-act",
    term: "Power of Attorney Act",
    definition: "The Ontario law governing powers of attorney for property.",
    plainEnglish: "The Ontario law that controls how powers of attorney for managing property work.",
    example: "The Power of Attorney Act requires specific language for a durable power of attorney.",
    applicableDocuments: ["poa-property"],
    category: "legal",
    source: "Power of Attorney Act, R.S.O. 1990, c. P.20",
  },
  {
    id: "health-care-consent-act",
    term: "Health Care Consent Act",
    definition: "The Ontario law governing healthcare decisions and substitute decision makers.",
    plainEnglish: "The Ontario law that controls who can make medical decisions for you.",
    example: "The Health Care Consent Act says your power of attorney for personal care can make healthcare decisions.",
    applicableDocuments: ["poa-personal"],
    category: "legal",
    source: "Health Care Consent Act, S.O. 1996, c. 2",
  },
];

/**
 * Get a glossary term by ID
 */
export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return legalGlossary.find(term => term.id === id);
}

/**
 * Get all terms for a specific document type
 */
export function getTermsByDocumentType(documentType: "will" | "poa-property" | "poa-personal"): GlossaryTerm[] {
  return legalGlossary.filter(term => term.applicableDocuments.includes(documentType));
}

/**
 * Search glossary terms
 */
export function searchGlossary(query: string): GlossaryTerm[] {
  const lowercaseQuery = query.toLowerCase();
  return legalGlossary.filter(term =>
    term.term.toLowerCase().includes(lowercaseQuery) ||
    term.definition.toLowerCase().includes(lowercaseQuery) ||
    term.plainEnglish.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get related terms
 */
export function getRelatedTerms(termId: string): GlossaryTerm[] {
  const term = getGlossaryTerm(termId);
  if (!term || !term.relatedTerms) return [];
  
  return term.relatedTerms
    .map(id => getGlossaryTerm(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
