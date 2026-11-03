'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function QRCodeImage({
  value,
  size = 200,
  className = '',
  alt = 'QR Code Pass',
}: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    const qrLib: any = QRCode;
    const toDataURLFn = qrLib?.toDataURL || qrLib?.default?.toDataURL;

    if (typeof toDataURLFn === 'function') {
      toDataURLFn(value, {
        width: Math.max(size * 2, 300),
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url: string) => {
          if (isMounted) {
            setDataUrl(url);
            setError(false);
          }
        })
        .catch((err: any) => {
          console.warn('QRCode offline generation error, falling back to external API:', err);
          if (isMounted) {
            // Fallback to online QR API if canvas fails
            setDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}`);
            setError(false);
          }
        });
    } else {
      // Direct fallback if function is undefined
      setDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}`);
      setError(false);
    }

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  const fallbackUrl = value ? `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(value)}` : '';

  if (error || (!dataUrl && !fallbackUrl)) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-xs ${className}`}
      >
        <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeSrc = dataUrl || fallbackUrl;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt}
      width={size}
      height={size}
      onError={() => {
        if (activeSrc !== fallbackUrl && fallbackUrl) {
          setDataUrl(fallbackUrl);
        } else {
          setError(true);
        }
      }}
      className={`object-contain block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
