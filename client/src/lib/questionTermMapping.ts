/**
 * Maps document creation questions to relevant legal terms
 * This enables contextual tooltips during the document creation process
 */

export interface QuestionTermMapping {
  questionId: string;
  terms: string[]; // Array of glossary term IDs
  highlightedPhrase?: string; // Specific phrase in the question to highlight
}

export const questionTermMappings: QuestionTermMapping[] = [
  // Will Questions
  {
    questionId: "will-testator-name",
    terms: ["testator"],
    highlightedPhrase: "testator",
  },
  {
    questionId: "will-marital-status",
    terms: ["estate", "beneficiary"],
    highlightedPhrase: "marital status",
  },
  {
    questionId: "will-children",
    terms: ["beneficiary", "per-stirpes", "per-capita"],
    highlightedPhrase: "children",
  },
  {
    questionId: "will-executor",
    terms: ["executor", "administrator"],
    highlightedPhrase: "executor",
  },
  {
    questionId: "will-guardian",
    terms: ["guardian"],
    highlightedPhrase: "guardian",
  },
  {
    questionId: "will-primary-beneficiary",
    terms: ["beneficiary", "bequest", "devise"],
    highlightedPhrase: "primary beneficiary",
  },
  {
    questionId: "will-alternate-executor",
    terms: ["executor", "administrator"],
    highlightedPhrase: "alternate executor",
  },
  {
    questionId: "will-estate-value",
    terms: ["estate", "probate-fee", "capital-gains"],
    highlightedPhrase: "estate value",
  },
  {
    questionId: "will-residuary-estate",
    terms: ["residuary-estate", "bequest"],
    highlightedPhrase: "residuary estate",
  },
  {
    questionId: "will-property-ownership",
    terms: ["real-property", "personal-property", "joint-tenancy", "tenancy-in-common"],
    highlightedPhrase: "property ownership",
  },
  {
    questionId: "will-intestate-planning",
    terms: ["intestate", "succession-law-reform-act"],
    highlightedPhrase: "intestate",
  },
  {
    questionId: "will-capacity",
    terms: ["capacity", "testator"],
    highlightedPhrase: "capacity",
  },
  {
    questionId: "will-probate",
    terms: ["probate", "probate-fee", "executor"],
    highlightedPhrase: "probate",
  },
  {
    questionId: "will-capital-gains",
    terms: ["capital-gains", "deemed-disposition", "spousal-exemption"],
    highlightedPhrase: "capital gains",
  },

  // POA Property Questions
  {
    questionId: "poa-property-attorney",
    terms: ["attorney-in-fact", "power-of-attorney"],
    highlightedPhrase: "attorney-in-fact",
  },
  {
    questionId: "poa-property-durable",
    terms: ["durable-power-of-attorney", "capacity"],
    highlightedPhrase: "durable",
  },
  {
    questionId: "poa-property-springing",
    terms: ["springing-power-of-attorney", "incapable"],
    highlightedPhrase: "springing",
  },
  {
    questionId: "poa-property-real-estate",
    terms: ["real-property", "power-of-attorney-act"],
    highlightedPhrase: "real estate",
  },
  {
    questionId: "poa-property-financial",
    terms: ["personal-property", "attorney-in-fact"],
    highlightedPhrase: "financial accounts",
  },
  {
    questionId: "poa-property-investments",
    terms: ["capital-gains", "attorney-in-fact"],
    highlightedPhrase: "investments",
  },

  // POA Personal Care Questions
  {
    questionId: "poa-personal-substitute-decision",
    terms: ["substitute-decision-maker", "power-of-attorney"],
    highlightedPhrase: "substitute decision maker",
  },
  {
    questionId: "poa-personal-capable",
    terms: ["capable", "incapable", "health-care-consent-act"],
    highlightedPhrase: "capable",
  },
  {
    questionId: "poa-personal-advance-directive",
    terms: ["advance-directive", "living-will"],
    highlightedPhrase: "advance directive",
  },
  {
    questionId: "poa-personal-healthcare-decisions",
    terms: ["substitute-decision-maker", "capable"],
    highlightedPhrase: "healthcare decisions",
  },
  {
    questionId: "poa-personal-life-support",
    terms: ["living-will", "advance-directive"],
    highlightedPhrase: "life support",
  },
];

/**
 * Get terms for a specific question
 */
export function getTermsForQuestion(questionId: string): string[] {
  const mapping = questionTermMappings.find(m => m.questionId === questionId);
  return mapping?.terms || [];
}

/**
 * Get highlighted phrase for a question
 */
export function getHighlightedPhrase(questionId: string): string | undefined {
  const mapping = questionTermMappings.find(m => m.questionId === questionId);
  return mapping?.highlightedPhrase;
}

/**
 * Check if a question has associated terms
 */
export function hasTerms(questionId: string): boolean {
  return getTermsForQuestion(questionId).length > 0;
}
