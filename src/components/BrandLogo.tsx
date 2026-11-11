import React from "react";
import { BRAND } from "../config/brand";

interface BrandLogoProps {
  variant?: "full" | "compact" | "icon" | "masthead" | "graphic";
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Classic Fountain Pen Nib Symbol (from the official The World Ledger emblem)
 */
export const PenNibSymbol: React.FC<{ 
  className?: string; 
  size?: number | string;
  fill?: string;
}> = ({ className = "h-3.5 w-3.5", size, fill = "currentColor" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      fill={fill} 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Nib Body */}
      <path d="M12 2L17.8 13.2C17.5 16.5 16.2 19.8 14.8 22H9.2C7.8 19.8 6.5 16.5 6.2 13.2L12 2Z" />
      {/* Center Slit & Ink Breather Hole */}
      <path d="M12 7.5V17" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.1" fill="white" />
    </svg>
  );
};

/**
 * High-Fidelity The World Ledger Globe Emblem
 * Features:
 * - 3D Deep Navy Globe with Longitude/Latitude Grid
 * - Detailed Continent Silhouettes (Americas, Europe, Africa, Arctic)
 * - Dual Orbit Rings
 * - Signature Crimson-Red 3D Dynamic Crescent Swoosh
 */
export const GlobeSymbol: React.FC<{ 
  className?: string; 
  size?: number | string;
}> = ({ className = "h-8 w-8", size }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Deep Navy Globe Gradient (3D Sphere Shading) */}
        <radialGradient id="twlGlobeGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="25%" stopColor="#1E3A8A" />
          <stop offset="55%" stopColor="#0F2454" />
          <stop offset="85%" stopColor="#091636" />
          <stop offset="100%" stopColor="#040B1D" />
        </radialGradient>

        {/* Crimson Red 3D Swoosh Gradient */}
        <linearGradient id="twlCrimsonSwoosh" x1="10%" y1="90%" x2="95%" y2="15%">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="20%" stopColor="#991B1B" />
          <stop offset="45%" stopColor="#DC2626" />
          <stop offset="75%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#F87171" />
        </linearGradient>

        {/* Clip path to keep continents and grid strictly inside the globe sphere */}
        <clipPath id="twlGlobeSphereClip">
          <circle cx="50" cy="46" r="33" />
        </clipPath>
      </defs>

      {/* Dark Navy Outer Orbital Crest Arc (Top) */}
      <path 
        d="M 18 36 C 16 18, 36 6, 58 6 C 74 6, 86 14, 84 24 C 82 17, 72 10, 56 10 C 38 10, 22 19, 22 36 C 22 41, 23 46, 26 50 C 22 45, 19 40, 18 36 Z" 
        fill="#0C2340"
        opacity="0.95"
      />

      {/* Main Globe Sphere Body */}
      <circle cx="50" cy="46" r="33" fill="url(#twlGlobeGrad)" stroke="#0C2340" strokeWidth="1.2" />

      {/* Clipped Globe Internal Grid & Continents */}
      <g clipPath="url(#twlGlobeSphereClip)">
        {/* Lat/Long Coordinate Grid */}
        <g stroke="#93C5FD" strokeWidth="0.65" strokeOpacity="0.38" fill="none">
          {/* Longitude lines */}
          <line x1="50" y1="13" x2="50" y2="79" />
          <ellipse cx="50" cy="46" rx="13" ry="33" />
          <ellipse cx="50" cy="46" rx="24" ry="33" />
          {/* Latitude lines */}
          <line x1="17" y1="46" x2="83" y2="46" />
          <path d="M 21 32 Q 50 38 79 32" />
          <path d="M 21 60 Q 50 54 79 60" />
          <path d="M 27 21 Q 50 25 73 21" />
          <path d="M 27 71 Q 50 67 73 71" />
        </g>

        {/* Continents (Crisp White / Light Silver-White) */}
        <g fill="#FFFFFF" fillOpacity="0.96">
          {/* Greenland & Arctic Islands */}
          <path d="M 45 18 C 47 16, 52 18, 51 22 C 48 23, 46 20, 45 18 Z" />
          <path d="M 39 17 C 42 16, 44 18, 43 20 C 40 20, 39 18, 39 17 Z" />
          <path d="M 33 21 C 36 20, 37 22, 35 24 C 33 23, 33 22, 33 21 Z" />

          {/* North America: Alaska, Canada, US, Mexico */}
          <path d="M 23 27 C 26 23, 32 23, 35 25 C 38 23, 44 24, 46 28 C 45 32, 42 34, 38 35 C 41 36, 43 39, 41 42 C 38 45, 36 43, 34 38 C 32 37, 28 35, 25 33 C 23 31, 22 28, 23 27 Z" />
          {/* Florida peninsula & Caribbean */}
          <path d="M 39 37 C 41 37, 43 40, 41 44 C 39 44, 38 41, 39 37 Z" />
          <circle cx="43" cy="42" r="0.8" />
          <circle cx="45" cy="44" r="0.8" />

          {/* Central America Bridge */}
          <path d="M 36 41 C 38 42, 40 45, 38 48 C 36 47, 35 44, 36 41 Z" />

          {/* South America */}
          <path d="M 38 48 C 42 47, 47 50, 46 56 C 45 62, 42 70, 38 74 C 36 74, 35 68, 36 62 C 34 57, 36 52, 38 48 Z" />

          {/* Europe: British Isles, Scandinavia, Western Europe, Mediterranean */}
          <path d="M 54 22 C 57 20, 60 21, 58 24 C 55 24, 54 23, 54 22 Z" />
          {/* Scandinavia */}
          <path d="M 59 17 C 62 16, 65 19, 63 24 C 60 24, 59 20, 59 17 Z" />
          {/* Western & Central Europe */}
          <path d="M 57 24 C 62 23, 67 25, 65 30 C 62 31, 60 28, 57 29 C 56 27, 56 25, 57 24 Z" />
          {/* Iberian Peninsula & Italy */}
          <path d="M 54 29 C 57 28, 59 31, 57 34 C 54 34, 53 31, 54 29 Z" />
          <path d="M 61 30 C 63 30, 64 34, 62 36 C 60 35, 60 32, 61 30 Z" />

          {/* Africa */}
          <path d="M 54 36 C 60 34, 69 36, 70 42 C 72 45, 69 49, 68 54 C 66 61, 62 67, 58 68 C 56 68, 55 64, 56 59 C 54 58, 52 53, 53 47 C 52 43, 53 38, 54 36 Z" />
          {/* Madagascar */}
          <path d="M 70 57 C 72 56, 73 59, 72 63 C 70 63, 69 60, 70 57 Z" />

          {/* Middle East / Arabia */}
          <path d="M 69 36 C 73 35, 76 38, 74 43 C 71 44, 69 40, 69 36 Z" />
        </g>

        {/* Inner Spherical Rim Glow */}
        <circle cx="50" cy="46" r="33" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.35" fill="none" />
      </g>

      {/* Lower Left Orbit Arc */}
      <path 
        d="M 18 52 C 20 64, 30 76, 46 80 C 41 77, 30 71, 24 58 Z" 
        fill="#0C2340"
        opacity="0.85"
      />

      {/* SIGNATURE CRIMSON RED DYNAMIC 3D CRESCENT SWOOSH */}
      <path 
        d="M 16 67 C 28 77, 52 80, 72 68 C 83 60, 92 46, 94 30 C 90 48, 77 62, 58 68 C 39 72, 25 70, 16 67 Z" 
        fill="url(#twlCrimsonSwoosh)"
      />

      {/* Swoosh Top Luminous Edge Highlight */}
      <path 
        d="M 18 67 C 30 76, 54 78, 74 67 C 84 59, 92 46, 94 30" 
        stroke="#FCA5A5" 
        strokeWidth="0.8" 
        strokeOpacity="0.75" 
        fill="none"
      />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  showTagline = true,
  className = "",
  onClick,
  size = "md",
}) => {
  const isInteractive = Boolean(onClick);

  // Exact Graphic Asset Variant (Raster High-Res)
  if (variant === "graphic") {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${isInteractive ? "cursor-pointer" : ""} ${className}`}
      >
        <img 
          src="/brand-logo.png" 
          alt="The World Ledger" 
          className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  // Icon Only
  if (variant === "icon") {
    const iconSizes = {
      sm: "h-7 w-7",
      md: "h-9 w-9",
      lg: "h-11 w-11",
      xl: "h-14 w-14",
    };
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${isInteractive ? "cursor-pointer" : ""} ${className}`}
      >
        <GlobeSymbol className={iconSizes[size]} />
      </div>
    );
  }

  // Masthead Variant (Traditional Broadside Newspaper Header, mirroring official logo)
  if (variant === "masthead") {
    return (
      <header className={`w-full py-6 text-center border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors ${className}`}>
        {/* Top Meta Line: Motto, Date, Edition */}
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between text-[11px] uppercase tracking-wider font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-200/80 dark:border-neutral-800 pb-2 mb-4">
          <span className="italic font-serif-title tracking-normal text-rose-700 dark:text-rose-400">
            {BRAND.mottoLatin}
          </span>
          <span className="hidden sm:inline font-semibold">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="text-neutral-600 dark:text-neutral-300 font-semibold tracking-widest">
            {BRAND.edition} · No. 1,842
          </span>
        </div>

        {/* Central Master Logo Stack */}
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto px-4 my-2">
          {/* Globe with Red Swoosh */}
          <div className="mb-3">
            <GlobeSymbol className="h-16 w-16 sm:h-20 sm:w-20" />
          </div>

          {/* "— The —" Header */}
          <div className="w-full flex items-center justify-center gap-3 mb-1">
            <div className="h-px bg-neutral-900 dark:bg-neutral-600 flex-1 max-w-[80px] sm:max-w-[120px]" />
            <span className="font-serif-title text-base sm:text-lg font-normal tracking-wide text-neutral-900 dark:text-neutral-100 italic">
              The
            </span>
            <div className="h-px bg-neutral-900 dark:bg-neutral-600 flex-1 max-w-[80px] sm:max-w-[120px]" />
          </div>

          {/* WORLD LEDGER Main Bold Wordmark */}
          <h1 className="font-serif-masthead text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0C2340] dark:text-stone-100 uppercase leading-none my-1">
            WORLD LEDGER
          </h1>

          {/* Red Rule with Centered Fountain Pen Nib */}
          <div className="w-full flex items-center justify-center gap-2 my-2.5">
            <div className="h-[1.5px] bg-red-600 dark:bg-red-500 flex-1 max-w-[160px] sm:max-w-[220px]" />
            <div className="text-[#0C2340] dark:text-stone-200 px-1">
              <PenNibSymbol className="h-4 w-4 fill-current" />
            </div>
            <div className="h-[1.5px] bg-red-600 dark:bg-red-500 flex-1 max-w-[160px] sm:max-w-[220px]" />
          </div>

          {/* Tagline */}
          <p className="font-serif-title text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold text-neutral-800 dark:text-neutral-300 mt-0.5">
            — {BRAND.tagline} —
          </p>
        </div>

        {/* Double Fine Rule */}
        <div className="mt-5 border-t-2 border-b border-neutral-900 dark:border-neutral-700 h-1 max-w-7xl mx-auto" />
      </header>
    );
  }

  // Compact Variant (Mobile, drawer, side headers)
  if (variant === "compact") {
    return (
      <div 
        onClick={onClick}
        className={`group flex items-center gap-2.5 ${isInteractive ? "cursor-pointer focus:outline-none" : ""} ${className}`}
      >
        <GlobeSymbol className="h-8 w-8" />
        <div className="min-w-0">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-serif-masthead text-[14px] font-black tracking-tight text-[#0C2340] dark:text-stone-100 uppercase">
              The World Ledger
            </span>
          </div>
          {showTagline && (
            <p className="mt-0.5 text-[9.5px] text-red-600 dark:text-red-400 font-serif-title italic truncate tracking-wide">
              Global Journalism Wire
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Variant (Standard App Header & Navbar)
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-2.5 sm:gap-3.5 text-left ${isInteractive ? "cursor-pointer focus:outline-none" : ""} ${className}`}
    >
      {/* Globe Emblem with Red Swoosh */}
      <div className="relative shrink-0">
        <GlobeSymbol className={size === "lg" ? "h-11 w-11" : "h-9 w-9 sm:h-10 sm:w-10"} />
        <span 
          className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" 
          title="Global Live Dispatch Wire Active"
        />
      </div>

      {/* Brand Typographic Lockup */}
      <div className="min-w-0 flex flex-col justify-center">
        {/* Main Title */}
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-serif-title text-xs sm:text-[13px] font-normal italic text-neutral-600 dark:text-neutral-400">
            The
          </span>
          <span className="font-serif-masthead text-[16px] sm:text-[18px] md:text-[20px] font-black tracking-tight text-[#0C2340] dark:text-stone-100 uppercase whitespace-nowrap">
            World Ledger
          </span>
          <span className="hidden xl:inline-flex items-center rounded-sm border border-red-500/30 bg-red-500/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300 ml-1">
            Global
          </span>
        </div>

        {/* Red Rule with Centered Fountain Pen Nib */}
        <div className="hidden xs:flex items-center gap-1.5 my-0.5 w-full max-w-[190px] sm:max-w-[230px]">
          <div className="h-[1px] bg-red-600/80 dark:bg-red-500/80 flex-1" />
          <div className="text-[#0C2340] dark:text-stone-300">
            <PenNibSymbol className="h-2.5 w-2.5 fill-current" />
          </div>
          <div className="h-[1px] bg-red-600/80 dark:bg-red-500/80 flex-1" />
        </div>

        {/* Tagline */}
        {showTagline && (
          <p className="hidden sm:block text-[8.5px] sm:text-[9.5px] font-serif-title tracking-[0.14em] uppercase font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap truncate leading-none">
            Understand the News Behind the Headlines
          </p>
        )}
      </div>
    </div>
  );
};
