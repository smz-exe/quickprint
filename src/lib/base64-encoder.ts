/**
 * Base64 encoding with progress tracking
 */

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export interface EncodingProgress {
  progress?: number;
  base64?: string;
  complete?: boolean;
  error?: string;
}

export async function encodeFileToBase64(
  file: File,
  onProgress: (update: EncodingProgress) => void
): Promise<void> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const totalChunks = Math.ceil(uint8Array.length / CHUNK_SIZE);

    let base64String = '';

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, uint8Array.length);
      const chunk = uint8Array.slice(start, end);

      // Convert chunk to base64
      const binaryString = Array.from(chunk)
        .map((byte) => String.fromCharCode(byte))
        .join('');
      const chunkBase64 = btoa(binaryString);

      base64String += chunkBase64;

      // Report progress
      const progress = ((i + 1) / totalChunks) * 100;
      onProgress({
        progress: Math.round(progress),
      });

      // Yield to prevent blocking the UI
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Send the complete Base64 string
    onProgress({
      base64: base64String,
      complete: true,
    });
  } catch (error) {
    onProgress({
      error: error instanceof Error ? error.message : 'Failed to encode file',
    });
  }
}
