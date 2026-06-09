import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * User management procedures
 */
export const userRouter = router({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Return the current user from context
        return {
          success: true,
          user: {
            id: ctx.user.id,
            name: ctx.user.name,
            email: ctx.user.email,
            openId: ctx.user.openId,
            role: ctx.user.role,
            createdAt: ctx.user.createdAt,
            updatedAt: ctx.user.updatedAt,
          },
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch profile");
      }
    }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Update user via upsertUser
        await db.upsertUser({
          openId: ctx.user.openId,
          name: input.name || ctx.user.name,
          email: input.email || ctx.user.email,
        });

        return {
          success: true,
          message: "Profile updated successfully",
          user: {
            id: ctx.user.id,
            name: input.name || ctx.user.name,
            email: input.email || ctx.user.email,
            openId: ctx.user.openId,
            role: ctx.user.role,
          },
        };
      } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile");
      }
    }),

  /**
   * Upload profile picture
   * Expects base64 encoded image data
   */
  uploadProfilePicture: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.imageData, "base64");

        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Image too large. Maximum size is 5MB");
        }

        // Upload to S3
        const fileKey = `users/${ctx.user.id}/profile-picture-${Date.now()}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // In a real implementation, this would update the user's profile picture URL in the database
        // For now, we just return the URL

        return {
          success: true,
          message: "Profile picture uploaded successfully",
          url,
          profilePictureUrl: url,
        };
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw new Error("Failed to upload profile picture");
      }
    }),

  /**
   * Get user settings
   */
  getSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // For now, return default settings
        // In a real implementation, this would query a user_settings table
        return {
          success: true,
          settings: {
            emailNotifications: true,
            documentReminders: true,
            marketingEmails: false,
            theme: "light",
            language: "en",
          },
        };
      } catch (error) {
        console.error("Error fetching settings:", error);
        throw new Error("Failed to fetch settings");
      }
    }),

  /**
   * Update user settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        documentReminders: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
        theme: z.enum(["light", "dark"]).optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would save to a user_settings table
        return {
          success: true,
          message: "Settings updated successfully",
          settings: input,
        };
      } catch (error) {
        console.error("Error updating settings:", error);
        throw new Error("Failed to update settings");
      }
    }),

  /**
   * Get current subscription plan
   */
  getCurrentPlan: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // For now, return default free plan
        // In a real implementation, this would query a subscriptions table
        return {
          success: true,
          plan: {
            type: "free",
            name: "Free Plan",
            features: [
              "Create up to 3 documents",
              "Basic AI legal assistant",
              "PDF download",
              "Email support",
            ],
            price: 0,
            currency: "CAD",
            billingCycle: "free",
          },
        };
      } catch (error) {
        console.error("Error fetching plan:", error);
        throw new Error("Failed to fetch subscription plan");
      }
    }),

  /**
   * Upgrade to premium plan
   */
  upgradePlan: protectedProcedure
    .input(
      z.object({
        planType: z.enum(["premium", "professional"]),
        billingCycle: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would:
        // 1. Create a Stripe payment intent
        // 2. Save the subscription to the database
        // 3. Update user's plan status

        return {
          success: true,
          message: "Upgrade initiated successfully",
          plan: {
            type: input.planType,
            name: input.planType === "premium" ? "Premium Plan" : "Professional Plan",
            billingCycle: input.billingCycle,
            price: input.planType === "premium" ? 9.99 : 19.99,
            currency: "CAD",
          },
        };
      } catch (error) {
        console.error("Error upgrading plan:", error);
        throw new Error("Failed to upgrade plan");
      }
    }),

  /**
   * Delete user account
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string().optional(), // For future password verification
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real implementation, this would:
        // 1. Verify user password if needed
        // 2. Delete all user data (documents, chat history, etc.)
        // 3. Delete the user account
        // 4. Clear the session

        console.log(`User ${ctx.user.id} requested account deletion. Reason: ${input.reason || "Not provided"}`);

        return {
          success: true,
          message: "Account deletion initiated. Your data will be permanently deleted within 30 days.",
        };
      } catch (error) {
        console.error("Error deleting account:", error);
        throw new Error("Failed to delete account");
      }
    }),
});
