import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "admin", "analista"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Aplicações monitoradas
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // web, api, mobile, etc
  environment: varchar("environment", { length: 100 }).notNull(), // prod, staging, dev
  repository: varchar("repository", { length: 500 }),
  responsible: varchar("responsible", { length: 255 }),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// Vulnerabilidades
export const vulnerabilities = mysqlTable("vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["crítica", "alta", "média", "baixa"]).notNull(),
  status: mysqlEnum("status", ["aberta", "em remediação", "resolvida"]).default("aberta").notNull(),
  cve: varchar("cve", { length: 50 }),
  discoveredAt: timestamp("discoveredAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

// Controles de conformidade (OWASP Top 10, CWE)
export const complianceControls = mysqlTable("complianceControls", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // OWASP_TOP_10, CWE
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceControl = typeof complianceControls.$inferSelect;
export type InsertComplianceControl = typeof complianceControls.$inferInsert;

// Status de conformidade por aplicação
export const applicationCompliance = mysqlTable("applicationCompliance", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  controlId: int("controlId").notNull(),
  status: mysqlEnum("status", ["conforme", "não conforme", "em progresso"]).default("em progresso").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApplicationCompliance = typeof applicationCompliance.$inferSelect;
export type InsertApplicationCompliance = typeof applicationCompliance.$inferInsert;

// Histórico de atividades
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(), // application, vulnerability, compliance
  entityId: int("entityId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;