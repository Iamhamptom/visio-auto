"use client";

/**
 * Retro-modern SVG icons inspired by Windows 2001/XP era.
 * Each icon sits on a subtle pixel grid with clean geometric shapes.
 * Designed at 24x24 with emerald accent colors.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const base = "shrink-0";

export function IconSignal({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      {/* Pixel grid bg */}
      <rect x="0" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      <rect x="20" y="20" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Radar sweep */}
      <circle cx="12" cy="12" r="9" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
      <circle cx="12" cy="12" r="5" stroke="rgba(16,185,129,0.15)" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.5" fill="rgba(16,185,129,0.8)" />
      {/* Sweep line */}
      <line x1="12" y1="12" x2="19" y2="7" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeLinecap="square" />
      {/* Detection blip */}
      <rect x="17" y="5" width="3" height="3" fill="rgba(16,185,129,0.4)" />
    </svg>
  );
}

export function IconEmail({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="0" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Envelope */}
      <rect x="3" y="6" width="18" height="12" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.04)" />
      {/* Flap */}
      <path d="M3 6L12 13L21 6" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeLinecap="square" />
      {/* Send arrow */}
      <path d="M18 14L22 10L18 6" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
    </svg>
  );
}

export function IconCalendar({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="20" y="20" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Calendar body */}
      <rect x="3" y="5" width="18" height="16" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.04)" />
      {/* Header bar */}
      <rect x="3" y="5" width="18" height="4" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
      {/* Hooks */}
      <line x1="8" y1="3" x2="8" y2="7" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeLinecap="square" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" strokeLinecap="square" />
      {/* Date grid */}
      <rect x="6" y="12" width="3" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="10.5" y="12" width="3" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="15" y="12" width="3" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="6" y="16" width="3" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="10.5" y="16" width="3" height="2" fill="rgba(16,185,129,0.6)" />
      <rect x="15" y="16" width="3" height="2" fill="rgba(16,185,129,0.15)" />
    </svg>
  );
}

export function IconPhone({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="0" y="20" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Phone body */}
      <rect x="6" y="2" width="12" height="20" rx="1" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.04)" />
      {/* Screen */}
      <rect x="8" y="5" width="8" height="12" fill="rgba(16,185,129,0.08)" />
      {/* Signal waves */}
      <path d="M14 7C15.5 7 16.5 8 16.5 9.5" stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeLinecap="square" fill="none" />
      <path d="M14 9C14.8 9 15.3 9.5 15.3 10.2" stroke="rgba(16,185,129,0.3)" strokeWidth="1" strokeLinecap="square" fill="none" />
      {/* Notification dot */}
      <rect x="9" y="8" width="2" height="2" fill="rgba(16,185,129,0.6)" />
      {/* Home button */}
      <circle cx="12" cy="19.5" r="1" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

export function IconPipeline({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="20" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Funnel shape */}
      <path d="M3 4H21L15 12V20L9 22V12L3 4Z" stroke="rgba(16,185,129,0.4)" strokeWidth="1" fill="rgba(16,185,129,0.06)" strokeLinejoin="miter" />
      {/* Flow lines */}
      <line x1="6" y1="7" x2="18" y2="7" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      {/* Active indicator */}
      <rect x="11" y="14" width="2" height="4" fill="rgba(16,185,129,0.5)" />
    </svg>
  );
}

export function IconWhatsApp({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="0" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Chat bubble */}
      <path d="M4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C10.5 20 9.1 19.6 7.9 18.9L4 20L5.1 16.1C4.4 14.9 4 13.5 4 12Z"
        stroke="rgba(16,185,129,0.4)" strokeWidth="1" fill="rgba(16,185,129,0.06)" />
      {/* Check marks (delivered) */}
      <path d="M9 12L11 14L15 10" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5" strokeLinecap="square" fill="none" />
    </svg>
  );
}

export function IconBrain({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="20" y="20" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Brain outline */}
      <path d="M12 4C8 4 5 7 5 10C5 12 6 13.5 7 14.5C7 16 7.5 18 9 19H15C16.5 18 17 16 17 14.5C18 13.5 19 12 19 10C19 7 16 4 12 4Z"
        stroke="rgba(16,185,129,0.35)" strokeWidth="1" fill="rgba(16,185,129,0.05)" />
      {/* Neural connections — pixel style */}
      <line x1="12" y1="6" x2="12" y2="17" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      <rect x="9" y="8" width="2" height="2" fill="rgba(16,185,129,0.3)" />
      <rect x="13" y="8" width="2" height="2" fill="rgba(16,185,129,0.2)" />
      <rect x="11" y="11" width="2" height="2" fill="rgba(16,185,129,0.5)" />
      <rect x="9" y="14" width="2" height="2" fill="rgba(16,185,129,0.2)" />
      <rect x="13" y="14" width="2" height="2" fill="rgba(16,185,129,0.3)" />
      {/* Connections */}
      <line x1="10" y1="9" x2="12" y2="12" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
      <line x1="14" y1="9" x2="12" y2="12" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

export function IconCar({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="0" y="20" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Car body — boxy/pixel-inspired */}
      <path d="M3 15L5 10H19L21 15" stroke="rgba(16,185,129,0.4)" strokeWidth="1" strokeLinejoin="miter" />
      <rect x="3" y="15" width="18" height="4" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.06)" />
      {/* Roof */}
      <path d="M7 10L9 6H15L17 10" stroke="rgba(16,185,129,0.25)" strokeWidth="1" fill="rgba(16,185,129,0.04)" />
      {/* Windows */}
      <rect x="9.5" y="7" width="2" height="3" fill="rgba(16,185,129,0.15)" />
      <rect x="12.5" y="7" width="2" height="3" fill="rgba(16,185,129,0.15)" />
      {/* Wheels */}
      <circle cx="7" cy="19" r="2" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.1)" />
      <circle cx="17" cy="19" r="2" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.1)" />
      {/* Headlight */}
      <rect x="19" y="15.5" width="2" height="2" fill="rgba(16,185,129,0.5)" />
    </svg>
  );
}

export function IconGlobe({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="20" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Globe */}
      <circle cx="12" cy="12" r="9" stroke="rgba(16,185,129,0.3)" strokeWidth="1" fill="rgba(16,185,129,0.04)" />
      {/* Latitude lines */}
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      {/* Longitude */}
      <ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
      {/* SA marker */}
      <rect x="13" y="15" width="3" height="3" fill="rgba(16,185,129,0.5)" />
      {/* Grid cross */}
      <line x1="3" y1="12" x2="21" y2="12" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="rgba(16,185,129,0.1)" strokeWidth="0.5" />
    </svg>
  );
}

export function IconChart({ size = 24, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${base} ${className}`}>
      <rect x="0" y="0" width="4" height="4" fill="rgba(16,185,129,0.06)" />
      {/* Axes */}
      <line x1="4" y1="20" x2="4" y2="4" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
      <line x1="4" y1="20" x2="20" y2="20" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
      {/* Bars — pixel style */}
      <rect x="6" y="14" width="3" height="6" fill="rgba(16,185,129,0.2)" />
      <rect x="10" y="10" width="3" height="10" fill="rgba(16,185,129,0.35)" />
      <rect x="14" y="6" width="3" height="14" fill="rgba(16,185,129,0.5)" />
      <rect x="18" y="8" width="3" height="12" fill="rgba(16,185,129,0.4)" />
      {/* Trend line */}
      <path d="M7.5 13L11.5 9L15.5 5L19.5 7" stroke="rgba(16,185,129,0.6)" strokeWidth="1" strokeLinecap="square" fill="none" />
    </svg>
  );
}
