/**
 * Estimate the Base64 size from binary size
 * Base64 encoding increases size by approximately 4/3
 */
export function estimateBase64Size(binarySize: number): number {
  return Math.ceil(binarySize / 3) * 4;
}

/**
 * Check if Base64 size is within the URL scheme limit
 * iOS recommended PDF size: 500KB → Base64 size: ~683KB
 */
export const BASE64_SIZE_LIMIT = Math.ceil((500 * 1024 * 4) / 3); // 683KB (500KB PDF equivalent)

export function isWithinSizeLimit(base64Size: number): boolean {
  return base64Size <= BASE64_SIZE_LIMIT;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
