import React, { useState } from 'react';

interface DownloadButtonProps {
  cardRef?: React.RefObject<HTMLDivElement>; // HTML card reference for exports (legacy support)
  username: string;
  disabled?: boolean;
  theme?: string;
  themeColors?: any;
  useDashboardMode?: boolean; // When true, download from preview endpoint instead of cardRef
}

export function DownloadButton({ 
  cardRef, 
  username, 
  disabled, 
  theme = 'space', 
  themeColors,
  useDashboardMode = false 
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPng = async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      if (useDashboardMode) {
        // Download the preview card from the preview endpoint
        const previewUrl = `/preview/desktop?username=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}`;
        
        // Open preview page in hidden iframe to trigger download
        const response = await fetch(previewUrl);
        if (!response.ok) throw new Error('Failed to fetch preview');
        
        // Instead, we'll navigate to the preview page which has its own download button
        // Or we can create an iframe and download from there
        // For better UX, we'll trigger the download from the preview API endpoint
        const link = document.createElement('a');
        link.href = `/api/preview-download?username=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}`;
        link.download = `${username}-${theme}-unwrapped-2025.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (cardRef?.current) {
        // Legacy: export from card reference using html-to-image
        const { exportHtmlToPng, CANONICAL_CARD_DIMENSIONS } = await import('@/lib/html-to-pdf');
        const storyExportSize = {
          width: CANONICAL_CARD_DIMENSIONS.width,
          height: CANONICAL_CARD_DIMENSIONS.height,
        };
        
        await exportHtmlToPng(cardRef.current, storyExportSize, `${username}-github-unwrapped-2025`, {
          backgroundColor: theme === 'minimal' ? '#ffffff' : null,
          fitToFrame: true,
        });
      } else {
        throw new Error('No export method available');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownloadPng}
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
            <span>Download Card PNG</span>
          </>
        )}
      </button>

      <p
        className="mt-2 text-center text-xs font-medium"
        style={{ color: theme === 'minimal' ? '#475569' : '#e5e7eb' }}
      >
        2480 × 3508 px (A4 Portrait)
      </p>
    </div>
  );
}
