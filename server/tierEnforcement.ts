import { TRPCError } from "@trpc/server";

/**
 * Check if user has premium tier access
 * For now, this is a placeholder that checks user role
 * In production, this would query a subscriptions table
 */
export function checkPremiumAccess(userId: number, userRole?: string): boolean {
  // Admin users always have premium access
  if (userRole === "admin") {
    return true;
  }
  
  // TODO: Query subscriptions table to check actual premium status
  // For now, return false to enforce premium requirement
  return false;
}

/**
 * Enforce premium tier requirement
 * Throws TRPCError if user doesn't have premium access
 */
export function requirePremium(userId: number, userRole?: string): void {
  if (!checkPremiumAccess(userId, userRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires a Premium subscription. Please upgrade your plan to continue.",
    });
  }
}

/**
 * Get user's current plan tier
 * Returns 'free' or 'premium'
 */
export function getUserTier(userId: number, userRole?: string): "free" | "premium" {
  return checkPremiumAccess(userId, userRole) ? "premium" : "free";
}

/**
 * Check if user can perform action based on tier
 */
export function canPerformAction(
  userId: number,
  action: "advanced_questions" | "unlimited_documents" | "priority_support" | "export_formats",
  userRole?: string
): boolean {
  const tier = getUserTier(userId, userRole);
  
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
