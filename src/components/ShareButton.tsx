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
      <button onClick={handleCopy} className="btn w-full">
        {copied ? '✓ Link Copied!' : '🔗 Copy Share Link'}
      </button>

      <button
        onClick={handleTwitterShare}
        className="btn w-full"
        style={{ background: '#1DA1F2' }}
      >
        🐦 Share on Twitter
      </button>

      <div className="text-sm text-center opacity-75 mt-2">
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {shareUrl.replace('http://localhost:3000', 'githubunwrapped.com')}
        </a>
      </div>
    </div>
  );
}
