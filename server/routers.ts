import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getVulnerabilities,
  getVulnerabilityById,
  createVulnerability,
  updateVulnerability,
  deleteVulnerability,
  getComplianceControls,
  getApplicationCompliance,
  updateApplicationCompliance,
  createActivityLog,
  getActivityLog,
  getDashboardMetrics,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    metrics: publicProcedure.query(async () => {
      return getDashboardMetrics();
    }),
  }),

  // Aplicações
  applications: router({
    list: publicProcedure.query(async () => {
      return getApplications();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getApplicationById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.string(),
          environment: z.string(),
          repository: z.string().optional(),
          responsible: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createApplication(input);
        await createActivityLog({
          userId: ctx.user.id,
          action: "create_application",
          entityType: "application",
          details: JSON.stringify(input),
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          type: z.string().optional(),
          environment: z.string().optional(),
          repository: z.string().optional(),
          responsible: z.string().optional(),
          riskScore: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateApplication(id, data);
        await createActivityLog({
          userId: ctx.user.id,
          action: "update_application",
          entityType: "application",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteApplication(input.id);
        await createActivityLog({
          userId: ctx.user.id,
          action: "delete_application",
          entityType: "application",
          entityId: input.id,
        });
        return { success: true };
      }),
  }),

  // Vulnerabilidades
  vulnerabilities: router({
    list: publicProcedure
      .input(z.object({ applicationId: z.number().optional() }))
      .query(async ({ input }) => {
        return getVulnerabilities(input.applicationId);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getVulnerabilityById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          severity: z.enum(["crítica", "alta", "média", "baixa"]),
          cve: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createVulnerability(input);
        await createActivityLog({
          userId: ctx.user.id,
          action: "create_vulnerability",
          entityType: "vulnerability",
          entityId: input.applicationId,
          details: JSON.stringify(input),
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          severity: z.enum(["crítica", "alta", "média", "baixa"]).optional(),
          status: z.enum(["aberta", "em remediação", "resolvida"]).optional(),
          cve: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateVulnerability(id, data);
        await createActivityLog({
          userId: ctx.user.id,
          action: "update_vulnerability",
          entityType: "vulnerability",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteVulnerability(input.id);
        await createActivityLog({
          userId: ctx.user.id,
          action: "delete_vulnerability",
          entityType: "vulnerability",
          entityId: input.id,
        });
        return { success: true };
      }),

    // Análise com LLM
    analyze: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const vuln = await getVulnerabilityById(input.id);
        if (!vuln) throw new Error("Vulnerability not found");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em segurança de aplicações. Forneça análise técnica concisa sobre vulnerabilidades.",
            },
            {
              role: "user",
              content: `Analise esta vulnerabilidade e forneça recomendações de remediação:
              
Título: ${vuln.title}
Severidade: ${vuln.severity}
Descrição: ${vuln.description || "Sem descrição"}
CVE: ${vuln.cve || "Não especificado"}

Forneça:
1. Impacto potencial
2. Contexto de exploração
3. Recomendações de remediação`,
            },
          ],
        });

        return {
          analysis: response.choices[0]?.message.content || "",
        };
      }),
  }),

  // Conformidade
  compliance: router({
    controls: publicProcedure.query(async () => {
      return getComplianceControls();
    }),

    applicationStatus: publicProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return getApplicationCompliance(input.applicationId);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["conforme", "não conforme", "em progresso"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateApplicationCompliance(id, data);
        await createActivityLog({
          userId: ctx.user.id,
          action: "update_compliance",
          entityType: "compliance",
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),
  }),

  // Histórico de atividades
  activity: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return getActivityLog(input.limit);
      }),
  }),

  // Chat de segurança com IA
  chat: router({
    message: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um assistente especializado em segurança de aplicações e gerenciamento de vulnerabilidades.
Ajude os usuários com informações sobre:
- Vulnerabilidades e como remediá-las
- Boas práticas de segurança
- Conformidade e controles de segurança
- Postura de segurança geral

Seja conciso e prático nas respostas.`,
            },
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        return {
          response: response.choices[0]?.message.content || "",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

