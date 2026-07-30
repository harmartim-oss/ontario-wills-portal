/**
 * Collaborative Editing Service
 * Manages real-time document synchronization and change tracking for shared documents
 */

export interface DocumentChange {
  id: string;
  documentId: number;
  userId: number;
  userName: string;
  changeType: 'insert' | 'delete' | 'update' | 'format';
  content: string;
  position: number;
  length?: number;
  timestamp: Date;
  version: number;
}

export interface CollaborativeSession {
  id: string;
  documentId: number;
  participants: CollaborativeParticipant[];
  changes: DocumentChange[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborativeParticipant {
  userId: number;
  userName: string;
  email: string;
  cursorPosition: number;
  isActive: boolean;
  joinedAt: Date;
  color: string;
}

/**
 * Create a new collaborative session for a document
 */
export function createCollaborativeSession(
  documentId: number,
  participants: CollaborativeParticipant[]
): CollaborativeSession {
  return {
    id: `session_${documentId}_${Date.now()}`,
    documentId,
    participants,
    changes: [],
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Apply a change to the document
 */
export function applyChange(
  session: CollaborativeSession,
  change: Omit<DocumentChange, 'id' | 'version' | 'timestamp'>
): DocumentChange {
  const newChange: DocumentChange = {
    ...change,
    id: `change_${session.id}_${session.changes.length}`,
    version: session.currentVersion,
    timestamp: new Date(),
  };

  session.changes.push(newChange);
  session.currentVersion += 1;
  session.updatedAt = new Date();

  return newChange;
}

/**
 * Handle concurrent edits using Operational Transformation (OT)
 * Resolves conflicts when multiple users edit simultaneously
 */
export function transformChanges(
  localChange: DocumentChange,
  remoteChange: DocumentChange
): DocumentChange {
  // If remote change is before local change, adjust local position
  if (remoteChange.position < localChange.position) {
    if (remoteChange.changeType === 'insert') {
      return {
        ...localChange,
        position: localChange.position + remoteChange.content.length,
      };
    } else if (remoteChange.changeType === 'delete') {
      return {
        ...localChange,
        position: Math.max(remoteChange.position, localChange.position - (remoteChange.length || 0)),
      };
    }
  }

  // If remote change overlaps with local change
  if (
    remoteChange.position <= localChange.position &&
    remoteChange.position + (remoteChange.length || 0) >= localChange.position
  ) {
    if (remoteChange.changeType === 'delete') {
      // Adjust position if deletion overlaps
      const deletedLength = remoteChange.length || 0;
      const overlapStart = Math.max(remoteChange.position, localChange.position);
      const overlapEnd = Math.min(
        remoteChange.position + deletedLength,
        localChange.position + (localChange.length || 0)
      );

      if (overlapStart < overlapEnd) {
        // There's overlap, need to adjust
        return {
          ...localChange,
          position: remoteChange.position,
          length: (localChange.length || 0) - (overlapEnd - overlapStart),
        };
      }
    }
  }

  return localChange;
}

/**
 * Merge concurrent changes from multiple users
 */
export function mergeChanges(changes: DocumentChange[]): DocumentChange[] {
  // Sort by timestamp to maintain order
  const sorted = [...changes].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Apply operational transformation to resolve conflicts
  const merged: DocumentChange[] = [];

  for (let i = 0; i < sorted.length; i++) {
    let currentChange = sorted[i];

    // Transform against all previous changes
    for (let j = 0; j < i; j++) {
      currentChange = transformChanges(currentChange, sorted[j]);
    }

    merged.push(currentChange);
  }

  return merged;
}

/**
 * Get activity log for a document
 */
export function getActivityLog(session: CollaborativeSession): Array<{
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}> {
  return session.changes.map(change => ({
    timestamp: change.timestamp,
    user: change.userName,
    action: change.changeType,
    details: `${change.changeType === 'insert' ? 'Added' : change.changeType === 'delete' ? 'Removed' : 'Modified'} ${change.content.length} characters at position ${change.position}`,
  }));
}

/**
 * Get document state at a specific version
 */
export function getDocumentAtVersion(
  session: CollaborativeSession,
  version: number,
  initialContent: string = ''
): string {
  let content = initialContent;

  for (const change of session.changes) {
    if (change.version > version) break;

    switch (change.changeType) {
      case 'insert':
        content = content.slice(0, change.position) + change.content + content.slice(change.position);
        break;
      case 'delete':
        content = content.slice(0, change.position) + content.slice(change.position + (change.length || 0));
        break;
      case 'update':
        content = content.slice(0, change.position) + change.content + content.slice(change.position + (change.length || 0));
        break;
    }
  }

  return content;
}

/**
 * Detect conflicts between changes
 */
export function detectConflicts(changes: DocumentChange[]): Array<{
  change1: DocumentChange;
  change2: DocumentChange;
  conflictType: 'overlap' | 'concurrent' | 'ordering';
}> {
  const conflicts: Array<{
    change1: DocumentChange;
    change2: DocumentChange;
    conflictType: 'overlap' | 'concurrent' | 'ordering';
  }> = [];

  for (let i = 0; i < changes.length; i++) {
    for (let j = i + 1; j < changes.length; j++) {
      const change1 = changes[i];
      const change2 = changes[j];

      // Check for overlapping edits
      const end1 = change1.position + (change1.length || 0);
      const end2 = change2.position + (change2.length || 0);

      if (change1.position < end2 && change2.position < end1) {
        conflicts.push({
          change1,
          change2,
          conflictType: 'overlap',
        });
      }

      // Check for concurrent edits (same timestamp)
      if (change1.timestamp.getTime() === change2.timestamp.getTime() && change1.userId !== change2.userId) {
        conflicts.push({
          change1,
          change2,
          conflictType: 'concurrent',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Resolve conflicts using a resolution strategy
 */
export function resolveConflicts(
  conflicts: Array<{
    change1: DocumentChange;
    change2: DocumentChange;
    conflictType: string;
  }>,
  strategy: 'last-write-wins' | 'user-priority' | 'manual' = 'last-write-wins'
): DocumentChange[] {
  if (strategy === 'last-write-wins') {
    // Keep the change with the latest timestamp
    return conflicts.map(conflict =>
      conflict.change1.timestamp > conflict.change2.timestamp ? conflict.change1 : conflict.change2
    );
  }

  if (strategy === 'user-priority') {
    // Keep changes from higher priority users (could be based on role)
    return conflicts.map(conflict => conflict.change1);
  }

  // Manual resolution - return both for user to choose
  return conflicts.flatMap(conflict => [conflict.change1, conflict.change2]);
}

/**
 * Generate a summary of changes for a specific user
 */
export function getChangeSummaryForUser(
  session: CollaborativeSession,
  userId: number
): {
  totalChanges: number;
  insertions: number;
  deletions: number;
  updates: number;
  lastChange: DocumentChange | null;
} {
  const userChanges = session.changes.filter(c => c.userId === userId);

  return {
    totalChanges: userChanges.length,
    insertions: userChanges.filter(c => c.changeType === 'insert').length,
    deletions: userChanges.filter(c => c.changeType === 'delete').length,
    updates: userChanges.filter(c => c.changeType === 'update').length,
    lastChange: userChanges.length > 0 ? userChanges[userChanges.length - 1] : null,
  };
}

/**
 * Export changes in a format suitable for audit trail
 */
export function exportChanges(session: CollaborativeSession): string {
  const lines = [
    `Document ID: ${session.documentId}`,
    `Session ID: ${session.id}`,
    `Total Changes: ${session.changes.length}`,
    `Current Version: ${session.currentVersion}`,
    '',
    'Change History:',
    '---',
  ];

  for (const change of session.changes) {
    lines.push(`[${change.timestamp.toISOString()}] ${change.userName} (v${change.version})`);
    lines.push(`  Type: ${change.changeType}`);
    lines.push(`  Position: ${change.position}`);
    if (change.length) lines.push(`  Length: ${change.length}`);
    lines.push(`  Content: ${change.content.substring(0, 100)}${change.content.length > 100 ? '...' : ''}`);
    lines.push('');
  }

  return lines.join('\n');
}
