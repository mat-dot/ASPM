import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  listProjects,
  createProject,
  getProjectById,
  updateProjectRiskScore,
  listAssetsByProject,
  createDiscoveredAsset,
  listScannerConfigs,
  createScannerConfig,
  createScanRun,
  listScanRunsByProject,
  updateScanRunStatus,
  listVulnerabilitiesByProject,
  listVulnerabilitiesByScanRun,
  createVulnerability,
  updateVulnerabilityStatus,
  createSensitiveDataDetection,
  listSensitiveDataByProject,
  createPromptInjectionDetection,
  listPromptInjectionsByProject,
  createAiAnalysis,
  listAiAnalysesByVulnerability,
  createActivityLog,
  listActivityLogs,
  getDashboardMetrics,
} from "./db";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("session", { path: "/" });
      return { success: true };
    }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    metrics: publicProcedure
      .input(z.object({ projectId: z.number().optional() }))
      .query(async ({ input }) => {
        if (!input.projectId) {
          const projects = await listProjects();
          if (projects.length === 0) {
            return {
              totalProjects: 0,
              totalVulnerabilities: 0,
              averageRiskScore: 0,
              severityCounts: { crítica: 0, alta: 0, média: 0, baixa: 0 },
            };
          }
          const firstProject = projects[0];
          return await getDashboardMetrics(firstProject.id);
        }
        return await getDashboardMetrics(input.projectId);
      }),
  }),

  // ============ PROJECTS ============
  projects: router({
    list: publicProcedure.query(async () => {
      return await listProjects();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          repositoryUrl: z.string().optional(),
          cicdWebhookUrl: z.string().optional(),
          cicdProvider: z.enum(["github", "gitlab", "jenkins", "azure", "other"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createProject(input);
        await createActivityLog({
          userId: ctx.user?.id,
          action: "create_project",
          entityType: "project",
          details: { name: input.name },
        });
        return result;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProjectById(input.id);
      }),
  }),

  // ============ ASSETS (Descoberta com IA) ============
  assets: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listAssetsByProject(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          assetType: z.enum(["api", "service", "database", "container", "function", "other"]),
          name: z.string(),
          endpoint: z.string().optional(),
          technology: z.string().optional(),
          discoveredVia: z.enum(["sast", "dast", "sca", "manual", "ai_inference"]),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createDiscoveredAsset(input);
        await createActivityLog({
          userId: ctx.user?.id,
          projectId: input.projectId,
          action: "discover_asset",
          entityType: "asset",
          details: { name: input.name, type: input.assetType },
        });
        return result;
      }),
  }),

  // ============ SCANNER CONFIGS (Orquestração SAST/DAST) ============
  scanners: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listScannerConfigs(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          scannerType: z.enum(["sast", "dast", "sca", "pentest", "custom"]),
          scannerName: z.string(), // ex: Semgrep, Burp, Nessus
          apiKey: z.string().optional(),
          endpoint: z.string().optional(),
          schedule: z.string().optional(), // Cron
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createScannerConfig(input);
        await createActivityLog({
          userId: ctx.user?.id,
          projectId: input.projectId,
          action: "configure_scanner",
          entityType: "scanner",
          details: { name: input.scannerName, type: input.scannerType },
        });
        return result;
      }),
  }),

  // ============ SCAN RUNS (Pipeline SDLC) ============
  scans: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listScanRunsByProject(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          scannerConfigId: z.number().optional(),
          trigger: z.enum(["manual", "scheduled", "cicd", "webhook"]),
          cicdBuildId: z.string().optional(),
          gitCommitSha: z.string().optional(),
          gitBranch: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createScanRun({
          ...input,
          status: "pending",
          startedAt: new Date(),
        });
        await createActivityLog({
          userId: ctx.user?.id,
          projectId: input.projectId,
          action: "start_scan",
          entityType: "scan_run",
          details: { trigger: input.trigger },
        });
        return result;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          scanRunId: z.number(),
          status: z.enum(["pending", "running", "completed", "failed"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateScanRunStatus(input.scanRunId, input.status, new Date());
        return { success: true };
      }),
  }),

  // ============ VULNERABILITIES ============
  vulnerabilities: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listVulnerabilitiesByProject(input.projectId);
      }),

    byScanRun: publicProcedure
      .input(z.object({ scanRunId: z.number() }))
      .query(async ({ input }) => {
        return await listVulnerabilitiesByScanRun(input.scanRunId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          scanRunId: z.number().optional(),
          discoveredAssetId: z.number().optional(),
          title: z.string(),
          description: z.string().optional(),
          severity: z.enum(["crítica", "alta", "média", "baixa", "info"]),
          cvss: z.number().optional().transform(v => v ? String(v) : undefined),
          cveId: z.string().optional(),
          cweId: z.string().optional(),
          scannerSource: z.string().optional(),
          remediation: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createVulnerability({
          ...input,
          status: "aberta",
          detectedAt: new Date(),
        });
        await createActivityLog({
          userId: ctx.user?.id,
          projectId: input.projectId,
          action: "create_vulnerability",
          entityType: "vulnerability",
          details: { title: input.title, severity: input.severity },
        });
        return result;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          vulnerabilityId: z.number(),
          status: z.enum(["aberta", "em remediação", "resolvida", "falso positivo"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateVulnerabilityStatus(input.vulnerabilityId, input.status);
        return { success: true };
      }),

    // IA: Priorização e análise
    prioritizeWithAI: protectedProcedure
      .input(z.object({ vulnerabilityId: z.number() }))
      .mutation(async ({ input }) => {
        // Implementar priorização com LLM
        return { riskPriority: Math.floor(Math.random() * 100) };
      }),
  }),

  // ============ SENSITIVE DATA DETECTION ============
  sensitiveData: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listSensitiveDataByProject(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          scanRunId: z.number().optional(),
          detectionType: z.enum([
            "api_key",
            "database_password",
            "private_key",
            "token",
            "credit_card",
            "ssn",
            "pii",
            "custom_pattern",
          ]),
          location: z.string(),
          severity: z.enum(["crítica", "alta", "média", "baixa"]),
          detectedValue: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createSensitiveDataDetection(input);
        await notifyOwner({
          title: "Credential Leak Detected",
          content: `${input.detectionType} found in ${input.location}`,
        });
        return result;
      }),
  }),

  // ============ PROMPT INJECTION DETECTION ============
  promptInjection: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await listPromptInjectionsByProject(input.projectId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          scanRunId: z.number().optional(),
          location: z.string(),
          riskLevel: z.enum(["crítica", "alta", "média", "baixa"]),
          detectionMethod: z.string(),
          description: z.string(),
          remediation: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createPromptInjectionDetection(input);
        return result;
      }),
  }),

  // ============ AI ANALYSIS (LLM + ML) ============
  aiAnalysis: router({
    analyze: protectedProcedure
      .input(
        z.object({
          vulnerabilityId: z.number(),
          analysisType: z.enum([
            "risk_prioritization",
            "false_positive_detection",
            "anomaly_detection",
            "remediation_suggestion",
            "impact_assessment",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        // Chamar LLM para análise
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a security expert. Analyze vulnerabilities and provide insights.",
            },
            {
              role: "user",
              content: `Perform ${input.analysisType} for vulnerability ${input.vulnerabilityId}`,
            },
          ],
        });

        const result = await createAiAnalysis({
          vulnerabilityId: input.vulnerabilityId,
          analysisType: input.analysisType as any,
          model: "gpt-4",
          input: { vulnerabilityId: input.vulnerabilityId },
          output: { analysis: response.choices[0].message.content },
          confidence: 0.85 as any,
        });

        return result;
      }),

    getByVulnerability: publicProcedure
      .input(z.object({ vulnerabilityId: z.number() }))
      .query(async ({ input }) => {
        return await listAiAnalysesByVulnerability(input.vulnerabilityId);
      }),
  }),

  // ============ ACTIVITY LOGS ============
  activity: router({
    list: publicProcedure
      .input(z.object({ projectId: z.number().optional() }))
      .query(async ({ input }) => {
        return await listActivityLogs(input.projectId);
      }),
  }),

  // ============ SYSTEM ============
  system: router({
    notifyOwner: protectedProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input }) => {
        const result = await notifyOwner(input);
        return { success: result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
