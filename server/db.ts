import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  projects,
  discoveredAssets,
  scannerConfigs,
  scanRuns,
  vulnerabilities,
  sensitiveDataDetections,
  promptInjectionDetections,
  aiAnalyses,
  activityLogs,
  InsertProject,
  InsertVulnerability,
  InsertScanRun,
  InsertSensitiveDataDetection,
  InsertPromptInjectionDetection,
  InsertAiAnalysis,
  InsertActivityLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ============ USERS ============

export async function upsertUser(user: typeof users.$inferInsert): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: any = {
      openId: user.openId,
    };
    const updateSet: Record<string, any> = {};

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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PROJECTS ============

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0];
}

export async function listProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result;
}

export async function updateProjectRiskScore(projectId: number, riskScore: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set({ riskScore: riskScore as any }).where(eq(projects.id, projectId));
}

// ============ DISCOVERED ASSETS ============

export async function listAssetsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(discoveredAssets)
    .where(eq(discoveredAssets.projectId, projectId))
    .orderBy(desc(discoveredAssets.createdAt));
}

export async function createDiscoveredAsset(data: typeof discoveredAssets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(discoveredAssets).values(data);
}

// ============ SCANNER CONFIGS ============

export async function listScannerConfigs(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(scannerConfigs)
    .where(eq(scannerConfigs.projectId, projectId));
}

export async function createScannerConfig(data: typeof scannerConfigs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(scannerConfigs).values(data);
}

// ============ SCAN RUNS (Pipeline SDLC) ============

export async function createScanRun(data: InsertScanRun) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scanRuns).values(data);
  return result;
}

export async function getScanRunById(scanRunId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scanRuns).where(eq(scanRuns.id, scanRunId)).limit(1);
  return result[0];
}

export async function listScanRunsByProject(projectId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(scanRuns)
    .where(eq(scanRuns.projectId, projectId))
    .orderBy(desc(scanRuns.createdAt))
    .limit(limit);
}

export async function updateScanRunStatus(scanRunId: number, status: string, completedAt?: Date) {
  const db = await getDb();
  if (!db) return;
  const updateData: any = { status: status as any };
  if (completedAt) {
    updateData.completedAt = completedAt;
    const startTime = new Date();
    updateData.duration = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);
  }
  await db.update(scanRuns).set(updateData).where(eq(scanRuns.id, scanRunId));
}

// ============ VULNERABILITIES ============

export async function listVulnerabilitiesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.projectId, projectId))
    .orderBy(desc(vulnerabilities.riskPriority));
}

export async function listVulnerabilitiesByScanRun(scanRunId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.scanRunId, scanRunId));
}

export async function createVulnerability(data: InsertVulnerability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(vulnerabilities).values(data);
}

export async function updateVulnerabilityStatus(
  vulnerabilityId: number,
  status: string,
  riskPriority?: number
) {
  const db = await getDb();
  if (!db) return;
  const updateData: any = { status };
  if (riskPriority !== undefined) {
    updateData.riskPriority = riskPriority;
  }
  await db.update(vulnerabilities).set(updateData).where(eq(vulnerabilities.id, vulnerabilityId));
}

// ============ SENSITIVE DATA DETECTIONS ============

export async function createSensitiveDataDetection(data: InsertSensitiveDataDetection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(sensitiveDataDetections).values(data);
}

export async function listSensitiveDataByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sensitiveDataDetections)
    .where(eq(sensitiveDataDetections.projectId, projectId))
    .orderBy(desc(sensitiveDataDetections.createdAt));
}

// ============ PROMPT INJECTION DETECTIONS ============

export async function createPromptInjectionDetection(data: InsertPromptInjectionDetection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(promptInjectionDetections).values(data);
}

export async function listPromptInjectionsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(promptInjectionDetections)
    .where(eq(promptInjectionDetections.projectId, projectId))
    .orderBy(desc(promptInjectionDetections.createdAt));
}

// ============ AI ANALYSES ============

export async function createAiAnalysis(data: InsertAiAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(aiAnalyses).values(data);
}

export async function listAiAnalysesByVulnerability(vulnerabilityId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.vulnerabilityId, vulnerabilityId));
}

// ============ ACTIVITY LOGS ============

export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function listActivityLogs(projectId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (projectId) {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.projectId, projectId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
  return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ============ DASHBOARD METRICS ============

export async function getDashboardMetrics(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const project = await getProjectById(projectId);
  const vulns = await listVulnerabilitiesByProject(projectId);
  const recentScans = await listScanRunsByProject(projectId, 10);
  const sensitiveData = await listSensitiveDataByProject(projectId);
  const promptInjections = await listPromptInjectionsByProject(projectId);

  const severityCounts = {
    crítica: vulns.filter((v) => v.severity === "crítica").length,
    alta: vulns.filter((v) => v.severity === "alta").length,
    média: vulns.filter((v) => v.severity === "média").length,
    baixa: vulns.filter((v) => v.severity === "baixa").length,
  };

  const statusCounts = {
    aberta: vulns.filter((v) => v.status === "aberta").length,
    emRemediacao: vulns.filter((v) => v.status === "em remediação").length,
    resolvida: vulns.filter((v) => v.status === "resolvida").length,
    falsoPositivo: vulns.filter((v) => v.status === "falso positivo").length,
  };

  return {
    projectName: project?.name,
    riskScore: project?.riskScore || 0,
    totalVulnerabilities: vulns.length,
    severityCounts,
    statusCounts,
    recentScans: recentScans.length,
    sensitiveDataDetections: sensitiveData.length,
    promptInjectionDetections: promptInjections.length,
  };
}
