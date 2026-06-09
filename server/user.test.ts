import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe('User Router', () => {
  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getProfile();

      expect(result.success).toBe(true);
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.user.role).toBe("user");
    });

    it('should include user timestamps', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getProfile();

      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateProfile({
        name: "Updated Name",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Profile updated successfully");
      expect(result.user.name).toBe("Updated Name");
    });

    it('should update user email', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateProfile({
        email: "newemail@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("newemail@example.com");
    });

    it('should update both name and email', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateProfile({
        name: "New Name",
        email: "new@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.user.name).toBe("New Name");
      expect(result.user.email).toBe("new@example.com");
    });

    it('should keep existing values if not provided', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateProfile({
        name: "New Name",
      });

      expect(result.user.email).toBe("test@example.com");
    });
  });

  describe('getSettings', () => {
    it('should return default settings', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getSettings();

      expect(result.success).toBe(true);
      expect(result.settings.emailNotifications).toBe(true);
      expect(result.settings.documentReminders).toBe(true);
      expect(result.settings.marketingEmails).toBe(false);
      expect(result.settings.theme).toBe('light');
      expect(result.settings.language).toBe('en');
    });
  });

  describe('updateSettings', () => {
    it('should update notification settings', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateSettings({
        emailNotifications: false,
        documentReminders: false,
      });

      expect(result.success).toBe(true);
      expect(result.settings.emailNotifications).toBe(false);
      expect(result.settings.documentReminders).toBe(false);
    });

    it('should update theme preference', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateSettings({
        theme: 'dark',
      });

      expect(result.success).toBe(true);
      expect(result.settings.theme).toBe('dark');
    });

    it('should update language preference', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.updateSettings({
        language: 'fr',
      });

      expect(result.success).toBe(true);
      expect(result.settings.language).toBe('fr');
    });
  });

  describe('getCurrentPlan', () => {
    it('should return free plan by default', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getCurrentPlan();

      expect(result.success).toBe(true);
      expect(result.plan.type).toBe('free');
      expect(result.plan.name).toBe('Free Plan');
      expect(result.plan.price).toBe(0);
      expect(result.plan.features).toHaveLength(4);
    });

    it('should include plan features', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.getCurrentPlan();

      expect(result.plan.features).toContain('Create up to 3 documents');
      expect(result.plan.features).toContain('Basic AI legal assistant');
      expect(result.plan.features).toContain('PDF download');
      expect(result.plan.features).toContain('Email support');
    });
  });

  describe('upgradePlan', () => {
    it('should upgrade to premium plan monthly', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.upgradePlan({
        planType: 'premium',
        billingCycle: 'monthly',
      });

      expect(result.success).toBe(true);
      expect(result.plan.type).toBe('premium');
      expect(result.plan.name).toBe('Premium Plan');
      expect(result.plan.price).toBe(9.99);
      expect(result.plan.billingCycle).toBe('monthly');
    });

    it('should upgrade to professional plan annually', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.upgradePlan({
        planType: 'professional',
        billingCycle: 'annual',
      });

      expect(result.success).toBe(true);
      expect(result.plan.type).toBe('professional');
      expect(result.plan.price).toBe(19.99);
      expect(result.plan.billingCycle).toBe('annual');
    });
  });

  describe('deleteAccount', () => {
    it('should initiate account deletion', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.deleteAccount({
        reason: 'No longer needed',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Account deletion initiated');
    });

    it('should handle deletion without reason', async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.deleteAccount({});

      expect(result.success).toBe(true);
    });
  });
});
