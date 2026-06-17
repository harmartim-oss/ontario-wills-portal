import { describe, it, expect } from 'vitest';
import {
  WILL_QUESTIONS,
  POA_PROPERTY_QUESTIONS,
  POA_PERSONAL_CARE_QUESTIONS,
  getQuestionsForTier,
  getQuestionCountByTier,
  DOCUMENT_QUESTIONS,
} from './documentQuestions';

describe('Document Questions Framework', () => {
  describe('Will Questions', () => {
    it('should have 112 total will questions', () => {
      expect(WILL_QUESTIONS.length).toBe(112);
    });

    it('should have questions with both basic and advanced tiers', () => {
      const basicQuestions = WILL_QUESTIONS.filter(q => q.tier === 'basic');
      const advancedQuestions = WILL_QUESTIONS.filter(q => q.tier === 'advanced');
      
      expect(basicQuestions.length).toBeGreaterThan(0);
      expect(advancedQuestions.length).toBeGreaterThan(0);
    });

    it('should have all required fields in questions', () => {
      WILL_QUESTIONS.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.section).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.field).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.required).toBeDefined();
        expect(question.tier).toBeDefined();
      });
    });

    it('should have unique field names', () => {
      const fields = WILL_QUESTIONS.map(q => q.field);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });

    it('should have valid question types', () => {
      const validTypes = ['text', 'date', 'textarea', 'select', 'checkbox', 'number'];
      WILL_QUESTIONS.forEach(question => {
        expect(validTypes).toContain(question.type);
      });
    });

    it('should have select options for select-type questions', () => {
      WILL_QUESTIONS.forEach(question => {
        if (question.type === 'select') {
          expect(question.options).toBeDefined();
          expect(Array.isArray(question.options)).toBe(true);
          expect(question.options!.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have legal notes for compliance questions', () => {
      const complianceQuestions = WILL_QUESTIONS.filter(q => 
        q.section === 'Testator Information' || 
        q.section === 'Marital & Family Status' ||
        q.section === 'Executor & Trustee'
      );
      
      complianceQuestions.forEach(question => {
        if (question.required) {
          expect(question.legalNote).toBeDefined();
        }
      });
    });
  });

  describe('POA Property Questions', () => {
    it('should have 34 total POA property questions', () => {
      expect(POA_PROPERTY_QUESTIONS.length).toBe(34);
    });

    it('should have questions with both basic and advanced tiers', () => {
      const basicQuestions = POA_PROPERTY_QUESTIONS.filter(q => q.tier === 'basic');
      const advancedQuestions = POA_PROPERTY_QUESTIONS.filter(q => q.tier === 'advanced');
      
      expect(basicQuestions.length).toBeGreaterThan(0);
      expect(advancedQuestions.length).toBeGreaterThan(0);
    });

    it('should have all required fields in questions', () => {
      POA_PROPERTY_QUESTIONS.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.section).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.field).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.required).toBeDefined();
        expect(question.tier).toBeDefined();
      });
    });

    it('should have unique field names', () => {
      const fields = POA_PROPERTY_QUESTIONS.map(q => q.field);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });
  });

  describe('POA Personal Care Questions', () => {
    it('should have 34 total POA personal care questions', () => {
      expect(POA_PERSONAL_CARE_QUESTIONS.length).toBe(34);
    });

    it('should have questions with both basic and advanced tiers', () => {
      const basicQuestions = POA_PERSONAL_CARE_QUESTIONS.filter(q => q.tier === 'basic');
      const advancedQuestions = POA_PERSONAL_CARE_QUESTIONS.filter(q => q.tier === 'advanced');
      
      expect(basicQuestions.length).toBeGreaterThan(0);
      expect(advancedQuestions.length).toBeGreaterThan(0);
    });

    it('should have all required fields in questions', () => {
      POA_PERSONAL_CARE_QUESTIONS.forEach(question => {
        expect(question.id).toBeDefined();
        expect(question.section).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.field).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.required).toBeDefined();
        expect(question.tier).toBeDefined();
      });
    });

    it('should have unique field names', () => {
      const fields = POA_PERSONAL_CARE_QUESTIONS.map(q => q.field);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });
  });

  describe('getQuestionsForTier', () => {
    it('should return all questions for "all" tier', () => {
      const allQuestions = getQuestionsForTier('will', 'all');
      expect(allQuestions.length).toBe(WILL_QUESTIONS.length);
    });

    it('should return only basic questions for "basic" tier', () => {
      const basicQuestions = getQuestionsForTier('will', 'basic');
      basicQuestions.forEach(question => {
        expect(question.tier).toBe('basic');
      });
    });

    it('should return basic + advanced questions for "advanced" tier', () => {
      const advancedQuestions = getQuestionsForTier('will', 'advanced');
      expect(advancedQuestions.length).toBeGreaterThan(0);
      advancedQuestions.forEach(question => {
        expect(['basic', 'advanced']).toContain(question.tier);
      });
    });

    it('should work for all document types', () => {
      const documentTypes = ['will', 'poa-property', 'poa-personal-care'];
      
      documentTypes.forEach(docType => {
        const basicQuestions = getQuestionsForTier(docType, 'basic');
        const allQuestions = getQuestionsForTier(docType, 'all');
        
        expect(basicQuestions.length).toBeGreaterThan(0);
        expect(allQuestions.length).toBeGreaterThanOrEqual(basicQuestions.length);
      });
    });

    it('should return empty array for invalid document type', () => {
      const questions = getQuestionsForTier('invalid-type', 'all');
      expect(questions.length).toBe(0);
    });
  });

  describe('getQuestionCountByTier', () => {
    it('should return correct counts for will', () => {
      const counts = getQuestionCountByTier('will');
      
      expect(counts.basic).toBeGreaterThan(0);
      expect(counts.advanced).toBeGreaterThan(0);
      expect(counts.total).toBe(counts.basic + counts.advanced);
      expect(counts.total).toBe(WILL_QUESTIONS.length);
    });

    it('should return correct counts for POA property', () => {
      const counts = getQuestionCountByTier('poa-property');
      
      expect(counts.basic).toBeGreaterThan(0);
      expect(counts.advanced).toBeGreaterThan(0);
      expect(counts.total).toBe(counts.basic + counts.advanced);
      expect(counts.total).toBe(POA_PROPERTY_QUESTIONS.length);
    });

    it('should return correct counts for POA personal care', () => {
      const counts = getQuestionCountByTier('poa-personal-care');
      
      expect(counts.basic).toBeGreaterThan(0);
      expect(counts.advanced).toBeGreaterThan(0);
      expect(counts.total).toBe(counts.basic + counts.advanced);
      expect(counts.total).toBe(POA_PERSONAL_CARE_QUESTIONS.length);
    });

    it('should return zero counts for invalid document type', () => {
      const counts = getQuestionCountByTier('invalid-type');
      
      expect(counts.basic).toBe(0);
      expect(counts.advanced).toBe(0);
      expect(counts.total).toBe(0);
    });
  });

  describe('DOCUMENT_QUESTIONS registry', () => {
    it('should have all document types registered', () => {
      expect(DOCUMENT_QUESTIONS['will']).toBeDefined();
      expect(DOCUMENT_QUESTIONS['poa-property']).toBeDefined();
      expect(DOCUMENT_QUESTIONS['poa-personal-care']).toBeDefined();
    });

    it('should have correct question counts in registry', () => {
      expect(DOCUMENT_QUESTIONS['will'].questions.length).toBe(112);
      expect(DOCUMENT_QUESTIONS['poa-property'].questions.length).toBe(34);
      expect(DOCUMENT_QUESTIONS['poa-personal-care'].questions.length).toBe(34);
    });
  });

  describe('Legal Compliance', () => {
    it('should mark critical testator questions as required', () => {
      const testatorQuestions = WILL_QUESTIONS.filter(q => q.section === 'Testator Information');
      const requiredQuestions = testatorQuestions.filter(q => q.required);
      
      expect(requiredQuestions.length).toBeGreaterThan(0);
    });

    it('should have legal notes for all executor questions', () => {
      const executorQuestions = WILL_QUESTIONS.filter(q => q.section === 'Executor & Trustee');
      const withLegalNotes = executorQuestions.filter(q => q.legalNote);
      
      expect(withLegalNotes.length).toBeGreaterThan(0);
    });

    it('should have legal notes for POA authority questions', () => {
      const authorityQuestions = POA_PROPERTY_QUESTIONS.filter(q => q.section === 'Powers & Authority');
      const withLegalNotes = authorityQuestions.filter(q => q.legalNote);
      
      expect(withLegalNotes.length).toBeGreaterThan(0);
    });

    it('should have legal notes for POA personal care health decisions', () => {
      const healthQuestions = POA_PERSONAL_CARE_QUESTIONS.filter(q => q.section === 'Healthcare Decisions');
      const withLegalNotes = healthQuestions.filter(q => q.legalNote);
      
      expect(withLegalNotes.length).toBeGreaterThan(0);
    });
  });

  describe('Question Completeness', () => {
    it('will questions should cover all major asset types', () => {
      const sections = new Set(WILL_QUESTIONS.map(q => q.section));
      
      expect(sections.has('Real Property')).toBe(true);
      expect(sections.has('Financial Assets')).toBe(true);
      expect(sections.has('Personal Property')).toBe(true);
      expect(sections.has('Business Interests')).toBe(true);
      expect(sections.has('Digital & Crypto Assets')).toBe(true);
    });

    it('will questions should cover family planning', () => {
      const sections = new Set(WILL_QUESTIONS.map(q => q.section));
      
      expect(sections.has('Children & Dependents')).toBe(true);
      expect(sections.has('Guardianship & Trusts')).toBe(true);
      expect(sections.has('Beneficiaries & Distribution')).toBe(true);
    });

    it('POA property questions should cover all authority types', () => {
      const sections = new Set(POA_PROPERTY_QUESTIONS.map(q => q.section));
      
      expect(sections.has('Powers & Authority')).toBe(true);
      expect(sections.has('Real Property')).toBe(true);
      expect(sections.has('Financial Accounts')).toBe(true);
      expect(sections.has('Compensation')).toBe(true);
    });

    it('POA personal care questions should cover healthcare decisions', () => {
      const sections = new Set(POA_PERSONAL_CARE_QUESTIONS.map(q => q.section));
      
      expect(sections.has('Healthcare Decisions')).toBe(true);
      expect(sections.has('Personal Care')).toBe(true);
      expect(sections.has('End-of-Life Decisions')).toBe(true);
      expect(sections.has('Medical Information')).toBe(true);
    });
  });
});
