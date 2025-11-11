// Client-side SVG to PNG conversion utility

export interface ExportSize {
  width: number;
  height: number;
  name: string;
}

export const EXPORT_SIZES: Record<string, ExportSize> = {
  instagram: { width: 1080, height: 1350, name: 'Instagram Portrait' },
  og: { width: 1200, height: 630, name: 'Social Share (OG)' },
  story: { width: 1080, height: 1920, name: 'Instagram Story' },
};

/**
 * Convert SVG element to PNG and download
 * Handles external images (like GitHub avatars) by converting them to data URLs
 */
export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  size: ExportSize,
  filename: string = 'github-unwrapped-2025'
): Promise<void> {
  try {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Set explicit dimensions
    clonedSvg.setAttribute('width', size.width.toString());
    clonedSvg.setAttribute('height', size.height.toString());
    
    // Convert all external images to data URLs to avoid CORS issues
    const images = clonedSvg.querySelectorAll('image');
    await Promise.all(
      Array.from(images).map(async (img) => {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          try {
            const dataUrl = await imageUrlToDataUrl(href);
            img.setAttribute('href', dataUrl);
            img.removeAttribute('xlink:href');
          } catch (error) {
            console.warn('Failed to convert image to data URL:', href, error);
          }
        }
      })
    );
    
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    
    // Create a blob from SVG string
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Load SVG into an image
    const img = new Image();
    img.width = size.width;
    img.height = size.height;
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Fill with transparent background
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.drawImage(img, 0, 0, size.width, size.height);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Could not create PNG blob');
      }
      
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${filename}-${size.width}x${size.height}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
    
  } catch (error) {
    console.error('Error exporting SVG to PNG:', error);
    throw new Error('Failed to export image. Please try again.');
  }
}

/**
 * Convert an image URL to a data URL (handles CORS)
 */
async function imageUrlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    // Add timestamp to avoid cache issues
    img.src = url + (url.includes('?') ? '&' : '?') + '_=' + Date.now();
  });
}

/**
 * Generate a data URL from SVG for preview purposes
 */
export function svgToDataUrl(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
}
