/**
 * Enhanced Question Framework with Conditional Logic
 * Supports smart follow-ups, validation, and progressive disclosure
 */

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value?: any;
  action: 'show' | 'hide' | 'require' | 'optional';
}

export interface EnhancedQuestion {
  id: number;
  section: string;
  question: string;
  field: string;
  type: 'text' | 'date' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'multiselect';
  options?: string[];
  required: boolean;
  tier: 'basic' | 'advanced';
  helpText?: string;
  legalNote?: string;
  
  // New enhanced properties
  conditionalRules?: ConditionalRule[];
  followUpQuestions?: number[]; // IDs of questions to ask if this is answered
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    customValidator?: (value: any) => boolean;
    errorMessage?: string;
  };
  relatedDocuments?: string[]; // Links to legal resources
  examples?: string[];
  estimatedTime?: number; // seconds to answer
}

export interface QuestionContext {
  documentType: 'will' | 'poa-property' | 'poa-personal-care';
  userTier: 'basic' | 'advanced';
  answers: Record<string, any>;
  completedQuestions: number[];
}

// ============================================================================
// ENHANCED WILL QUESTIONS WITH CONDITIONAL LOGIC
// ============================================================================

export const ENHANCED_WILL_QUESTIONS: EnhancedQuestion[] = [
  // SECTION 1: TESTATOR INFORMATION
  {
    id: 1,
    section: 'Testator Information',
    question: 'What is your full legal name (including any maiden names, aliases, or names you\'ve been known by)?',
    field: 'testatorFullName',
    type: 'text',
    required: true,
    tier: 'basic',
    legalNote: 'Required for will validity under Succession Law Reform Act',
    validation: {
      minLength: 2,
      maxLength: 100,
      errorMessage: 'Please enter a valid name (2-100 characters)',
    },
    examples: ['John Michael Smith', 'Mary Jane Doe (formerly Johnson)'],
    estimatedTime: 30,
  },
  {
    id: 2,
    section: 'Testator Information',
    question: 'What is your date of birth?',
    field: 'testatorDateOfBirth',
    type: 'date',
    required: true,
    tier: 'basic',
    legalNote: 'Confirms testator is of legal age (18+) as required by law',
    validation: {
      customValidator: (value: any) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age >= 18;
      },
      errorMessage: 'You must be at least 18 years old to create a will',
    },
    estimatedTime: 30,
  },
  {
    id: 3,
    section: 'Testator Information',
    question: 'What is your current residential address in Ontario?',
    field: 'testatorAddress',
    type: 'textarea',
    required: true,
    tier: 'basic',
    helpText: 'Include street address, city, province, and postal code',
    legalNote: 'Establishes Ontario jurisdiction for will execution',
    validation: {
      minLength: 10,
      errorMessage: 'Please enter a complete address',
    },
    examples: ['123 Main Street, Toronto, ON M5H 2N2'],
    estimatedTime: 45,
  },
  {
    id: 4,
    section: 'Testator Information',
    question: 'Are you currently married or in a common-law partnership?',
    field: 'maritalStatus',
    type: 'select',
    options: ['Single', 'Married', 'Common-law partnership', 'Divorced', 'Widowed'],
    required: true,
    tier: 'basic',
    legalNote: 'Marital status affects spousal entitlements under the Succession Law Reform Act',
    followUpQuestions: [5, 6, 7],
    estimatedTime: 30,
  },
  {
    id: 5,
    section: 'Testator Information',
    question: 'If married or in a common-law partnership, what is your spouse\'s full name?',
    field: 'spouseName',
    type: 'text',
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'maritalStatus',
        operator: 'equals',
        value: 'Married',
        action: 'require',
      },
      {
        field: 'maritalStatus',
        operator: 'equals',
        value: 'Common-law partnership',
        action: 'require',
      },
    ],
    legalNote: 'Spouse\'s name is required for proper will execution',
    estimatedTime: 30,
  },
  {
    id: 6,
    section: 'Testator Information',
    question: 'Do you have any children (biological, adopted, or step-children)?',
    field: 'hasChildren',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    tier: 'basic',
    legalNote: 'Children may have entitlements under the Succession Law Reform Act',
    followUpQuestions: [8, 9, 10],
    estimatedTime: 30,
  },
  {
    id: 7,
    section: 'Testator Information',
    question: 'Have you been previously married or in a common-law partnership?',
    field: 'previousMarriage',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    tier: 'basic',
    legalNote: 'Previous relationships may affect estate planning',
    followUpQuestions: [11],
    estimatedTime: 30,
  },

  // SECTION 2: CHILDREN & DEPENDENTS
  {
    id: 8,
    section: 'Children & Dependents',
    question: 'How many children do you have?',
    field: 'numberOfChildren',
    type: 'number',
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'hasChildren',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    validation: {
      minLength: 1,
      maxLength: 2,
      errorMessage: 'Please enter a valid number',
    },
    estimatedTime: 20,
  },
  {
    id: 9,
    section: 'Children & Dependents',
    question: 'List the names and dates of birth of all your children:',
    field: 'childrenDetails',
    type: 'textarea',
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'hasChildren',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'Format: Name (DOB: YYYY-MM-DD), one per line',
    examples: ['John Smith (DOB: 1995-03-15)', 'Sarah Smith (DOB: 1998-07-22)'],
    estimatedTime: 60,
  },
  {
    id: 10,
    section: 'Children & Dependents',
    question: 'Are any of your children minors (under 18)?',
    field: 'hasMinorChildren',
    type: 'select',
    options: ['Yes', 'No'],
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'hasChildren',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    legalNote: 'Minor children require a guardian appointment in your will',
    followUpQuestions: [12, 13],
    estimatedTime: 30,
  },
  {
    id: 11,
    section: 'Children & Dependents',
    question: 'Do you have any children from previous relationships?',
    field: 'childrenFromPreviousRelationship',
    type: 'select',
    options: ['Yes', 'No'],
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'previousMarriage',
        operator: 'equals',
        value: 'Yes',
        action: 'show',
      },
    ],
    legalNote: 'These children may have legal rights to your estate',
    followUpQuestions: [9],
    estimatedTime: 30,
  },

  // SECTION 3: GUARDIANSHIP
  {
    id: 12,
    section: 'Guardianship',
    question: 'Who would you like to appoint as guardian for your minor children?',
    field: 'primaryGuardian',
    type: 'text',
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'hasMinorChildren',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    legalNote: 'Guardian appointment is legally binding and critical for minor protection',
    helpText: 'This person will have custody and decision-making authority',
    estimatedTime: 60,
  },
  {
    id: 13,
    section: 'Guardianship',
    question: 'Who would you like to appoint as alternate guardian?',
    field: 'alternateGuardian',
    type: 'text',
    required: false,
    tier: 'basic',
    conditionalRules: [
      {
        field: 'hasMinorChildren',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'In case the primary guardian is unable to serve',
    estimatedTime: 45,
  },

  // SECTION 4: ESTATE & ASSETS
  {
    id: 14,
    section: 'Estate & Assets',
    question: 'What is the approximate total value of your estate?',
    field: 'estateValue',
    type: 'select',
    options: ['Under $50,000', '$50,000 - $100,000', '$100,000 - $250,000', '$250,000 - $500,000', 'Over $500,000'],
    required: true,
    tier: 'basic',
    legalNote: 'Estate value may affect tax planning and probate fees',
    followUpQuestions: [15, 16],
    estimatedTime: 45,
  },
  {
    id: 15,
    section: 'Estate & Assets',
    question: 'Do you own real property (house, land, rental property)?',
    field: 'ownsRealProperty',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    tier: 'basic',
    followUpQuestions: [17],
    estimatedTime: 30,
  },
  {
    id: 16,
    section: 'Estate & Assets',
    question: 'Do you have any significant debts (mortgage, loans, credit cards)?',
    field: 'hasDebts',
    type: 'select',
    options: ['Yes', 'No'],
    required: true,
    tier: 'basic',
    legalNote: 'Debts must be paid from the estate before distribution to beneficiaries',
    followUpQuestions: [18],
    estimatedTime: 30,
  },
  {
    id: 17,
    section: 'Estate & Assets',
    question: 'Describe your real property (address, type, estimated value):',
    field: 'realPropertyDetails',
    type: 'textarea',
    required: false,
    tier: 'advanced',
    conditionalRules: [
      {
        field: 'ownsRealProperty',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'Include property address, type (house/condo/land), and approximate market value',
    estimatedTime: 90,
  },
  {
    id: 18,
    section: 'Estate & Assets',
    question: 'Describe your significant debts:',
    field: 'debtDetails',
    type: 'textarea',
    required: false,
    tier: 'advanced',
    conditionalRules: [
      {
        field: 'hasDebts',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'Include type of debt, creditor, amount, and monthly payment',
    estimatedTime: 60,
  },

  // SECTION 5: EXECUTOR & TRUSTEES
  {
    id: 19,
    section: 'Executor & Trustees',
    question: 'Who would you like to appoint as your primary executor?',
    field: 'primaryExecutor',
    type: 'text',
    required: true,
    tier: 'basic',
    legalNote: 'The executor manages your estate and distributes assets according to your will',
    helpText: 'Choose someone you trust completely - this is a significant responsibility',
    estimatedTime: 60,
  },
  {
    id: 20,
    section: 'Executor & Trustees',
    question: 'Who would you like to appoint as alternate executor?',
    field: 'alternateExecutor',
    type: 'text',
    required: true,
    tier: 'basic',
    helpText: 'In case the primary executor is unable or unwilling to serve',
    estimatedTime: 45,
  },
  {
    id: 21,
    section: 'Executor & Trustees',
    question: 'Should your executor receive compensation for their work?',
    field: 'executorCompensation',
    type: 'select',
    options: ['No compensation', 'Statutory fee (as per Succession Law Reform Act)', 'Fixed amount', 'Percentage of estate'],
    required: true,
    tier: 'advanced',
    legalNote: 'Executor compensation is tax-deductible from the estate',
    followUpQuestions: [22],
    estimatedTime: 45,
  },
  {
    id: 22,
    section: 'Executor & Trustees',
    question: 'If fixed compensation, what amount should the executor receive?',
    field: 'executorCompensationAmount',
    type: 'number',
    required: false,
    tier: 'advanced',
    conditionalRules: [
      {
        field: 'executorCompensation',
        operator: 'equals',
        value: 'Fixed amount',
        action: 'require',
      },
    ],
    estimatedTime: 30,
  },

  // SECTION 6: BENEFICIARIES
  {
    id: 23,
    section: 'Beneficiaries',
    question: 'Who are your primary beneficiaries (who should receive your estate)?',
    field: 'primaryBeneficiaries',
    type: 'textarea',
    required: true,
    tier: 'basic',
    helpText: 'List names, relationships, and what percentage/amount each should receive',
    examples: ['John Smith (spouse) - 50%', 'Sarah Smith (daughter) - 25%', 'Michael Smith (son) - 25%'],
    estimatedTime: 90,
  },
  {
    id: 24,
    section: 'Beneficiaries',
    question: 'Are there any specific gifts or bequests?',
    field: 'specificBequests',
    type: 'textarea',
    required: false,
    tier: 'basic',
    helpText: 'e.g., "My diamond ring to my daughter Sarah", "My car to my nephew John"',
    examples: ['My diamond engagement ring to my daughter Sarah', 'My vintage watch to my son Michael'],
    estimatedTime: 60,
  },
  {
    id: 25,
    section: 'Beneficiaries',
    question: 'Who should receive your estate if your primary beneficiaries predecease you?',
    field: 'contingentBeneficiaries',
    type: 'textarea',
    required: true,
    tier: 'basic',
    legalNote: 'Contingent beneficiaries ensure your estate is distributed according to your wishes',
    helpText: 'List names, relationships, and distribution percentages',
    estimatedTime: 60,
  },
  {
    id: 26,
    section: 'Beneficiaries',
    question: 'Are there any people you specifically want to exclude from your will?',
    field: 'excludedBeneficiaries',
    type: 'textarea',
    required: false,
    tier: 'advanced',
    helpText: 'Explicitly excluding someone can prevent legal challenges',
    estimatedTime: 45,
  },

  // SECTION 7: SPECIAL PROVISIONS
  {
    id: 27,
    section: 'Special Provisions',
    question: 'Do you want to establish a trust for any beneficiary?',
    field: 'hasTrust',
    type: 'select',
    options: ['Yes', 'No'],
    required: false,
    tier: 'advanced',
    legalNote: 'Trusts can provide asset protection and tax benefits',
    followUpQuestions: [28, 29],
    estimatedTime: 60,
  },
  {
    id: 28,
    section: 'Special Provisions',
    question: 'Describe the trust arrangement (beneficiary, terms, trustee):',
    field: 'trustDetails',
    type: 'textarea',
    required: false,
    tier: 'advanced',
    conditionalRules: [
      {
        field: 'hasTrust',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'Include who manages the trust, when beneficiaries receive funds, and any conditions',
    estimatedTime: 120,
  },
  {
    id: 29,
    section: 'Special Provisions',
    question: 'Do you have any charitable donations you want to include?',
    field: 'hasCharitableDonations',
    type: 'select',
    options: ['Yes', 'No'],
    required: false,
    tier: 'advanced',
    legalNote: 'Charitable donations may provide tax benefits to your estate',
    followUpQuestions: [30],
    estimatedTime: 45,
  },
  {
    id: 30,
    section: 'Special Provisions',
    question: 'Describe your charitable donations:',
    field: 'charitableDonationDetails',
    type: 'textarea',
    required: false,
    tier: 'advanced',
    conditionalRules: [
      {
        field: 'hasCharitableDonations',
        operator: 'equals',
        value: 'Yes',
        action: 'require',
      },
    ],
    helpText: 'Include charity name, amount or percentage, and any conditions',
    estimatedTime: 60,
  },
];

// ============================================================================
// UTILITY FUNCTIONS FOR CONDITIONAL QUESTION LOGIC
// ============================================================================

/**
 * Evaluate if a question should be shown based on conditional rules
 */
export function shouldShowQuestion(
  question: EnhancedQuestion,
  context: QuestionContext
): boolean {
  if (!question.conditionalRules || question.conditionalRules.length === 0) {
    return true;
  }

  return question.conditionalRules.every((rule) => {
    const fieldValue = context.answers[rule.field];

    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value ? rule.action !== 'hide' : rule.action === 'hide';
      case 'contains':
        return String(fieldValue).includes(String(rule.value)) ? rule.action !== 'hide' : rule.action === 'hide';
      case 'greaterThan':
        return Number(fieldValue) > rule.value ? rule.action !== 'hide' : rule.action === 'hide';
      case 'lessThan':
        return Number(fieldValue) < rule.value ? rule.action !== 'hide' : rule.action === 'hide';
      case 'isEmpty':
        return !fieldValue ? rule.action !== 'hide' : rule.action === 'hide';
      case 'isNotEmpty':
        return fieldValue ? rule.action !== 'hide' : rule.action === 'hide';
      default:
        return true;
    }
  });
}

/**
 * Get the next questions to ask based on follow-ups
 */
export function getFollowUpQuestions(
  questionId: number,
  allQuestions: EnhancedQuestion[]
): EnhancedQuestion[] {
  const question = allQuestions.find((q) => q.id === questionId);
  if (!question || !question.followUpQuestions) {
    return [];
  }

  return question.followUpQuestions
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q) => q !== undefined) as EnhancedQuestion[];
}

/**
 * Get visible questions based on context
 */
export function getVisibleQuestions(
  questions: EnhancedQuestion[],
  context: QuestionContext
): EnhancedQuestion[] {
  return questions.filter((question) => {
    // Filter by tier
    if (question.tier === 'advanced' && context.userTier === 'basic') {
      return false;
    }

    // Filter by conditional rules
    return shouldShowQuestion(question, context);
  });
}

/**
 * Validate an answer against question requirements
 */
export function validateAnswer(
  question: EnhancedQuestion,
  value: any
): { valid: boolean; error?: string } {
  // Check required
  if (question.required && (!value || value === '')) {
    return { valid: false, error: 'This field is required' };
  }

  // Skip validation for empty optional fields
  if (!question.required && (!value || value === '')) {
    return { valid: true };
  }

  // Check validation rules
  if (question.validation) {
    const { pattern, minLength, maxLength, customValidator, errorMessage } = question.validation;

    if (pattern && !pattern.test(String(value))) {
      return { valid: false, error: errorMessage || 'Invalid format' };
    }

    if (minLength && String(value).length < minLength) {
      return { valid: false, error: errorMessage || `Minimum ${minLength} characters required` };
    }

    if (maxLength && String(value).length > maxLength) {
      return { valid: false, error: errorMessage || `Maximum ${maxLength} characters allowed` };
    }

    if (customValidator && !customValidator(value)) {
      return { valid: false, error: errorMessage || 'Invalid value' };
    }
  }

  return { valid: true };
}

/**
 * Calculate progress based on answered questions
 */
export function calculateProgress(
  context: QuestionContext,
  allQuestions: EnhancedQuestion[]
): { completed: number; total: number; percentage: number } {
  const visibleQuestions = getVisibleQuestions(allQuestions, context);
  const completed = context.completedQuestions.length;
  const total = visibleQuestions.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
