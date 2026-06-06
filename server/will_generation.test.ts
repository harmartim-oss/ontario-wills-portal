import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe('Will Generation Router', () => {
  describe('generateWill', () => {
    it('should generate a will with valid data', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.generateWill({
        documentId: 1,
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          maritalStatus: 'Married',
        },
      });

      expect(result.success).toBe(true);
      expect(result.willContent).toBeDefined();
      expect(result.willContent).toContain('John Doe');
      expect(result.documentId).toBe(1);
      expect(result.message).toBe('Will generated successfully');
    });

    it('should handle missing testator name gracefully', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.generateWill({
        documentId: 1,
        willData: {
          currentAddress: '123 Main St, Toronto, ON',
          maritalStatus: 'Married',
        },
      });

      expect(result.success).toBe(true);
      expect(result.willContent).toContain('LAST WILL AND TESTAMENT');
    });

    it('should include all provided will data in the output', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const willData = {
        testatorName: 'Jane Smith',
        currentAddress: '456 Oak Ave, Vancouver, BC',
        maritalStatus: 'Single',
        children: 'Two children',
        primaryExecutor: 'John Smith',
      };

      const result = await caller.willGeneration.generateWill({
        documentId: 2,
        willData,
      });

      expect(result.success).toBe(true);
      expect(result.willContent).toContain('Jane Smith');
      expect(result.willContent).toContain('456 Oak Ave, Vancouver, BC');
      expect(result.willContent).toContain('Single');
    });
  });

  describe('generateWillPDF', () => {
    it('should return a PDF URL for valid document', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.generateWillPDF({
        documentId: 1,
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
        },
      });

      expect(result.success).toBe(true);
      expect(result.pdfUrl).toBeDefined();
      expect(result.pdfUrl).toMatch(/https:\/\/.*\.pdf/);
      expect(result.message).toBe('PDF generated successfully');
    });

    it('should generate unique PDF URLs for different documents', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result1 = await caller.willGeneration.generateWillPDF({
        documentId: 1,
        willData: { testatorName: 'John Doe' },
      });

      const result2 = await caller.willGeneration.generateWillPDF({
        documentId: 2,
        willData: { testatorName: 'Jane Smith' },
      });

      expect(result1.pdfUrl).toMatch(/https:\/\/.*will-1-.*\.pdf/);
      expect(result2.pdfUrl).toMatch(/https:\/\/.*will-2-.*\.pdf/);
      expect(result1.pdfUrl).not.toBe(result2.pdfUrl);
    });
  });

  describe('previewWill', () => {
    it('should generate a preview of the will', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.previewWill({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          maritalStatus: 'Married',
          spouseInfo: 'Jane Doe',
          children: 'Two children',
          primaryResidence: '123 Main St, Toronto, ON',
          totalFinancialAssets: '$500,000',
          primaryExecutor: 'John Smith',
          alternateExecutor: 'Jane Smith',
        },
      });

      expect(result.success).toBe(true);
      expect(result.preview).toBeDefined();
      expect(result.preview).toContain('PREVIEW: LAST WILL AND TESTAMENT');
      expect(result.preview).toContain('John Doe');
      expect(result.preview).toContain('Married');
      expect(result.preview).toContain('Two children');
    });

    it('should handle partial will data in preview', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.previewWill({
        willData: {
          testatorName: 'Jane Smith',
        },
      });

      expect(result.success).toBe(true);
      expect(result.preview).toContain('Jane Smith');
      expect(result.preview).toContain('Not specified');
    });
  });

  describe('validateWillData', () => {
    it('should return no errors for valid complete will data', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          primaryExecutor: 'John Smith',
          alternateExecutor: 'Jane Smith',
          maritalStatus: 'Married',
          spouseInfo: 'Jane Doe',
          hasChildren: true,
          guardians: 'John and Jane Smith',
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should flag missing testator name as error', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          currentAddress: '123 Main St, Toronto, ON',
          primaryExecutor: 'John Smith',
        },
      });

      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('Testator name'))).toBe(true);
    });

    it('should flag missing current address as error', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          primaryExecutor: 'John Smith',
        },
      });

      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.message.includes('Current address'))).toBe(true);
    });

    it('should flag missing primary executor as error', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
        },
      });

      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.message.includes('Primary executor'))).toBe(true);
    });

    it('should flag missing alternate executor as warning', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          primaryExecutor: 'John Smith',
        },
      });

      expect(result.isValid).toBe(true);
      const warnings = result.issues.filter(i => i.severity === 'warning');
      expect(warnings.some(w => w.message.includes('alternate executor'))).toBe(true);
    });

    it('should flag missing spouse info for married individuals as warning', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          primaryExecutor: 'John Smith',
          maritalStatus: 'Married',
        },
      });

      const warnings = result.issues.filter(i => i.severity === 'warning');
      expect(warnings.some(w => w.message.includes('Spouse information'))).toBe(true);
    });

    it('should flag missing guardians for parents with children as warning', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          testatorName: 'John Doe',
          currentAddress: '123 Main St, Toronto, ON',
          primaryExecutor: 'John Smith',
          hasChildren: true,
        },
      });

      const warnings = result.issues.filter(i => i.severity === 'warning');
      expect(warnings.some(w => w.message.includes('guardians'))).toBe(true);
    });

    it('should return multiple issues for incomplete data', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.willGeneration.validateWillData({
        willData: {
          maritalStatus: 'Married',
          hasChildren: true,
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(2);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
