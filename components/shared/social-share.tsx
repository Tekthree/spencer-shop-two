"use client";

import { useState, useEffect } from 'react';

/**
 * Social sharing component for artwork and other pages
 * @param url - The URL to share
 * @param title - The title to share
 * @param description - The description to share
 * @returns Social sharing buttons
 */
export default function SocialShare({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  
  // Check if the browser supports the Web Share API
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);
  
  // Get the full URL
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  
  // Handle share functionality
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };
  
  // Handle copy link functionality
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };
  
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleShare}
        className="flex items-center text-sm text-gray-500 hover:text-black transition-colors"
        aria-label="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {canNativeShare ? "SHARE" : "SHARE WITH A FRIEND"}
      </button>
      
      {!canNativeShare && (
        <button
          onClick={handleCopyLink}
          className="text-sm text-gray-500 hover:text-black transition-colors"
          aria-label="Copy link"
        >
          {copied ? "COPIED!" : "COPY LINK"}
        </button>
      )}
    </div>
  );
}