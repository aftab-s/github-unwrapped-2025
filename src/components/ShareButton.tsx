import React, { useState } from 'react';

interface ShareButtonProps {
  username: string;
  theme: string;
}

export function ShareButton({ username, theme }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/u/${username}?theme=${theme}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTwitterShare = () => {
    const text = `Check out my GitHub Unwrapped 2025! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="space-y-3">
      <button onClick={handleCopy} className="btn w-full flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">{copied ? 'check' : 'link'}</span>
        <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
      </button>

      <button
        onClick={handleTwitterShare}
        className="w-full px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white shadow-lg"
      >
        <span className="material-symbols-outlined">share</span>
        <span>Share on Twitter</span>
      </button>

      <div className="text-sm text-center text-gray-500 mt-2">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          {shareUrl.replace('http://localhost:3000', 'githubunwrapped.com')}
        </a>
      </div>
    </div>
  );
}
