import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * ASPM Enterprise - Application Security Posture Management for SDLC
 * Schema otimizado para integração CI/CD, orquestração de scanners e IA
 */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
 * Projetos/Aplicações em monitoramento
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  repositoryUrl: varchar("repositoryUrl", { length: 500 }),
  cicdWebhookUrl: varchar("cicdWebhookUrl", { length: 500 }), // Para receber eventos de CI/CD
  cicdProvider: mysqlEnum("cicdProvider", ["github", "gitlab", "jenkins", "azure", "other"]),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Descoberta automatizada de ativos (com IA)
 */
export const discoveredAssets = mysqlTable("discoveredAssets", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  assetType: mysqlEnum("assetType", ["api", "service", "database", "container", "function", "other"]),
  name: varchar("name", { length: 255 }).notNull(),
  endpoint: varchar("endpoint", { length: 500 }),
  technology: varchar("technology", { length: 255 }), // ex: Node.js, Python, Java
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }), // 0-1 (IA confidence)
  discoveredVia: mysqlEnum("discoveredVia", ["sast", "dast", "sca", "manual", "ai_inference"]),
  metadata: json("metadata"), // Dados adicionais do ativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiscoveredAsset = typeof discoveredAssets.$inferSelect;
export type InsertDiscoveredAsset = typeof discoveredAssets.$inferInsert;

/**
 * Configuração de scanners (SAST, DAST, Pentest)
 */
export const scannerConfigs = mysqlTable("scannerConfigs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scannerType: mysqlEnum("scannerType", ["sast", "dast", "sca", "pentest", "custom"]),
  scannerName: varchar("scannerName", { length: 255 }).notNull(), // ex: Semgrep, Burp, Nessus
  apiKey: varchar("apiKey", { length: 500 }), // Criptografado em produção
  endpoint: varchar("endpoint", { length: 500 }),
  isEnabled: boolean("isEnabled").default(true),
  schedule: varchar("schedule", { length: 100 }), // Cron expression
  lastRun: timestamp("lastRun"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScannerConfig = typeof scannerConfigs.$inferSelect;
export type InsertScannerConfig = typeof scannerConfigs.$inferInsert;

/**
 * Execuções de scan (pipeline SDLC)
 */
export const scanRuns = mysqlTable("scanRuns", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scannerConfigId: int("scannerConfigId"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]),
  trigger: mysqlEnum("trigger", ["manual", "scheduled", "cicd", "webhook"]),
  cicdBuildId: varchar("cicdBuildId", { length: 255 }), // Link com CI/CD
  gitCommitSha: varchar("gitCommitSha", { length: 100 }),
  gitBranch: varchar("gitBranch", { length: 255 }),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  duration: int("duration"), // em segundos
  metadata: json("metadata"), // Dados da execução
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScanRun = typeof scanRuns.$inferSelect;
export type InsertScanRun = typeof scanRuns.$inferInsert;

/**
 * Vulnerabilidades descobertas
 */
export const vulnerabilities = mysqlTable("vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scanRunId: int("scanRunId"),
  discoveredAssetId: int("discoveredAssetId"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["crítica", "alta", "média", "baixa", "info"]),
  cvss: decimal("cvss", { precision: 3, scale: 1 }), // 0-10
  cveId: varchar("cveId", { length: 50 }),
  cweId: varchar("cweId", { length: 50 }),
  scannerSource: varchar("scannerSource", { length: 100 }), // ex: semgrep, burp
  status: mysqlEnum("status", ["aberta", "em remediação", "resolvida", "falso positivo"]),
  falsePositiveScore: decimal("falsePositiveScore", { precision: 3, scale: 2 }), // IA confidence 0-1
  riskPriority: int("riskPriority"), // 1-100 (calculado por IA)
  remediation: text("remediation"),
  detectedAt: timestamp("detectedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

/**
 * Detecção de dados sensíveis e credential leaks
 */
export const sensitiveDataDetections = mysqlTable("sensitiveDataDetections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scanRunId: int("scanRunId"),
  detectionType: mysqlEnum("detectionType", [
    "api_key",
    "database_password",
    "private_key",
    "token",
    "credit_card",
    "ssn",
    "pii",
    "custom_pattern",
  ]),
  location: varchar("location", { length: 500 }), // Arquivo/linha
  severity: mysqlEnum("severity", ["crítica", "alta", "média", "baixa"]),
  detectedValue: text("detectedValue"), // Valor mascarado
  remediated: boolean("remediated").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SensitiveDataDetection = typeof sensitiveDataDetections.$inferSelect;
export type InsertSensitiveDataDetection = typeof sensitiveDataDetections.$inferInsert;

/**
 * Proteção contra prompt injection
 */
export const promptInjectionDetections = mysqlTable("promptInjectionDetections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scanRunId: int("scanRunId"),
  location: varchar("location", { length: 500 }), // Arquivo/função
  riskLevel: mysqlEnum("riskLevel", ["crítica", "alta", "média", "baixa"]),
  detectionMethod: varchar("detectionMethod", { length: 255 }), // ex: pattern_matching, ml_model
  description: text("description"),
  remediation: text("remediation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromptInjectionDetection = typeof promptInjectionDetections.$inferSelect;
export type InsertPromptInjectionDetection = typeof promptInjectionDetections.$inferInsert;

/**
 * Análises com IA (LLM + ML)
 */
export const aiAnalyses = mysqlTable("aiAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  vulnerabilityId: int("vulnerabilityId"),
  analysisType: mysqlEnum("analysisType", [
    "risk_prioritization",
    "false_positive_detection",
    "anomaly_detection",
    "remediation_suggestion",
    "impact_assessment",
  ]),
  model: varchar("model", { length: 100 }), // ex: gpt-4, claude-3
  input: json("input"),
  output: json("output"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0-1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalyses.$inferInsert;

/**
 * Histórico de atividades (auditoria)
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  projectId: int("projectId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
