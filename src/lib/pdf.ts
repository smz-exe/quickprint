let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Dynamically import PDF.js only on client side
async function getPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used on the client side');
  }

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }

  return pdfjsLib;
}

export interface ThumbnailResult {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  displayWidth: number;
  displayHeight: number;
  isCropped: boolean;
}

const THUMBNAIL_WIDTH = 320;
const MAX_THUMBNAIL_HEIGHT = 480;

/**
 * Generate a thumbnail from the first page of a PDF
 * Crops to center if the image is too tall
 */
export async function generatePdfThumbnail(file: File): Promise<ThumbnailResult> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1 });
  const scale = THUMBNAIL_WIDTH / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  // Calculate display dimensions
  const displayHeight = Math.min(scaledViewport.height, MAX_THUMBNAIL_HEIGHT);
  const isCropped = scaledViewport.height > MAX_THUMBNAIL_HEIGHT;

  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = displayHeight;

  // Render the page
  const renderContext = {
    canvasContext: context,
    viewport: scaledViewport,
    canvas: canvas,
  };

  // If cropping is needed, adjust the viewport to center crop
  if (isCropped) {
    const yOffset = (scaledViewport.height - MAX_THUMBNAIL_HEIGHT) / 2;
    context.translate(0, -yOffset);
  }

  await page.render(renderContext).promise;

  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');

  // Clean up
  pdf.destroy();

  return {
    dataUrl,
    originalWidth: viewport.width,
    originalHeight: viewport.height,
    displayWidth: THUMBNAIL_WIDTH,
    displayHeight,
    isCropped,
  };
}
