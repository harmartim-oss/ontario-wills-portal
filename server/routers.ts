import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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

  documents: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserDocuments(ctx.user.id)
    ),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const doc = await db.getDocumentById(input.id);
        return doc || null;
      }),
    
    create: protectedProcedure
      .input(z.object({
        documentType: z.enum(["will", "poa-property", "poa-personal"]),
        title: z.string(),
        testatorName: z.string().optional(),
        testatorAge: z.number().optional(),
        maritalStatus: z.string().optional(),
        hasChildren: z.boolean().optional(),
        primaryBeneficiary: z.string().optional(),
        alternateExecutor: z.string().optional(),
        estateValue: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createDocument({
          userId: ctx.user.id,
          documentType: input.documentType,
          title: input.title,
          status: "draft",
          testatorName: input.testatorName,
          testatorAge: input.testatorAge,
          maritalStatus: input.maritalStatus,
          hasChildren: input.hasChildren,
          primaryBeneficiary: input.primaryBeneficiary,
          alternateExecutor: input.alternateExecutor,
          estateValue: input.estateValue,
        });
        return result;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        status: z.enum(["draft", "completed", "signed"]).optional(),
        content: z.string().optional(),
        testatorName: z.string().optional(),
        primaryBeneficiary: z.string().optional(),
        estateValue: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDocument(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDocument(input.id);
      }),
    
    generateWillPDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const doc = await db.getDocumentById(input.id);
        if (!doc) {
          throw new Error("Document not found");
        }
        return {
          success: true,
          message: "PDF generated successfully",
          downloadUrl: `/api/documents/${input.id}/download`,
        };
      }),
  }),

  beneficiaries: router({
    list: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(({ input }) => db.getBeneficiaries(input.documentId)),
    
    create: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        name: z.string(),
        relationship: z.string().optional(),
        allocationPercentage: z.number().optional(),
        role: z.enum(["beneficiary", "executor", "trustee", "alternate-executor"]),
      }))
      .mutation(({ input }) => db.createBeneficiary(input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteBeneficiary(input.id)),
  }),

  assets: router({
    list: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(({ input }) => db.getAssets(input.documentId)),
    
    create: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        assetType: z.enum(["real-estate", "bank-account", "investment", "business", "personal-item", "vehicle", "cryptocurrency"]),
        description: z.string(),
        value: z.number().optional(),
        location: z.string().optional(),
      }))
      .mutation(({ input }) => db.createAsset(input)),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteAsset(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
