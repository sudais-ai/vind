import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { publicDataError, requireWorkspacePermission } from "./authorization";
import { getDefaultTenantScope, getTenantCaseGraph } from "./tenant-data";
import { getDb } from "./db";
import { cases } from "../drizzle/schema";

const tenantScope = z.object({
  organizationId: z.number().int().positive(),
  workspaceId: z.number().int().positive(),
});
const createCaseInput = tenantScope.extend({
  title: z.string().trim().min(1).max(255),
  company: z.string().trim().min(1).max(255),
  category: z.enum(["BILLING", "CONTRACT", "REFUND", "SERVICE", "COMPLIANCE", "OTHER"]),
  description: z.string().trim().min(1),
  desiredOutcome: z.string().trim().min(1),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ? ({
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      avatar: ctx.user.avatar,
      status: ctx.user.status,
      role: ctx.user.role,
    }) : null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tenant: router({
    defaultScope: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getDefaultTenantScope(ctx.user.id);
      } catch (error) {
        throw publicDataError(error, "Workspace context could not be loaded.");
      }
    }),
    caseGraph: protectedProcedure.input(tenantScope).query(async ({ ctx, input }) => {
      try {
        await requireWorkspacePermission(ctx.user.id, input, "CASES:READ");
        return await getTenantCaseGraph(ctx.user.id, input.organizationId, input.workspaceId);
      } catch (error) {
        throw publicDataError(error, "Case data could not be loaded.");
      }
    }),
    createCase: protectedProcedure.input(createCaseInput).mutation(async ({ ctx, input }) => {
      try {
        await requireWorkspacePermission(ctx.user.id, input, "CASES:CREATE");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const [created] = await db.insert(cases).values({
          workspaceId: input.workspaceId,
          title: input.title,
          company: input.company,
          category: input.category,
          description: input.description,
          desiredOutcome: input.desiredOutcome,
          owner: ctx.user.id,
          status: "NEW",
          priority: "MEDIUM",
          risk: "MEDIUM",
        }).$returningId();
        return { id: created.id, workspaceId: input.workspaceId };
      } catch (error) {
        throw publicDataError(error, "Case could not be created.");
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
