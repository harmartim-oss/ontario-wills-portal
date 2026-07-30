/**
 * Document Templates Service
 * Provides pre-built templates for common estate planning scenarios
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'simple' | 'blended' | 'business' | 'complex';
  documentType: 'will' | 'poa-property' | 'poa-personal';
  estimatedTime: number; // in minutes
  complexity: 'beginner' | 'intermediate' | 'advanced';
  questions: TemplateQuestion[];
  preFilledAnswers: Record<string, unknown>;
}

export interface TemplateQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: unknown;
  hint?: string;
}

/**
 * Simple Estate Template
 * For individuals with straightforward estates and clear succession plans
 */
export const simpleEstateTemplate: DocumentTemplate = {
  id: 'simple-estate',
  name: 'Simple Estate',
  description: 'Perfect for individuals with straightforward estates and clear succession plans. Includes basic will provisions and simple POA documents.',
  category: 'simple',
  documentType: 'will',
  estimatedTime: 15,
  complexity: 'beginner',
  questions: [
    {
      id: 'spouse',
      question: 'Are you married or in a common-law partnership?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'children',
      question: 'Do you have children?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'childrenCount',
      question: 'How many children do you have?',
      type: 'number',
      required: false,
      hint: 'Enter the number of children',
    },
    {
      id: 'executor',
      question: 'Who would you like to name as executor?',
      type: 'text',
      required: true,
      hint: 'Usually a spouse, adult child, or trusted friend',
    },
    {
      id: 'guardians',
      question: 'Do you have minor children?',
      type: 'checkbox',
      required: false,
    },
    {
      id: 'guardianName',
      question: 'Who would you like to name as guardian?',
      type: 'text',
      required: false,
      hint: 'For minor children',
    },
  ],
  preFilledAnswers: {
    jurisdiction: 'Ontario',
    language: 'English',
  },
};

/**
 * Blended Family Template
 * For individuals with children from previous relationships
 */
export const blendedFamilyTemplate: DocumentTemplate = {
  id: 'blended-family',
  name: 'Blended Family',
  description: 'Designed for blended families with children from previous relationships. Includes provisions for protecting each child\'s inheritance.',
  category: 'blended',
  documentType: 'will',
  estimatedTime: 25,
  complexity: 'intermediate',
  questions: [
    {
      id: 'currentSpouse',
      question: 'Are you currently married or in a common-law partnership?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'currentSpouseName',
      question: 'What is your spouse\'s name?',
      type: 'text',
      required: false,
    },
    {
      id: 'childrenFromCurrent',
      question: 'Do you have children with your current spouse?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'childrenFromPrevious',
      question: 'Do you have children from previous relationships?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'childrenCount',
      question: 'Total number of children (from all relationships)',
      type: 'number',
      required: true,
    },
    {
      id: 'separateProperty',
      question: 'Do you want to protect separate property for your children from previous relationships?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'executor',
      question: 'Who would you like to name as executor?',
      type: 'text',
      required: true,
      hint: 'Consider someone neutral or a professional',
    },
    {
      id: 'trustee',
      question: 'Would you like to establish a trust for your children\'s inheritance?',
      type: 'checkbox',
      required: false,
    },
    {
      id: 'trusteeName',
      question: 'Who would you like to name as trustee?',
      type: 'text',
      required: false,
    },
  ],
  preFilledAnswers: {
    jurisdiction: 'Ontario',
    language: 'English',
    trustConsideration: true,
  },
};

/**
 * Business Owner Template
 * For business owners with complex assets and succession planning needs
 */
export const businessOwnerTemplate: DocumentTemplate = {
  id: 'business-owner',
  name: 'Business Owner',
  description: 'Tailored for business owners with complex assets. Includes business succession planning and tax optimization strategies.',
  category: 'business',
  documentType: 'will',
  estimatedTime: 35,
  complexity: 'advanced',
  questions: [
    {
      id: 'businessType',
      question: 'What type of business do you own?',
      type: 'select',
      required: true,
      options: ['Sole Proprietorship', 'Partnership', 'Corporation', 'LLC', 'Other'],
    },
    {
      id: 'businessValue',
      question: 'Approximate value of your business (in CAD)',
      type: 'number',
      required: true,
    },
    {
      id: 'businessPartners',
      question: 'Do you have business partners?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'partnerCount',
      question: 'How many partners?',
      type: 'number',
      required: false,
    },
    {
      id: 'successorInBusiness',
      question: 'Do you want a family member to take over the business?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'successorName',
      question: 'Who would you like to succeed you?',
      type: 'text',
      required: false,
    },
    {
      id: 'businessInsurance',
      question: 'Do you have key person insurance or buy-sell agreements?',
      type: 'checkbox',
      required: true,
    },
    {
      id: 'otherAssets',
      question: 'Approximate total value of other assets (real estate, investments, etc.)',
      type: 'number',
      required: true,
    },
    {
      id: 'executor',
      question: 'Who would you like to name as executor?',
      type: 'text',
      required: true,
      hint: 'Consider someone with business experience',
    },
    {
      id: 'accountant',
      question: 'Would you like to name your accountant or lawyer as executor?',
      type: 'checkbox',
      required: false,
    },
  ],
  preFilledAnswers: {
    jurisdiction: 'Ontario',
    language: 'English',
    taxPlanning: true,
  },
};

/**
 * Get all available templates
 */
export function getAllTemplates(): DocumentTemplate[] {
  return [
    simpleEstateTemplate,
    blendedFamilyTemplate,
    businessOwnerTemplate,
  ];
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): DocumentTemplate | undefined {
  const templates = getAllTemplates();
  return templates.find(t => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Get templates by complexity level
 */
export function getTemplatesByComplexity(complexity: DocumentTemplate['complexity']): DocumentTemplate[] {
  return getAllTemplates().filter(t => t.complexity === complexity);
}

/**
 * Get templates by document type
 */
export function getTemplatesByDocumentType(documentType: DocumentTemplate['documentType']): DocumentTemplate[] {
  return getAllTemplates().filter(t => t.documentType === documentType);
}

/**
 * Apply template answers to create a pre-filled form
 */
export function applyTemplate(templateId: string, userAnswers: Record<string, unknown> = {}) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  return {
    template,
    answers: {
      ...template.preFilledAnswers,
      ...userAnswers,
    },
    questions: template.questions,
  };
}

/**
 * Validate template answers
 */
export function validateTemplateAnswers(
  templateId: string,
  answers: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const template = getTemplateById(templateId);
  if (!template) {
    return {
      valid: false,
      errors: [`Template not found: ${templateId}`],
    };
  }

  const errors: string[] = [];

  for (const question of template.questions) {
    if (question.required && !answers[question.id]) {
      errors.push(`Required field missing: ${question.question}`);
    }

    if (answers[question.id] !== undefined) {
      const value = answers[question.id];

      // Type validation
      switch (question.type) {
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Invalid type for ${question.question}: expected number`);
          }
          break;
        case 'date':
          if (!(value instanceof Date) && typeof value !== 'string') {
            errors.push(`Invalid type for ${question.question}: expected date`);
          }
          break;
        case 'select':
        case 'multiselect':
          if (question.options && !question.options.includes(String(value))) {
            errors.push(`Invalid option for ${question.question}`);
          }
          break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
