import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table for storing Wills and POAs
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  documentType: mysqlEnum("documentType", ["will", "poa-property", "poa-personal"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "completed", "signed"]).default("draft").notNull(),
  testatorName: varchar("testatorName", { length: 255 }),
  testatorAge: int("testatorAge"),
  maritalStatus: varchar("maritalStatus", { length: 100 }),
  hasChildren: boolean("hasChildren").default(false),
  primaryBeneficiary: varchar("primaryBeneficiary", { length: 255 }),
  alternateExecutor: varchar("alternateExecutor", { length: 255 }),
  estateValue: int("estateValue"),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Beneficiaries table for storing beneficiary information
 */
export const beneficiaries = mysqlTable("beneficiaries", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }),
  allocationPercentage: int("allocationPercentage"),
  role: mysqlEnum("role", ["beneficiary", "executor", "trustee", "alternate-executor"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = typeof beneficiaries.$inferInsert;

/**
 * Assets table for storing asset information
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id),
  assetType: mysqlEnum("assetType", ["real-estate", "bank-account", "investment", "business", "personal-item", "vehicle", "cryptocurrency"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  value: int("value"),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;