import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import type { Message } from "./_core/llm";
import * as db from "./db";

/**
 * System prompt for the Ontario Wills legal assistant
 */
const LEGAL_ASSISTANT_SYSTEM_PROMPT = `You are an expert Ontario legal assistant specializing in Wills and Powers of Attorney. 
Your role is to provide accurate, helpful guidance on estate planning in Ontario.

Key responsibilities:
1. Answer questions about Ontario's Succession Law Reform Act
2. Explain will requirements and best practices
3. Clarify powers of attorney concepts
4. Provide tax and estate planning insights
5. Recommend when to consult with a lawyer

Important guidelines:
- Always emphasize that you provide information, not legal advice
- Recommend consulting a lawyer for complex situations
- Reference Ontario-specific laws and regulations
- Be clear about limitations and uncertainties
- Maintain a professional, helpful tone
- Focus on practical guidance for estate planning

When discussing documents:
- Explain the purpose and importance of each section
- Highlight compliance requirements
- Suggest best practices based on Ontario law
- Address common concerns and misconceptions`;

export const chatRouter = router({
  /**
   * Send a message to the AI legal assistant
   * Returns the assistant's response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
        documentContext: z.object({
          documentId: z.number().optional(),
          documentType: z.enum(["will", "poa"]).optional(),
          documentSummary: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Build the messages array with system prompt
        const messagesForLLM: Message[] = [
          {
            role: "system",
            content: LEGAL_ASSISTANT_SYSTEM_PROMPT,
          },
          ...input.messages,
        ];

        // Add document context if available
        if (input.documentContext?.documentSummary) {
          messagesForLLM.push({
            role: "system",
            content: `Current document context:\nType: ${input.documentContext.documentType || "unknown"}\nSummary: ${input.documentContext.documentSummary}`,
          });
        }

        // Call the LLM
        const response = await invokeLLM({
          messages: messagesForLLM,
        });

        // Extract the response content
        const assistantMessage =
          response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

        return {
          success: true,
          message: assistantMessage,
          role: "assistant" as const,
        };
      } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to process your message. Please try again.");
      }
    }),

  /**
   * Get chat history for a user
   * Returns paginated chat messages
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().max(100).default(50),
        offset: z.number().default(0),
        documentId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Import db functions here to avoid circular imports
        const { getChatHistory } = await import("./db");
        
        const messages = await getChatHistory(ctx.user.id, input.documentId);
        
        // Apply pagination
        const paginatedMessages = messages.slice(input.offset, input.offset + input.limit);
        
        return {
          success: true,
          messages: paginatedMessages,
          total: messages.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error("Error fetching chat history:", error);
        throw new Error("Failed to fetch chat history");
      }
    }),

  /**
   * Clear chat history for a user
   */
  clearHistory: protectedProcedure
    .input(
      z.object({
        documentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Import db and drizzle functions
        const { getDb } = await import("./db");
        const { chatMessages } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        
        // Delete messages for this user (optionally filtered by document)
        if (input.documentId) {
          await db.delete(chatMessages).where(
            and(
              eq(chatMessages.userId, ctx.user.id),
              eq(chatMessages.documentId, input.documentId)
            )
          );
        } else {
          await db.delete(chatMessages).where(
            eq(chatMessages.userId, ctx.user.id)
          );
        }
        
        return {
          success: true,
          message: "Chat history cleared",
        };
      } catch (error) {
        console.error("Error clearing chat history:", error);
        throw new Error("Failed to clear chat history");
      }
    }),

  /**
   * Save a chat message to history
   */
  saveMessage: protectedProcedure
    .input(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        documentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Import db function
        const { saveChatMessage } = await import("./db");
        
        const result = await saveChatMessage(
          ctx.user.id,
          input.role,
          input.content,
          input.documentId
        );
        
        return {
          success: true,
          message: "Message saved",
          messageId: (result as any)?.insertId || 0,
        };
      } catch (error) {
        console.error("Error saving message:", error);
        throw new Error("Failed to save message");
      }
    }),
});
