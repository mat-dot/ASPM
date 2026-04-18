import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertApplication, applications,
  InsertVulnerability, vulnerabilities,
  InsertComplianceControl, complianceControls,
  InsertApplicationCompliance, applicationCompliance,
  InsertActivityLog, activityLog
} from "../drizzle/schema";
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

// Aplicações
export async function getApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications);
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createApplication(data: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(applications).values(data);
}

export async function updateApplication(id: number, data: Partial<InsertApplication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applications).set(data).where(eq(applications.id, id));
}

// Vulnerabilidades
export async function getVulnerabilities(applicationId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (applicationId) {
    return db.select().from(vulnerabilities).where(eq(vulnerabilities.applicationId, applicationId));
  }
  return db.select().from(vulnerabilities);
}

export async function getVulnerabilityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vulnerabilities).where(eq(vulnerabilities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVulnerability(data: InsertVulnerability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(vulnerabilities).values(data);
}

export async function updateVulnerability(id: number, data: Partial<InsertVulnerability>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vulnerabilities).set(data).where(eq(vulnerabilities.id, id));
}

// Conformidade
export async function getComplianceControls() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceControls);
}

export async function getApplicationCompliance(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applicationCompliance).where(eq(applicationCompliance.applicationId, applicationId));
}

export async function updateApplicationCompliance(id: number, data: Partial<InsertApplicationCompliance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applicationCompliance).set(data).where(eq(applicationCompliance.id, id));
}

// Histórico de atividades
export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(activityLog).values(data);
}

export async function getActivityLog(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).orderBy(activityLog.createdAt).limit(limit);
}

// Delete operations
export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(applications).where(eq(applications.id, id));
}

export async function deleteVulnerability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vulnerabilities).where(eq(vulnerabilities.id, id));
}

// Dashboard metrics
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { totalApps: 0, vulnerabilities: { critica: 0, alta: 0, media: 0, baixa: 0 }, riskScore: 0 };
  
  const allVulns = await db.select().from(vulnerabilities);
  const apps = await db.select().from(applications);
  
  const metrics = {
    totalApps: apps.length,
    vulnerabilities: {
      critica: allVulns.filter(v => v.severity === 'crítica').length,
      alta: allVulns.filter(v => v.severity === 'alta').length,
      media: allVulns.filter(v => v.severity === 'média').length,
      baixa: allVulns.filter(v => v.severity === 'baixa').length,
    },
    riskScore: apps.reduce((sum, app) => sum + (parseFloat(app.riskScore?.toString() || '0')), 0) / (apps.length || 1),
  };
  
  return metrics;
}
