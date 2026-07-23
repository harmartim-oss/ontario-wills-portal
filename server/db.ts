import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, chatMessages, subscriptions, InsertSubscription, Subscription, documentVersions, InsertDocumentVersion, documentSharing, InsertDocumentSharing } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { documents, beneficiaries, assets, InsertDocument, InsertBeneficiary, InsertAsset } from "../drizzle/schema";

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documents).where(eq(documents.userId, userId));
}

export async function getDocumentById(documentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values(data);
  return result;
}

export async function updateDocument(documentId: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(documents).set(data).where(eq(documents.id, documentId));
}

export async function deleteDocument(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(documents).where(eq(documents.id, documentId));
}

export async function getBeneficiaries(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(beneficiaries).where(eq(beneficiaries.documentId, documentId));
}

export async function createBeneficiary(data: InsertBeneficiary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(beneficiaries).values(data);
}

export async function deleteBeneficiary(beneficiaryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(beneficiaries).where(eq(beneficiaries.id, beneficiaryId));
}

export async function getAssets(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(assets).where(eq(assets.documentId, documentId));
}

export async function createAsset(data: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(assets).values(data);
}

export async function deleteAsset(assetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(assets).where(eq(assets.id, assetId));
}


export async function getChatHistory(userId: number, documentId?: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const query = documentId 
      ? db.select().from(chatMessages).where(
          and(eq(chatMessages.userId, userId), eq(chatMessages.documentId, documentId))
        ).orderBy(chatMessages.createdAt)
      : db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt);

    return await query;
  } catch (error) {
    console.error("[Database] Failed to get chat history:", error);
    return [];
  }
}

export async function saveChatMessage(userId: number, role: "user" | "assistant", content: string, documentId?: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(chatMessages).values({
    userId,
    documentId: documentId || null,
    role,
    content,
  });

  return result;
}


// Subscription management functions

export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscription: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting subscription:", error);
    return null;
  }
}

export async function createOrUpdateSubscription(
  userId: number,
  data: Partial<InsertSubscription>
): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create/update subscription: database not available");
    return null;
  }

  try {
    const existing = await getUserSubscription(userId);

    if (existing) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));

      return await getUserSubscription(userId);
    } else {
      // Create new subscription
      await db.insert(subscriptions).values({
        userId,
        planType: "free",
        status: "active",
        ...data,
      });

      return await getUserSubscription(userId);
    }
  } catch (error) {
    console.error("[Database] Error creating/updating subscription:", error);
    return null;
  }
}

export async function upgradeToPremium(userId: number): Promise<Subscription | null> {
  return createOrUpdateSubscription(userId, {
    planType: "premium",
    status: "active",
  });
}

export async function downgradeToFree(userId: number): Promise<Subscription | null> {
  return createOrUpdateSubscription(userId, {
    planType: "free",
    status: "active",
  });
}

export async function getUserTier(userId: number): Promise<"free" | "premium"> {
  const subscription = await getUserSubscription(userId);
  return subscription?.planType === "premium" ? "premium" : "free";
}


// Document versioning functions

export async function createDocumentVersion(
  documentId: number,
  userId: number,
  data: Omit<InsertDocumentVersion, "documentId" | "createdBy">
): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create version: database not available");
    return null;
  }

  try {
    const result = await db.insert(documentVersions).values({
      documentId,
      createdBy: userId,
      ...data,
    });

    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Error creating document version:", error);
    return null;
  }
}

export async function getDocumentVersions(documentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get versions: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber));
  } catch (error) {
    console.error("[Database] Error getting document versions:", error);
    return [];
  }
}

export async function getDocumentVersion(versionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get version: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, versionId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting document version:", error);
    return null;
  }
}

// Document sharing functions

export async function shareDocument(
  documentId: number,
  sharedWithUserId: number,
  permission: "view" | "edit" | "comment" = "view",
  expiresAt?: Date
): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot share document: database not available");
    return null;
  }

  try {
    const result = await db.insert(documentSharing).values({
      documentId,
      sharedWithUserId,
      permission,
      expiresAt,
    });

    return result[0].insertId as number;
  } catch (error) {
    console.error("[Database] Error sharing document:", error);
    return null;
  }
}

export async function getDocumentShares(documentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get shares: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(documentSharing)
      .where(eq(documentSharing.documentId, documentId));
  } catch (error) {
    console.error("[Database] Error getting document shares:", error);
    return [];
  }
}

export async function revokeDocumentShare(shareId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot revoke share: database not available");
    return false;
  }

  try {
    await db.delete(documentSharing).where(eq(documentSharing.id, shareId));
    return true;
  } catch (error) {
    console.error("[Database] Error revoking document share:", error);
    return false;
  }
}

export async function updateDocumentSharePermission(
  shareId: number,
  permission: "view" | "edit" | "comment"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update share: database not available");
    return false;
  }

  try {
    await db
      .update(documentSharing)
      .set({ permission })
      .where(eq(documentSharing.id, shareId));
    return true;
  } catch (error) {
    console.error("[Database] Error updating document share:", error);
    return false;
  }
}


