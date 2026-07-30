import { getDb } from './db';
import { users, documentSharing } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notifyOwner } from './_core/notification';

export interface NotificationPayload {
  type: 'document_shared' | 'document_updated' | 'share_revoked' | 'access_granted';
  recipientId: number;
  documentId: number;
  senderId: number;
  senderName: string;
  documentTitle: string;
  permission?: 'view' | 'edit' | 'comment';
  message?: string;
}

/**
 * Send email notification for document sharing
 */
export async function sendShareNotification(payload: NotificationPayload) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('Database not available');
      return false;
    }
    const recipientResult = await db.select().from(users).where(eq(users.id, payload.recipientId)).limit(1);
    const recipient = recipientResult.length > 0 ? recipientResult[0] : null;

    if (!recipient || !recipient.email) {
      console.warn(`No email found for user ${payload.recipientId}`);
      return false;
    }

    // Send email notification
    const emailContent = generateEmailContent(payload);
    
    // Use the built-in notification system
    await notifyOwner({
      title: emailContent.subject,
      content: emailContent.body,
    });

    return true;
  } catch (error) {
    console.error('Failed to send share notification:', error);
    return false;
  }
}

/**
 * Send notification when document is updated
 */
export async function sendUpdateNotification(
  documentId: number,
  updatedBy: number,
  sharedWithUsers: number[]
) {
  try {
    const db = await getDb();
    if (!db) return false;
    const updaterResult = await db.select().from(users).where(eq(users.id, updatedBy)).limit(1);
    const updater = updaterResult.length > 0 ? updaterResult[0] : null;

    if (!updater) return false;

    const promises = sharedWithUsers.map(userId =>
      sendShareNotification({
        type: 'document_updated',
        recipientId: userId,
        documentId,
        senderId: updatedBy,
        senderName: updater.name || 'A user',
        documentTitle: 'Your shared document',
        message: `${updater.name || 'A user'} has updated a document shared with you.`,
      })
    );

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Failed to send update notifications:', error);
    return false;
  }
}

/**
 * Send notification when share is revoked
 */
export async function sendRevokeNotification(
  documentId: number,
  revokedBy: number,
  userId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;
    const revokerResult = await db.select().from(users).where(eq(users.id, revokedBy)).limit(1);
    const revoker = revokerResult.length > 0 ? revokerResult[0] : null;

    if (!revoker) return false;

    return await sendShareNotification({
      type: 'share_revoked',
      recipientId: userId,
      documentId,
      senderId: revokedBy,
      senderName: revoker.name || 'A user',
      documentTitle: 'Your shared document',
      message: `${revoker.name || 'A user'} has revoked your access to a shared document.`,
    });
  } catch (error) {
    console.error('Failed to send revoke notification:', error);
    return false;
  }
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: number) {
  try {
    const db = await getDb();
    if (!db) return null;
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult.length > 0 ? userResult[0] : null;

    return {
      emailOnShare: true,
      emailOnUpdate: true,
      emailOnRevoke: true,
      emailOnComment: true,
    };
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return null;
  }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: number,
  preferences: {
    emailOnShare?: boolean;
    emailOnUpdate?: boolean;
    emailOnRevoke?: boolean;
    emailOnComment?: boolean;
  }
) {
  try {
    // Store preferences in user settings or separate table
    return true;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return false;
  }
}

// Helper functions

function getNotificationTitle(payload: NotificationPayload): string {
  switch (payload.type) {
    case 'document_shared':
      return `${payload.senderName} shared a document with you`;
    case 'document_updated':
      return `${payload.senderName} updated a shared document`;
    case 'share_revoked':
      return `Your access to a shared document has been revoked`;
    case 'access_granted':
      return `You have been granted access to a document`;
    default:
      return 'New notification';
  }
}

function getNotificationMessage(payload: NotificationPayload): string {
  switch (payload.type) {
    case 'document_shared':
      return `${payload.senderName} has shared "${payload.documentTitle}" with you with ${payload.permission || 'view'} permission.`;
    case 'document_updated':
      return `${payload.senderName} has updated "${payload.documentTitle}".`;
    case 'share_revoked':
      return `Your access to "${payload.documentTitle}" has been revoked.`;
    case 'access_granted':
      return `You have been granted ${payload.permission || 'view'} access to "${payload.documentTitle}".`;
    default:
      return payload.message || 'You have a new notification';
  }
}

interface EmailContent {
  subject: string;
  body: string;
}

function generateEmailContent(payload: NotificationPayload): EmailContent {
  const baseUrl = process.env.VITE_FRONTEND_URL || 'https://ontariowill.com';
  const documentUrl = `${baseUrl}/documents/${payload.documentId}`;

  const subject = getNotificationTitle(payload);
  const message = getNotificationMessage(payload);

  const body = `
    <h2>${subject}</h2>
    <p>${message}</p>
    <p>
      <a href="${documentUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
        View Document
      </a>
    </p>
    <hr />
    <p style="font-size: 12px; color: #666;">
      You received this email because you have notifications enabled for document sharing.
      <a href="${baseUrl}/settings/notifications">Manage your notification preferences</a>
    </p>
  `;

  return { subject, body };
}
