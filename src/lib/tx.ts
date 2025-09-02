/**
 * Generate a UUID v4 for transaction tracking
 */
export function generateTxId(): string {
  return crypto.randomUUID();
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
