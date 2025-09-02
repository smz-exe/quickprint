export interface PrintJob {
  txid: string;
  filename: string;
  createdAt: string; // ISO string
  binaryBytes: number;
  base64Bytes: number;
  fitToWidth: boolean;
  // Legacy fields for backward compatibility (optional)
  rotation?: 0 | 270;
  timeoutMs?: number;
  result?: {
    status: 'success' | 'fail';
    code?: number;
    message?: string;
    at: string; // ISO string
  };
}

const STORAGE_KEY = 'quickprint_history';
const MAX_HISTORY_ITEMS = 20;

export function getHistory(): PrintJob[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export function saveHistory(jobs: PrintJob[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmed = jobs.slice(-MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function addToHistory(job: PrintJob): void {
  const history = getHistory();
  history.push(job);
  saveHistory(history);
}

export function updateJobResult(txid: string, result: PrintJob['result']): void {
  const history = getHistory();
  const jobIndex = history.findIndex((job) => job.txid === txid);

  if (jobIndex !== -1) {
    history[jobIndex].result = result;
    saveHistory(history);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
