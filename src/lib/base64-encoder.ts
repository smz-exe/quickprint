/**
 * Base64 encoding using FileReader.readAsDataURL() (same as Sample.html)
 */

export interface EncodingProgress {
  progress?: number;
  base64?: string;
  complete?: boolean;
  error?: string;
}

export function encodeFileToBase64(
  file: File,
  onProgress: (update: EncodingProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Progress tracking during file reading
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress({ progress: Math.round(progress) });
      }
    };

    // File reading completed
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remove "data:application/pdf;base64," prefix (same as Sample.html)
        const index = result.indexOf(',') + 1;
        const base64Data = result.slice(index);

        onProgress({
          base64: base64Data,
          complete: true,
        });
        resolve();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to process Base64 data';
        onProgress({ error: errorMessage });
        reject(new Error(errorMessage));
      }
    };

    // Error handling
    reader.onerror = () => {
      const errorMessage = 'Failed to read file';
      onProgress({ error: errorMessage });
      reject(new Error(errorMessage));
    };

    // Start reading file as data URL (same as Sample.html)
    reader.readAsDataURL(file);
  });
}
