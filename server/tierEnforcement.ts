import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Check if user has premium tier access
 * Queries the subscriptions table to determine actual tier
 */
export async function checkPremiumAccess(userId: number, userRole?: string): Promise<boolean> {
  // Admin users always have premium access
  if (userRole === "admin") {
    return true;
  }
  
  // Query database for user's subscription tier
  const tier = await db.getUserTier(userId);
  return tier === "premium";
}

/**
 * Enforce premium tier requirement
 * Throws TRPCError if user doesn't have premium access
 */
export async function requirePremium(userId: number, userRole?: string): Promise<void> {
  const hasAccess = await checkPremiumAccess(userId, userRole);
  if (!hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a Premium subscription. Please upgrade your plan to continue.",
    });
  }
}

/**
 * Get user's current plan tier asynchronously
 * Returns 'free' or 'premium'
 */
export async function getUserTierAsync(userId: number, userRole?: string): Promise<"free" | "premium"> {
  const hasPremium = await checkPremiumAccess(userId, userRole);
  return hasPremium ? "premium" : "free";
}

/**
 * Synchronous version for simple checks (defaults to free if DB unavailable)
 */
export function getUserTierSync(userId: number, userRole?: string): "free" | "premium" {
  // Admin users always have premium access
  if (userRole === "admin") {
    return "premium";
  }
  // Default to free tier
  return "free";
}

/**
 * Check if user can perform action based on tier
 */
export async function canPerformAction(
  userId: number,
  action: "advanced_questions" | "unlimited_documents" | "priority_support" | "export_formats",
  userRole?: string
): Promise<boolean> {
  const tier = await getUserTierAsync(userId, userRole);
  
  const premiumActions = [
    "advanced_questions",
    "unlimited_documents",
    "priority_support",
    "export_formats",
  ];
  
  if (premiumActions.includes(action)) {
    return tier === "premium";
  }
  
  // Free users can perform basic actions
  return true;
}
