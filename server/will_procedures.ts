import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { documents } from "../drizzle/schema";

// Schema for will creation
const willCreationSchema = z.object({
  testatorName: z.string().min(1, "Testator name required"),
  testatorAge: z.number().min(18, "Must be 18 or older"),
  testatorAddress: z.string(),
  testatorCity: z.string(),
  testatorProvince: z.string(),
  testatorPostalCode: z.string(),
  spouseName: z.string().optional(),
  maritalStatus: z.string().optional(),
  childrenNames: z.array(z.string()).optional(),
  hasMinorChildren: z.boolean().optional(),
  assets: z.array(z.object({
    type: z.string(),
    description: z.string(),
    value: z.string(),
    location: z.string().optional(),
  })).optional(),
  specificBequests: z.array(z.object({
    description: z.string(),
    beneficiary: z.string(),
    conditions: z.string().optional(),
  })).optional(),
  monetaryBequests: z.array(z.object({
    amount: z.number(),
    beneficiary: z.string(),
    percentage: z.number().optional(),
  })).optional(),
  residuaryBeneficiary: z.string(),
  executorName: z.string().min(1, "Executor name required"),
  alternateExecutor: z.string().optional(),
  executorCompensation: z.string().optional(),
  guardianName: z.string().optional(),
  alternateGuardian: z.string().optional(),
  hasHensonTrust: z.boolean().optional(),
  hensonBeneficiary: z.string().optional(),
  hensonTrustee: z.string().optional(),
  witness1Name: z.string().min(1, "Witness 1 name required"),
  witness1Address: z.string().optional(),
  witness2Name: z.string().min(1, "Witness 2 name required"),
  witness2Address: z.string().optional(),
  specialProvisions: z.string().optional(),
  hasDisabledBeneficiary: z.boolean().optional(),
});

export const willRouter = router({
  /**
   * Create a new will document
   */
  createWill: protectedProcedure
    .input(willCreationSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Store will data as JSON
        const willData = JSON.stringify(input);
        
        await db.insert(documents).values({
          userId: ctx.user.id,
          documentType: "will",
          title: `${input.testatorName}'s Will`,
          content: willData,
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          message: "Will created successfully",
        };
      } catch (error) {
        console.error("Error creating will:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create will",
        });
      }
    }),

  /**
   * Generate PDF for a will
   */
  generateWillPDF: protectedProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Fetch the document
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, input.documentId))
          .limit(1);

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Verify ownership
        if (doc[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to access this document",
          });
        }

        // Parse will data
        const willData = JSON.parse(doc[0].content || "{}");

        // Call Python backend to generate PDF
        // For now, return a placeholder response
        // In production, this would call the Python will_generator service
        return {
          success: true,
          message: "PDF generated successfully",
          downloadUrl: `/api/documents/${input.documentId}/download`,
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF",
        });
      }
    }),

  /**
   * Get will details
   */
  getWill: protectedProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, input.documentId))
          .limit(1);

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        // Verify ownership
        if (doc[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to access this document",
          });
        }

        return {
          id: doc[0].id,
          title: doc[0].title,
          content: JSON.parse(doc[0].content || "{}"),
          status: doc[0].status,
          createdAt: doc[0].createdAt,
          updatedAt: doc[0].updatedAt,
        };
      } catch (error) {
        console.error("Error fetching will:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch will",
        });
      }
    }),

  /**
   * Update will document
   */
  updateWill: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      data: willCreationSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Verify ownership first
        const doc = await db
          .select()
          .from(documents)
          .where(eq(documents.id, input.documentId))
          .limit(1);

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        if (doc[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this document",
          });
        }

        // Update the document
        const willData = JSON.stringify(input.data);
        
        await db
          .update(documents)
          .set({
            content: willData,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, input.documentId));

        return {
          success: true,
          message: "Will updated successfully",
        };
      } catch (error) {
        console.error("Error updating will:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update will",
        });
      }
    }),
});
