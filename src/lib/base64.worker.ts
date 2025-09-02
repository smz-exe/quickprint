/**
 * Web Worker for chunked Base64 encoding with progress reporting
 */

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

self.addEventListener('message', async (event) => {
  const { file } = event.data;

  if (!file || !(file instanceof File)) {
    self.postMessage({ error: 'Invalid file provided' });
    return;
  }

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
      self.postMessage({
        progress: Math.round(progress),
        partial: false,
      });
    }

    // Send the complete Base64 string
    self.postMessage({
      base64: base64String,
      complete: true,
    });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Failed to encode file',
    });
  }
});
