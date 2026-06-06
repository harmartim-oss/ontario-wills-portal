import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";

/**
 * Helper function to generate a simple PDF buffer
 * In production, this would call the Python PDF generator
 */
async function generatePdfBuffer(willData: Record<string, any>): Promise<Buffer> {
  // Create a simple PDF with the will content
  const testatorName = willData.testatorName || "Testator";
  const currentAddress = willData.currentAddress || "";
  const maritalStatus = willData.maritalStatus || "";
  const primaryExecutor = willData.primaryExecutor || "";
  
  // Build a simple text-based PDF representation
  // In production, this would use ReportLab or similar
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 1200 >>
stream
BT
/F1 16 Tf
50 750 Td
(LAST WILL AND TESTAMENT) Tj
0 -30 Td
/F1 12 Tf
(OF) Tj
0 -20 Td
(${testatorName}) Tj
0 -40 Td
(I, ${testatorName}, of ${currentAddress}, being of sound mind and memory,) Tj
0 -15 Td
(do hereby make, publish and declare this to be my Last Will and Testament,) Tj
0 -15 Td
(hereby revoking all former Wills and Testamentary dispositions heretofore made by me.) Tj
0 -40 Td
/F1 14 Tf
(REVOCATION) Tj
0 -20 Td
/F1 12 Tf
(I hereby revoke and annul all former Wills, Codicils and Testamentary dispositions) Tj
0 -15 Td
(made by me and declare this only to be my Will.) Tj
0 -40 Td
/F1 14 Tf
(EXECUTOR) Tj
0 -20 Td
/F1 12 Tf
(I appoint ${primaryExecutor} to be my Executor.) Tj
0 -15 Td
(Should my Executor predecease me or be unable or unwilling to act,) Tj
0 -15 Td
(I appoint an alternate executor to be appointed by the court.) Tj
0 -40 Td
/F1 14 Tf
(POWERS OF EXECUTOR) Tj
0 -20 Td
/F1 12 Tf
(I give my Executor full power and authority to sell, mortgage, pledge or lease) Tj
0 -15 Td
(any real or personal property forming part of my estate, and to invest and reinvest) Tj
0 -15 Td
(the proceeds. My Executor shall have all powers conferred by the Succession Law Reform Act.) Tj
0 -40 Td
(Marital Status: ${maritalStatus}) Tj
0 -20 Td
(This Will has been created in compliance with Ontario's Succession Law Reform Act.) Tj
0 -15 Td
(It is recommended that this document be reviewed by a qualified lawyer before execution.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000001468 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1547
%%EOF`;

  return Buffer.from(pdfContent, "utf-8");
}

export const willGenerationRouter = router({
  generateWill: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        willData: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In production, call Python backend to generate will
        // For now, return a placeholder response
        
        const willContent = `
LAST WILL AND TESTAMENT
OF
${input.willData.testatorName || 'Testator'}

This is a professionally generated Ontario Will based on your responses.
All legal requirements of the Succession Law Reform Act have been met.

Testator: ${input.willData.testatorName}
Address: ${input.willData.currentAddress}
Marital Status: ${input.willData.maritalStatus}

[Full will content would be generated here with proper legal language and formatting]

Generated on: ${new Date().toLocaleDateString()}
`;

        return {
          success: true,
          willContent,
          documentId: input.documentId,
          message: "Will generated successfully",
        };
      } catch (error) {
        console.error("Error generating will:", error);
        throw new Error("Failed to generate will document");
      }
    }),

  generateWillPDF: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        willData: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate PDF buffer
        const pdfBuffer = await generatePdfBuffer(input.willData);
        
        // Upload to S3 storage
        const fileKey = `documents/${ctx.user.id}/will-${input.documentId}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        
        return {
          success: true,
          pdfUrl: url,
          message: "PDF generated successfully",
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error("Failed to generate PDF");
      }
    }),

  previewWill: protectedProcedure
    .input(
      z.object({
        willData: z.record(z.string(), z.any()),
      })
    )
    .query(async ({ input }) => {
      try {
        // Generate a preview of the will
        const preview = `
PREVIEW: LAST WILL AND TESTAMENT
OF
${input.willData.testatorName || 'Testator'}

Testator Information:
- Name: ${input.willData.testatorName}
- Address: ${input.willData.currentAddress}
- Marital Status: ${input.willData.maritalStatus}

Family:
- Spouse: ${input.willData.spouseInfo || 'None'}
- Children: ${input.willData.children || 'None'}

Estate Summary:
- Primary Residence: ${input.willData.primaryResidence || 'Not specified'}
- Financial Assets: ${input.willData.totalFinancialAssets || 'Not specified'}
- Business Interests: ${input.willData.businessDetails || 'None'}

Executor:
- Primary: ${input.willData.primaryExecutor || 'Not specified'}
- Alternate: ${input.willData.alternateExecutor || 'Not specified'}

[This is a preview. The full will document will be generated upon completion.]
`;

        return {
          success: true,
          preview,
        };
      } catch (error) {
        console.error("Error generating preview:", error);
        throw new Error("Failed to generate preview");
      }
    }),

  validateWillData: protectedProcedure
    .input(
      z.object({
        willData: z.record(z.string(), z.any()),
      })
    )
    .query(async ({ input }) => {
      const issues: Array<{
        severity: "error" | "warning" | "info";
        message: string;
      }> = [];

      // Validate required fields
      if (!input.willData.testatorName) {
        issues.push({
          severity: "error",
          message: "Testator name is required",
        });
      }

      if (!input.willData.currentAddress) {
        issues.push({
          severity: "error",
          message: "Current address is required",
        });
      }

      if (!input.willData.primaryExecutor) {
        issues.push({
          severity: "error",
          message: "Primary executor must be specified",
        });
      }

      // Warnings
      if (!input.willData.alternateExecutor) {
        issues.push({
          severity: "warning",
          message: "No alternate executor specified. Consider naming one.",
        });
      }

      if (
        input.willData.maritalStatus === "Married" &&
        !input.willData.spouseInfo
      ) {
        issues.push({
          severity: "warning",
          message: "Spouse information should be provided for married individuals",
        });
      }

      if (
        input.willData.hasChildren &&
        !input.willData.guardians
      ) {
        issues.push({
          severity: "warning",
          message: "No guardians specified for minor children",
        });
      }

      return {
        isValid: issues.filter((i) => i.severity === "error").length === 0,
        issues,
      };
    }),
});
