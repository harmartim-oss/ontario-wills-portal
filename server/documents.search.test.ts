import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
import * as dbModule from './db';

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

describe('Documents Search Router', () => {
  beforeEach(() => {
    // Mock the database to return sample documents
    vi.spyOn(dbModule, 'getUserDocuments').mockResolvedValue([
      {
        id: 1,
        userId: 1,
        documentType: "will",
        title: "My Will",
        status: "draft",
        testatorName: "John Smith",
        testatorAge: 65,
        maritalStatus: "married",
        hasChildren: true,
        primaryBeneficiary: "Jane Smith",
        alternateExecutor: "Bob Smith",
        estateValue: 500000,
        content: "Will content here",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-15"),
      },
      {
        id: 2,
        userId: 1,
        documentType: "poa-property",
        title: "Property POA",
        status: "completed",
        testatorName: "John Smith",
        testatorAge: 65,
        maritalStatus: "married",
        hasChildren: true,
        primaryBeneficiary: "Jane Smith",
        alternateExecutor: "Bob Smith",
        estateValue: 500000,
        content: "POA content here",
        createdAt: new Date("2026-01-10"),
        updatedAt: new Date("2026-01-20"),
      },
      {
        id: 3,
        userId: 1,
        documentType: "poa-personal",
        title: "Personal POA",
        status: "signed",
        testatorName: "John Smith",
        testatorAge: 65,
        maritalStatus: "married",
        hasChildren: true,
        primaryBeneficiary: "Jane Smith",
        alternateExecutor: "Bob Smith",
        estateValue: 500000,
        content: "Personal POA content",
        createdAt: new Date("2026-01-05"),
        updatedAt: new Date("2026-01-25"),
      },
    ] as any);
  });

  describe('search', () => {
    it('should return all documents when no filters applied', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({});

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter documents by search query', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        query: "My Will",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].title).toBe("My Will");
    });

    it('should filter documents by document type', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        documentType: "poa-property",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].documentType).toBe("poa-property");
    });

    it('should filter documents by status', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        status: "draft",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].status).toBe("draft");
    });

    it('should sort documents by title ascending', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        sortBy: "title",
        sortOrder: "asc",
      });

      expect(result.success).toBe(true);
      expect(result.documents[0].title).toBe("My Will");
      expect(result.documents[1].title).toBe("Personal POA");
      expect(result.documents[2].title).toBe("Property POA");
    });

    it('should sort documents by createdAt descending', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.success).toBe(true);
      // Most recent first (createdAt descending) - ID 1 is Jan 1, ID 2 is Jan 10, ID 3 is Jan 5
      // So descending order should be: 2 (Jan 10), 3 (Jan 5), 1 (Jan 1)
      expect(result.documents[0].id).toBe(2);
      expect(result.documents[1].id).toBe(3);
      expect(result.documents[2].id).toBe(1);
    });

    it('should combine multiple filters', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        documentType: "poa-property",
        status: "completed",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].documentType).toBe("poa-property");
      expect(result.documents[0].status).toBe("completed");
    });

    it('should search by testator name', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        query: "John Smith",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(3);
    });

    it('should search by primary beneficiary', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        query: "Jane Smith",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(3);
    });

    it('should return empty results for non-matching query', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        query: "Non-existent document",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should be case-insensitive for search', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.search({
        query: "my will",
      });

      expect(result.success).toBe(true);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].title).toBe("My Will");
    });
  });
});
