import React, { useState } from 'react';
import { exportSvgToPng, EXPORT_SIZES } from '@/lib/svg-to-png';

interface DownloadButtonProps {
  svgRef: React.RefObject<SVGSVGElement>;
  username: string;
  disabled?: boolean;
  theme?: string;
  themeColors?: any;
}

export function DownloadButton({ svgRef, username, disabled, theme = 'space', themeColors }: DownloadButtonProps) {
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
        className="group flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: themeColors?.accent || '#06b6d4',
          boxShadow: `0 10px 15px -3px ${themeColors?.accent || '#06b6d4'}30`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = themeColors?.accentSecondary || '#0891b2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = themeColors?.accent || '#06b6d4';
        }}
      >
        {downloading ? (
          <>
            <span className="spinner" style={{ width: 20, height: 20, borderWidth: '2px' }} />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined transition-transform group-hover:rotate-12">download</span>
            <span>Download PNG</span>
          </>
        )}
      </button>

      {showSizes && !disabled && (
        <div 
          className="absolute bottom-full mb-2 left-0 right-0 rounded-lg shadow-xl p-2 z-10 border"
          style={{
            backgroundColor: theme === 'minimal' ? '#ffffff' : '#1f2937',
            borderColor: theme === 'minimal' ? '#e2e8f0' : '#374151',
          }}
        >
          <div 
            className="text-sm font-semibold mb-2 px-2"
            style={{
              color: theme === 'minimal' ? '#1e293b' : '#ffffff',
            }}
          >
            Choose Size:
          </div>
          {Object.entries(EXPORT_SIZES).map(([key, size]) => (
            <button
              key={key}
              onClick={() => handleDownload(key as keyof typeof EXPORT_SIZES)}
              className="w-full text-left px-3 py-2 rounded transition-colors"
              style={{
                color: theme === 'minimal' ? '#1e293b' : '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'minimal' ? '#f1f5f9' : '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="font-medium">{size.name}</div>
              <div 
                className="text-xs"
                style={{
                  color: theme === 'minimal' ? '#64748b' : '#9ca3af',
                }}
              >
                {size.width} × {size.height} px
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
