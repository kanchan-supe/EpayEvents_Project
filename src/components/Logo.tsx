import React from 'react';

export interface LogoProps {
  variant?: 'default' | 'teal-coral' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  variant = 'default',
  size = 'md',
  showWordmark = true,
  className = '',
}: LogoProps) {
  // Dimensions map
  const dimensions = {
    sm: { icon: 28, text: 'text-lg', space: 'gap-2' },
    md: { icon: 34, text: 'text-xl', space: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', space: 'gap-3' },
  };

  const currentDim = dimensions[size] || dimensions.md;

  // Colors mapping based on variant specifications
  // Variant 1: default -> Deep Teal (#0F766E) icon + dark text
  // Variant 2: teal-coral -> Deep Teal (#0F766E) icon + Warm Coral (#F97316) pulse line + dark text
  // Variant 3: white -> Full white version (for dark backgrounds)
  // Variant 4: dark -> Full dark version (for light backgrounds)

  let iconBgColor = '#0F766E'; // Deep Teal default
  let pulseColor = '#FFFFFF';   // White pulse by default
  let ePayTextColor = '#1C1917'; // Dark text
  let eventsTextColor = '#0F766E'; // Deep Teal

  if (variant === 'teal-coral') {
    iconBgColor = '#0F766E';
    pulseColor = '#F97316'; // Warm Coral pulse
    ePayTextColor = '#1C1917';
    eventsTextColor = '#F97316';
  } else if (variant === 'white') {
    iconBgColor = '#FFFFFF';
    pulseColor = '#0F766E';
    ePayTextColor = '#FFFFFF';
    eventsTextColor = '#F97316';
  } else if (variant === 'dark') {
    iconBgColor = '#0F172A';
    pulseColor = '#38BDF8';
    ePayTextColor = '#0F172A';
    eventsTextColor = '#475569';
  }

  return (
    <div className={`inline-flex items-center ${currentDim.space} select-none ${className}`}>
      {/* Ticket Icon with Pulse Wave */}
      <svg
        width={currentDim.icon}
        height={currentDim.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {/* Modern Rounded Ticket Body */}
        <path
          d="M 6 11 C 6 8.238 8.238 6 11 6 L 29 6 C 31.762 6 34 8.238 34 11 C 34 12.657 32.657 14 31 14 C 29.343 14 28 15.343 28 17 C 28 18.657 29.343 20 31 20 C 32.657 20 34 21.343 34 23 L 34 29 C 34 31.762 31.762 34 29 34 L 11 34 C 8.238 34 6 31.762 6 29 L 6 23 C 7.657 23 9 21.657 9 20 C 9 18.343 7.657 17 6 17 C 6 15.343 6 12.657 6 11 Z"
          fill={iconBgColor}
        />
        
        {/* Subtle Ticket Border Accent when icon is white */}
        {variant === 'white' && (
          <path
            d="M 6 11 C 6 8.238 8.238 6 11 6 L 29 6 C 31.762 6 34 8.238 34 11 C 34 12.657 32.657 14 31 14 C 29.343 14 28 15.343 28 17 C 28 18.657 29.343 20 31 20 C 32.657 20 34 21.343 34 23 L 34 29 C 34 31.762 31.762 34 29 34 L 11 34 C 8.238 34 6 31.762 6 29 L 6 23 C 7.657 23 9 21.657 9 20 C 9 18.343 7.657 17 6 17 C 6 15.343 6 12.657 6 11 Z"
            stroke="#E2E8F0"
            strokeWidth="1"
            fill="none"
          />
        )}

        {/* Rising Sound-wave / Pulse Line (4 clean, elegant peaks) */}
        <path
          d="M 11.5 20 L 14.5 20 L 16.5 15.5 L 19 24.5 L 21.5 13 L 24 22 L 26 18.5 L 28.5 20 L 29.5 20"
          stroke={pulseColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Micro Glow Dot on the highest peak */}
        <circle cx="21.5" cy="13" r="1.4" fill={pulseColor} />
      </svg>

      {/* Wordmark "ePayEvents" */}
      {showWordmark && (
        <span className={`font-sans ${currentDim.text} tracking-tight font-normal leading-none`}>
          <span className="font-extrabold" style={{ color: ePayTextColor }}>
            ePay
          </span>
          <span className="font-medium" style={{ color: eventsTextColor }}>
            Events
          </span>
        </span>
      )}
    </div>
  );
}

