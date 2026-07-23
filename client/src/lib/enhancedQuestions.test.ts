import { describe, it, expect } from 'vitest';
import {
  shouldShowQuestion,
  getFollowUpQuestions,
  getVisibleQuestions,
  validateAnswer,
  calculateProgress,
  ENHANCED_WILL_QUESTIONS,
} from './enhancedQuestions';
import { validateDocumentAnswers } from './documentValidation';

describe('Enhanced Questions Framework', () => {
  describe('shouldShowQuestion', () => {
    it('should show question with no conditional rules', () => {
      const question = ENHANCED_WILL_QUESTIONS[0]; // testatorFullName
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: {},
        completedQuestions: [],
      };

      expect(shouldShowQuestion(question, context)).toBe(true);
    });

    it('should show question when conditional rule matches', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'spouseName');
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: { maritalStatus: 'Married' },
        completedQuestions: [],
      };

      expect(shouldShowQuestion(question!, context)).toBe(true);
    });

    it('should hide question when conditional rule does not match', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'spouseName');
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: { maritalStatus: 'Single' },
        completedQuestions: [],
      };

      expect(shouldShowQuestion(question!, context)).toBe(false);
    });
  });

  describe('getFollowUpQuestions', () => {
    it('should return follow-up questions for a question', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'maritalStatus');
      const followUps = getFollowUpQuestions(question!.id, ENHANCED_WILL_QUESTIONS);

      expect(followUps.length).toBeGreaterThan(0);
      expect(followUps.every((q) => question!.followUpQuestions!.includes(q.id))).toBe(true);
    });

    it('should return empty array for question with no follow-ups', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'testatorFullName');
      const followUps = getFollowUpQuestions(question!.id, ENHANCED_WILL_QUESTIONS);

      expect(followUps.length).toBe(0);
    });
  });

  describe('getVisibleQuestions', () => {
    it('should return all basic questions for basic tier', () => {
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: {},
        completedQuestions: [],
      };

      const visible = getVisibleQuestions(ENHANCED_WILL_QUESTIONS, context);
      expect(visible.every((q) => q.tier === 'basic')).toBe(true);
    });

    it('should return both basic and advanced questions for advanced tier', () => {
      const context = {
        documentType: 'will' as const,
        userTier: 'advanced' as const,
        answers: {},
        completedQuestions: [],
      };

      const visible = getVisibleQuestions(ENHANCED_WILL_QUESTIONS, context);
      expect(visible.some((q) => q.tier === 'advanced')).toBe(true);
    });

    it('should filter questions based on conditional rules', () => {
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: { hasChildren: 'No' },
        completedQuestions: [],
      };

      const visible = getVisibleQuestions(ENHANCED_WILL_QUESTIONS, context);
      const childrenQuestions = visible.filter((q) => q.field === 'childrenDetails');

      expect(childrenQuestions.length).toBe(0);
    });
  });

  describe('validateAnswer', () => {
    it('should validate required field', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'testatorFullName');
      const result = validateAnswer(question!, '');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate text length', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'testatorFullName');
      const result = validateAnswer(question!, 'A');

      expect(result.valid).toBe(false);
    });

    it('should accept valid answer', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'testatorFullName');
      const result = validateAnswer(question!, 'John Smith');

      expect(result.valid).toBe(true);
    });

    it('should validate date of birth age requirement', () => {
      const question = ENHANCED_WILL_QUESTIONS.find((q) => q.field === 'testatorDateOfBirth');
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const result = validateAnswer(question!, futureDate.toISOString().split('T')[0]);
      expect(result.valid).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate correct progress percentage', () => {
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: { testatorFullName: 'John Smith' },
        completedQuestions: [1, 2, 3],
      };

      const progress = calculateProgress(context, ENHANCED_WILL_QUESTIONS);
      expect(progress.completed).toBe(3);
      expect(progress.total).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should handle zero progress', () => {
      const context = {
        documentType: 'will' as const,
        userTier: 'basic' as const,
        answers: {},
        completedQuestions: [],
      };

      const progress = calculateProgress(context, ENHANCED_WILL_QUESTIONS);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });
});

describe('Document Validation', () => {
  describe('validateWillAnswers', () => {
    it('should identify missing testator name', () => {
      const answers = {
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'testatorFullName')).toBe(true);
    });

    it('should identify missing executor', () => {
      const answers = {
        testatorFullName: 'John Smith',
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
        maritalStatus: 'Single',
        hasChildren: 'No',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.errors.some((e) => e.field === 'primaryExecutor')).toBe(true);
    });

    it('should identify missing beneficiaries', () => {
      const answers = {
        testatorFullName: 'John Smith',
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
        maritalStatus: 'Single',
        hasChildren: 'No',
        primaryExecutor: 'Jane Doe',
        alternateExecutor: 'Bob Smith',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.errors.some((e) => e.field === 'primaryBeneficiaries')).toBe(true);
    });

    it('should warn about missing alternate executor', () => {
      const answers = {
        testatorFullName: 'John Smith',
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
        maritalStatus: 'Single',
        hasChildren: 'No',
        primaryExecutor: 'Jane Doe',
        primaryBeneficiaries: 'Jane Doe - 100%',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.warnings.some((w) => w.field === 'alternateExecutor')).toBe(true);
    });

    it('should warn about conflicting marital status', () => {
      const answers = {
        testatorFullName: 'John Smith',
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
        maritalStatus: 'Single',
        spouseName: 'Jane Smith',
        hasChildren: 'No',
        primaryExecutor: 'Jane Doe',
        alternateExecutor: 'Bob Smith',
        primaryBeneficiaries: 'Jane Doe - 100%',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.warnings.some((w) => w.field === 'maritalStatus')).toBe(true);
    });

    it('should validate beneficiary percentages', () => {
      const answers = {
        testatorFullName: 'John Smith',
        testatorDateOfBirth: '1980-01-01',
        testatorAddress: '123 Main St, Toronto, ON M5H 2N2',
        maritalStatus: 'Single',
        hasChildren: 'No',
        primaryExecutor: 'Jane Doe',
        alternateExecutor: 'Bob Smith',
        primaryBeneficiaries: 'Jane Doe - 50%, Bob Smith - 40%',
      };

      const result = validateDocumentAnswers(answers, 'will');
      expect(result.warnings.some((w) => w.field === 'primaryBeneficiaries')).toBe(true);
    });
  });

  describe('validatePOAPropertyAnswers', () => {
    it('should identify missing grantor name', () => {
      const answers = {
        grantorAddress: '123 Main St, Toronto, ON M5H 2N2',
      };

      const result = validateDocumentAnswers(answers, 'poa-property');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'grantorFullName')).toBe(true);
    });

    it('should identify missing attorney', () => {
      const answers = {
        grantorFullName: 'John Smith',
        grantorDateOfBirth: '1980-01-01',
        grantorAddress: '123 Main St, Toronto, ON M5H 2N2',
      };

      const result = validateDocumentAnswers(answers, 'poa-property');
      expect(result.errors.some((e) => e.field === 'attorneyName')).toBe(true);
    });
  });

  describe('validatePOAPersonalCareAnswers', () => {
    it('should identify missing grantor name', () => {
      const answers = {
        grantorAddress: '123 Main St, Toronto, ON M5H 2N2',
      };

      const result = validateDocumentAnswers(answers, 'poa-personal-care');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'grantorFullName')).toBe(true);
    });

    it('should warn about missing healthcare preferences', () => {
      const answers = {
        grantorFullName: 'John Smith',
        grantorDateOfBirth: '1980-01-01',
        grantorAddress: '123 Main St, Toronto, ON M5H 2N2',
        attorneyName: 'Jane Doe',
      };

      const result = validateDocumentAnswers(answers, 'poa-personal-care');
      expect(result.warnings.some((w) => w.field === 'healthcarePreferences')).toBe(true);
    });
  });
});
