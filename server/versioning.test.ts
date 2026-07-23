import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";
import { versioningRouter, sharingRouter } from "./versioning_procedures";
import { TRPCError } from "@trpc/server";

// Mock database functions
vi.mock("./db", () => ({
  getDocumentById: vi.fn(),
  getDocumentVersions: vi.fn(),
  getDocumentVersion: vi.fn(),
  createDocumentVersion: vi.fn(),
  updateDocument: vi.fn(),
  shareDocument: vi.fn(),
  getDocumentShares: vi.fn(),
  revokeDocumentShare: vi.fn(),
  updateDocumentSharePermission: vi.fn(),
}));

describe("Versioning Router", () => {
  const mockUser = { id: 1, openId: "test-user" };
  const mockDocument = {
    id: 1,
    userId: 1,
    title: "Test Will",
    content: "Test content",
    status: "draft" as const,
    documentType: "will" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createVersion", () => {
    it("should create a new version for a document", async () => {
      const mockVersions = [
        {
          id: 1,
          documentId: 1,
          versionNumber: 1,
          title: "Test Will",
          content: "Original content",
          status: "draft" as const,
          changesSummary: "Initial version",
          createdAt: new Date(),
          createdBy: 1,
        },
      ];

      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.getDocumentVersions).mockResolvedValue(mockVersions);
      vi.mocked(db.createDocumentVersion).mockResolvedValue(2);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.createVersion({
        documentId: 1,
        changesSummary: "Updated beneficiary information",
      });

      expect(result.success).toBe(true);
      expect(result.versionNumber).toBe(2);
      expect(db.createDocumentVersion).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          versionNumber: 2,
          changesSummary: "Updated beneficiary information",
        })
      );
    });

    it("should prevent non-owners from creating versions", async () => {
      const otherUserDoc = { ...mockDocument, userId: 2 };
      vi.mocked(db.getDocumentById).mockResolvedValue(otherUserDoc);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.createVersion({
          documentId: 1,
          changesSummary: "Test",
        })
      ).rejects.toThrow("You do not have permission to version this document");
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.getDocumentVersions).mockResolvedValue([]);
      vi.mocked(db.createDocumentVersion).mockResolvedValue(null);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.createVersion({
          documentId: 1,
        })
      ).rejects.toThrow("Failed to create version");
    });
  });

  describe("getVersions", () => {
    it("should retrieve all versions of a document", async () => {
      const mockVersions = [
        {
          id: 2,
          documentId: 1,
          versionNumber: 2,
          title: "Test Will",
          content: "Updated content",
          status: "draft" as const,
          changesSummary: "Updated beneficiary",
          createdAt: new Date(),
          createdBy: 1,
        },
        {
          id: 1,
          documentId: 1,
          versionNumber: 1,
          title: "Test Will",
          content: "Original content",
          status: "draft" as const,
          changesSummary: "Initial version",
          createdAt: new Date(),
          createdBy: 1,
        },
      ];

      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.getDocumentVersions).mockResolvedValue(mockVersions);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getVersions({ documentId: 1 });

      expect(result.success).toBe(true);
      expect(result.versions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should prevent non-owners from viewing versions", async () => {
      const otherUserDoc = { ...mockDocument, userId: 2 };
      vi.mocked(db.getDocumentById).mockResolvedValue(otherUserDoc);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.getVersions({ documentId: 1 })).rejects.toThrow(
        "You do not have permission to view this document"
      );
    });
  });

  describe("getVersion", () => {
    it("should retrieve a specific version", async () => {
      const mockVersion = {
        id: 1,
        documentId: 1,
        versionNumber: 1,
        title: "Test Will",
        content: "Original content",
        status: "draft" as const,
        changesSummary: "Initial version",
        createdAt: new Date(),
        createdBy: 1,
      };

      vi.mocked(db.getDocumentVersion).mockResolvedValue(mockVersion);
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getVersion({ versionId: 1 });

      expect(result.success).toBe(true);
      expect(result.version).toEqual(mockVersion);
    });

    it("should return error if version not found", async () => {
      vi.mocked(db.getDocumentVersion).mockResolvedValue(null);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.getVersion({ versionId: 999 })).rejects.toThrow(
        "Version not found"
      );
    });
  });

  describe("restoreVersion", () => {
    it("should restore a document to a previous version", async () => {
      const mockVersion = {
        id: 1,
        documentId: 1,
        versionNumber: 1,
        title: "Test Will",
        content: "Original content",
        status: "draft" as const,
        changesSummary: "Initial version",
        createdAt: new Date(),
        createdBy: 1,
      };

      vi.mocked(db.getDocumentVersion).mockResolvedValue(mockVersion);
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.getDocumentVersions).mockResolvedValue([mockVersion]);
      vi.mocked(db.updateDocument).mockResolvedValue(true);
      vi.mocked(db.createDocumentVersion).mockResolvedValue(2);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.restoreVersion({ versionId: 1 });

      expect(result.success).toBe(true);
      expect(db.updateDocument).toHaveBeenCalledWith(1, {
        title: "Test Will",
        content: "Original content",
        status: "draft",
      });
    });

    it("should prevent non-owners from restoring versions", async () => {
      const mockVersion = {
        id: 1,
        documentId: 1,
        versionNumber: 1,
        title: "Test Will",
        content: "Original content",
        status: "draft" as const,
        changesSummary: "Initial version",
        createdAt: new Date(),
        createdBy: 1,
      };

      const otherUserDoc = { ...mockDocument, userId: 2 };

      vi.mocked(db.getDocumentVersion).mockResolvedValue(mockVersion);
      vi.mocked(db.getDocumentById).mockResolvedValue(otherUserDoc);

      const caller = versioningRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.restoreVersion({ versionId: 1 })).rejects.toThrow(
        "You do not have permission to restore this version"
      );
    });
  });
});

describe("Sharing Router", () => {
  const mockUser = { id: 1, openId: "test-user" };
  const mockDocument = {
    id: 1,
    userId: 1,
    title: "Test Will",
    content: "Test content",
    status: "draft" as const,
    documentType: "will" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("shareDocument", () => {
    it("should share a document with another user", async () => {
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.shareDocument).mockResolvedValue(1);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.shareDocument({
        documentId: 1,
        sharedWithUserId: 2,
        permission: "view",
      });

      expect(result.success).toBe(true);
      expect(result.shareId).toBe(1);
      expect(db.shareDocument).toHaveBeenCalledWith(1, 2, "view", undefined);
    });

    it("should prevent sharing with self", async () => {
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.shareDocument({
          documentId: 1,
          sharedWithUserId: 1,
          permission: "view",
        })
      ).rejects.toThrow("Cannot share document with yourself");
    });

    it("should prevent non-owners from sharing documents", async () => {
      const otherUserDoc = { ...mockDocument, userId: 2 };
      vi.mocked(db.getDocumentById).mockResolvedValue(otherUserDoc);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.shareDocument({
          documentId: 1,
          sharedWithUserId: 2,
          permission: "view",
        })
      ).rejects.toThrow("You do not have permission to share this document");
    });

    it("should support different permission levels", async () => {
      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.shareDocument).mockResolvedValue(1);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      for (const permission of ["view", "edit", "comment"] as const) {
        await caller.shareDocument({
          documentId: 1,
          sharedWithUserId: 2,
          permission,
        });

        expect(db.shareDocument).toHaveBeenCalledWith(1, 2, permission, undefined);
      }
    });
  });

  describe("getShares", () => {
    it("should retrieve all shares for a document", async () => {
      const mockShares = [
        {
          id: 1,
          documentId: 1,
          sharedWithUserId: 2,
          permission: "view" as const,
          sharedAt: new Date(),
          expiresAt: null,
        },
        {
          id: 2,
          documentId: 1,
          sharedWithUserId: 3,
          permission: "edit" as const,
          sharedAt: new Date(),
          expiresAt: null,
        },
      ];

      vi.mocked(db.getDocumentById).mockResolvedValue(mockDocument);
      vi.mocked(db.getDocumentShares).mockResolvedValue(mockShares);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getShares({ documentId: 1 });

      expect(result.success).toBe(true);
      expect(result.shares).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should prevent non-owners from viewing shares", async () => {
      const otherUserDoc = { ...mockDocument, userId: 2 };
      vi.mocked(db.getDocumentById).mockResolvedValue(otherUserDoc);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.getShares({ documentId: 1 })).rejects.toThrow(
        "You do not have permission to view shares for this document"
      );
    });
  });

  describe("updateSharePermission", () => {
    it("should update share permission", async () => {
      vi.mocked(db.updateDocumentSharePermission).mockResolvedValue(true);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.updateSharePermission({
        shareId: 1,
        permission: "edit",
      });

      expect(result.success).toBe(true);
      expect(db.updateDocumentSharePermission).toHaveBeenCalledWith(1, "edit");
    });

    it("should handle update failures", async () => {
      vi.mocked(db.updateDocumentSharePermission).mockResolvedValue(false);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.updateSharePermission({
          shareId: 1,
          permission: "edit",
        })
      ).rejects.toThrow("Failed to update share permission");
    });
  });

  describe("revokeShare", () => {
    it("should revoke a share", async () => {
      vi.mocked(db.revokeDocumentShare).mockResolvedValue(true);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.revokeShare({ shareId: 1 });

      expect(result.success).toBe(true);
      expect(db.revokeDocumentShare).toHaveBeenCalledWith(1);
    });

    it("should handle revoke failures", async () => {
      vi.mocked(db.revokeDocumentShare).mockResolvedValue(false);

      const caller = sharingRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.revokeShare({ shareId: 1 })).rejects.toThrow(
        "Failed to revoke share"
      );
    });
  });
});
