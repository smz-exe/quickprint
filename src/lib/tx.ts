/**
 * Generate a UUID v4 for transaction tracking
 */
export function generateTxId(): string {
  // Use crypto.randomUUID() if available, otherwise fallback to manual implementation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Pending job state management
 */
let pendingTxId: string | null = null;

export function setPendingTx(txId: string | null) {
  pendingTxId = txId;
}

export function getPendingTx(): string | null {
  return pendingTxId;
}

export function isPending(): boolean {
  return pendingTxId !== null;
}
