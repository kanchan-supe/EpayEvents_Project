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

    QRCode.toDataURL(value, {
      width: size * 2, // high DPI / crisp rendering
      margin: 1,
      color: {
        dark: '#0f172a', // sleek dark slate
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate offline QR Code:', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-xs ${className}`}
      >
        <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

