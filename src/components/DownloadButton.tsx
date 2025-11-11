import React, { useState } from 'react';
import { exportSvgToPng, EXPORT_SIZES } from '@/lib/svg-to-png';

interface DownloadButtonProps {
  svgRef: React.RefObject<SVGSVGElement>;
  username: string;
  disabled?: boolean;
}

export function DownloadButton({ svgRef, username, disabled }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const handleDownload = async (sizeKey: keyof typeof EXPORT_SIZES) => {
    if (!svgRef.current || downloading) return;

    setDownloading(true);
    try {
      const size = EXPORT_SIZES[sizeKey];
      await exportSvgToPng(svgRef.current, size, `${username}-github-unwrapped-2025`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
      setShowSizes(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSizes(!showSizes)}
        disabled={disabled || downloading}
        className="btn w-full"
      >
        {downloading ? (
          <span className="flex items-center justify-center">
            <span className="spinner mr-2" style={{ width: 20, height: 20 }} />
            Exporting...
          </span>
        ) : (
          '📥 Download PNG'
        )}
      </button>

      {showSizes && !disabled && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-900 rounded-lg shadow-xl p-2 z-10">
          <div className="text-sm font-semibold mb-2 px-2">Choose Size:</div>
          {Object.entries(EXPORT_SIZES).map(([key, size]) => (
            <button
              key={key}
              onClick={() => handleDownload(key as keyof typeof EXPORT_SIZES)}
              className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded transition-colors"
            >
              <div className="font-medium">{size.name}</div>
              <div className="text-xs text-gray-400">
                {size.width} × {size.height} px
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
