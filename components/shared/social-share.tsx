"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

/**
 * Social sharing component for artwork and other pages.
 * Adds native share support, clipboard fallback, and QR code modal options.
 */
export default function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!isQrOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsQrOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isQrOpen]);

  const fullUrl = useMemo(() => {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (typeof window !== 'undefined' && window.location.origin) {
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${window.location.origin}${path}`;
    }

    return url;
  }, [url]);

  useEffect(() => {
    if (!isQrOpen || !fullUrl) {
      return;
    }

    let isCancelled = false;

    const generateQr = async () => {
      setIsGeneratingQr(true);
      setQrError(null);

      try {
        const { toDataURL } = await import('qrcode');
        const dataUrl = await toDataURL(fullUrl, {
          margin: 1,
          scale: 8,
          color: {
            dark: '#020312ff',
            light: '#ffffffff',
          },
        });

        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        if (!isCancelled) {
          setQrError('Unable to generate QR code. Please try again.');
          setQrDataUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsGeneratingQr(false);
        }
      }
    };

    generateQr().catch((error) => {
      console.error('Unexpected QR generation error:', error);
    });

    return () => {
      isCancelled = true;
    };
  }, [fullUrl, isQrOpen]);

  const shareText = description ? `${title} – ${description}` : title;

  const handleShare = async () => {
    if (!fullUrl) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
      return;
    }

    try {
      await handleCopyLink();
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!fullUrl) return;

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard API unavailable in this environment');
      return;
    }

    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    const safeTitle = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'artwork';
    link.href = qrDataUrl;
    link.download = `${safeTitle}-qr.png`;
    link.click();
  };

  const handlePrintQr = () => {
    if (!qrDataUrl) return;

    const printWindow = window.open('', '_blank', 'width=420,height=480');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} QR Code</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { width: 320px; height: 320px; }
          </style>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </head>
        <body>
          <img src="${qrDataUrl}" alt="QR code for ${title}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const shareLabel = canNativeShare ? 'SHARE' : 'SHARE WITH A FRIEND';

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={handleShare}
          className="flex items-center text-sm text-gray-500 transition-colors hover:text-black"
          aria-label="Share"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shareLabel}
        </button>

        {!canNativeShare && (
          <button
            onClick={() => {
              handleCopyLink().catch((error) => {
                console.error('Error copying link:', error);
              });
            }}
            className="text-sm text-gray-500 transition-colors hover:text-black"
            aria-label="Copy link"
          >
            {copied ? 'COPIED!' : 'COPY LINK'}
          </button>
        )}

        <button
          onClick={() => setIsQrOpen(true)}
          className="flex items-center text-sm text-gray-500 transition-colors hover:text-black"
          aria-label="Open QR code share options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16v16H4zM9 9h6v6H9z" />
          </svg>
          QR CODE
        </button>
      </div>

      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-share-title"
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setIsQrOpen(false)}
              className="absolute right-4 top-4 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
              aria-label="Close QR code modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 id="qr-share-title" className="text-lg font-semibold text-[#020312]">
              Share via QR Code
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Scan, copy, download, or print to share this artwork instantly.
            </p>

            <div className="mt-6 flex justify-center">
              {isGeneratingQr && (
                <div className="h-48 w-48 animate-pulse rounded-lg bg-gray-100" aria-label="Generating QR code" />
              )}

              {!isGeneratingQr && qrDataUrl && (
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${title}`}
                  width={192}
                  height={192}
                  unoptimized
                  className="h-48 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
                />
              )}

              {!isGeneratingQr && qrError && (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
                  {qrError}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCopyLink().catch((error) => {
                    console.error('Error copying link:', error);
                  });
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-black hover:text-black"
              >
                {copied ? 'LINK COPIED!' : 'COPY LINK'}
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl || isGeneratingQr}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                DOWNLOAD
              </button>
              <button
                type="button"
                onClick={handlePrintQr}
                disabled={!qrDataUrl || isGeneratingQr}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-black hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                PRINT
              </button>
            </div>

            {fullUrl && (
              <p className="mt-4 truncate text-center text-xs text-gray-400" title={fullUrl}>
                {fullUrl}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
