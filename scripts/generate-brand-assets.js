import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

// Master SVG: Standard Version (with Squircle background, for Web & App)
const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep Obsidian & Midnight Navy -->
    <linearGradient id="shBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c16" />
      <stop offset="35%" stop-color="#0e1726" />
      <stop offset="70%" stop-color="#141c38" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>

    <!-- Center Radial Sapphire Glow -->
    <radialGradient id="shCoreGlow" cx="50%" cy="46%" r="56%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#1d4ed8" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Master Gold Gradient - Chiseled 24K Bullion -->
    <linearGradient id="shGoldMaster" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdf2" />
      <stop offset="18%" stop-color="#fde68a" />
      <stop offset="42%" stop-color="#f59e0b" />
      <stop offset="75%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>

    <!-- Gold Light Face (Illuminated Facet) -->
    <linearGradient id="shGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef9c3" />
      <stop offset="45%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Gold Shaded Face (Burnished Bronze Facet) -->
    <linearGradient id="shGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <!-- Royal Sapphire Gradient -->
    <linearGradient id="shSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>

    <!-- Platinum Page Shading -->
    <linearGradient id="shPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>

    <!-- Soft Drop Shadow -->
    <filter id="shShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <filter id="shGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Background Rounded Squircle Frame -->
  <rect width="512" height="512" rx="116" fill="url(#shBgGrad)" />
  <rect width="512" height="512" rx="116" fill="url(#shCoreGlow)" />

  <!-- 2. Heritage Dual Filigree Borders -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="none" stroke="url(#shGoldMaster)" stroke-width="2.5" opacity="0.85" />
  <rect x="30" y="30" width="452" height="452" rx="90" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.25" stroke-dasharray="6 4" />

  <!-- Four Corner Sovereign Rivets -->
  <g fill="url(#shGoldLight)">
    <!-- Top Left -->
    <polygon points="58,54 62,58 58,62 54,58" />
    <!-- Top Right -->
    <polygon points="454,54 458,58 454,62 450,58" />
    <!-- Bottom Left -->
    <polygon points="58,450 62,454 58,458 54,454" />
    <!-- Bottom Right -->
    <polygon points="454,450 458,454 454,458 450,454" />
  </g>

  <!-- 3. Classic Astrolabe / Seal Ring -->
  <g transform="translate(256, 256)">
    <!-- Outer concentric ring -->
    <circle cx="0" cy="0" r="184" fill="#070d1a" fill-opacity="0.7" stroke="url(#shGoldMaster)" stroke-width="2" />
    <circle cx="0" cy="0" r="176" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0.35" stroke-dasharray="4 6" />
    <circle cx="0" cy="0" r="146" fill="none" stroke="url(#shGoldMaster)" stroke-width="0.75" opacity="0.25" />
    <circle cx="0" cy="0" r="112" fill="none" stroke="#38bdf8" stroke-width="0.5" opacity="0.2" />

    <!-- 12 Cardinal / Meridian Axis Marks -->
    <g stroke="url(#shGoldLight)" stroke-width="1.5" opacity="0.45">
      <line x1="0" y1="-184" x2="0" y2="-174" />
      <line x1="0" y1="174" x2="0" y2="184" />
      <line x1="-184" y1="0" x2="-174" y2="0" />
      <line x1="174" y1="0" x2="184" y2="0" />
      <line x1="-127" y1="-127" x2="-120" y2="-120" stroke-width="1" opacity="0.3" />
      <line x1="120" y1="-120" x2="127" y2="-127" stroke-width="1" opacity="0.3" />
      <line x1="-127" y1="127" x2="-120" y2="120" stroke-width="1" opacity="0.3" />
      <line x1="120" y1="120" x2="127" y2="127" stroke-width="1" opacity="0.3" />
    </g>
  </g>

  <!-- 4. Classical Heraldic Laurel Arc (Left & Right Flanks) -->
  <g fill="url(#shGoldLight)" opacity="0.55">
    <!-- Left Laurel Leaf Clusters -->
    <path d="M118 200 C125 195 136 200 134 210 C128 208 122 205 118 200 Z" />
    <path d="M108 230 C116 226 126 232 123 241 C117 239 111 235 108 230 Z" />
    <path d="M104 262 C112 260 120 266 117 275 C111 272 106 268 104 262 Z" />
    <path d="M108 295 C116 294 123 302 118 310 C113 307 109 301 108 295 Z" />
    <path d="M118 326 C125 328 129 337 124 345 C120 340 117 334 118 326 Z" />
    <path d="M134 354 C140 358 142 369 135 375 C132 370 131 362 134 354 Z" />

    <!-- Right Laurel Leaf Clusters -->
    <path d="M394 200 C387 195 376 200 378 210 C384 208 390 205 394 200 Z" />
    <path d="M404 230 C396 226 386 232 389 241 C395 239 401 235 404 230 Z" />
    <path d="M408 262 C400 260 392 266 395 275 C401 272 406 268 408 262 Z" />
    <path d="M404 295 C396 294 389 302 394 310 C399 307 403 301 404 295 Z" />
    <path d="M394 326 C387 328 383 337 388 345 C392 340 395 334 394 326 Z" />
    <path d="M378 354 C372 358 370 369 377 375 C380 370 381 362 378 354 Z" />
  </g>

  <!-- 5. Folio of Truth Base (Open Manuscript Pedestal) -->
  <g filter="url(#shShadow)">
    <!-- Left Manuscript Page Block -->
    <path d="M256 376 C232 356 195 348 152 352 L158 392 C198 388 232 396 256 414 Z" fill="url(#shSapphire)" />
    <path d="M256 370 C234 352 200 344 160 348 L164 384 C202 380 234 388 256 404 Z" fill="url(#shPageGrad)" opacity="0.95" />

    <!-- Right Manuscript Page Block -->
    <path d="M256 376 C280 356 317 348 360 352 L354 392 C314 388 280 396 256 414 Z" fill="url(#shSapphire)" />
    <path d="M256 370 C278 352 312 344 352 348 L348 384 C310 380 278 388 256 404 Z" fill="url(#shPageGrad)" opacity="0.9" />

    <!-- Page spine fold highlight -->
    <line x1="256" y1="368" x2="256" y2="414" stroke="url(#shGoldMaster)" stroke-width="2.5" stroke-linecap="round" />

    <!-- Fine Guilloche Editorial Lines on Left Page -->
    <line x1="180" y1="360" x2="238" y2="364" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <line x1="182" y1="370" x2="234" y2="374" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />

    <!-- Fine Guilloche Editorial Lines on Right Page -->
    <line x1="274" y1="364" x2="332" y2="360" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
    <line x1="278" y1="374" x2="330" y2="370" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
  </g>

  <!-- 6. The Crown Triad of Stars (Top Crest: Quick · Deep · Verified) -->
  <g fill="url(#shGoldMaster)">
    <!-- Center Sovereign Star -->
    <polygon points="256,90 260,102 272,106 260,110 256,122 252,110 240,106 252,102" />
    <!-- Left Star -->
    <polygon points="216,106 219,114 227,117 219,120 216,128 213,120 205,117 213,114" opacity="0.85" />
    <!-- Right Star -->
    <polygon points="296,106 299,114 307,117 299,120 296,128 293,120 285,117 293,114" opacity="0.85" />
  </g>

  <!-- 7. The Master Chiseled Monogram 'S' (SummaryHub Central Emblem) -->
  <g filter="url(#shShadow)">
    <!-- Outer Golden Silhouette Base -->
    <path d="
      M 334 168
      C 334 140, 302 126, 256 126
      C 204 126, 172 144, 172 176
      C 172 208, 196 222, 238 234
      L 274 245
      C 318 258, 342 276, 342 312
      C 342 352, 304 374, 256 374
      C 198 374, 168 350, 166 318
      L 204 314
      C 206 332, 226 344, 256 344
      C 284 344, 304 332, 304 310
      C 304 286, 284 272, 244 260
      L 208 249
      C 168 237, 136 216, 136 176
      C 136 132, 178 98, 256 98
      C 328 98, 370 130, 370 168
      Z
    " fill="url(#shGoldMaster)" />

    <!-- Chiseled Highlight Face (Luminescent Top & Inner Bevel) -->
    <path d="
      M 330 168
      C 330 144, 302 132, 256 132
      C 210 132, 178 148, 178 176
      C 178 202, 198 216, 238 228
      L 274 239
      C 314 251, 336 268, 336 306
      L 342 312
      C 342 276, 318 258, 274 245
      L 238 234
      C 196 222, 172 208, 172 176
      C 172 144, 204 126, 256 126
      C 302 126, 334 140, 334 168
      Z
    " fill="url(#shGoldLight)" />

    <!-- Chiseled Shadow Face (Deep Burnished Bronze Bottom & Outer Bevel) -->
    <path d="
      M 256 344
      C 284 344, 304 332, 304 310
      C 304 286, 284 272, 244 260
      L 240 266
      C 278 278, 296 290, 296 310
      C 296 326, 280 338, 256 338
      C 230 338, 212 328, 210 314
      L 204 314
      C 206 332, 226 344, 256 344
      Z
    " fill="url(#shGoldDark)" />
  </g>

  <!-- 8. The Hub Nexus: Radiant 8-Point Diamond Beacon of Truth -->
  <g transform="translate(256, 242)" filter="url(#shGlow)">
    <!-- Star Rays Background Glow -->
    <circle cx="0" cy="0" r="16" fill="#60a5fa" opacity="0.4" />

    <!-- 8-Point Beacon Star in Polished Gold & Diamond White -->
    <!-- Primary Vertical & Horizontal Spikes -->
    <polygon points="0,-34 7,-8 34,0 7,8 0,34 -7,8 -34,0 -7,-8" fill="url(#shGoldMaster)" />
    <polygon points="0,-28 5,-6 28,0 5,6 0,28 -5,6 -28,0 -5,-6" fill="url(#shGoldLight)" />

    <!-- Secondary 45-degree Diagonal Spikes -->
    <polygon points="-18,-18 -3,-5 0,-18 3,-5 18,-18 5,-3 18,0 5,3 18,18 3,5 0,18 -3,5 -18,18 -5,3 -18,0 -5,-3" fill="url(#shGoldLight)" opacity="0.8" />

    <!-- Central Diamond Core (Pure Clarity) -->
    <polygon points="0,-9 9,0 0,9 -9,0" fill="#ffffff" />
    <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
  </g>

  <!-- 9. Foundation Inscription Plinth: 'SUMMARYHUB' Micro Accent -->
  <g transform="translate(256, 442)">
    <rect x="-82" y="-12" width="164" height="20" rx="6" fill="#070d1a" stroke="url(#shGoldMaster)" stroke-width="1.5" />
    <text x="0" y="2" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="800" letter-spacing="2.8" fill="url(#shGoldLight)" text-anchor="middle">SUMMARYHUB</text>
  </g>
</svg>`;

// Maskable SVG: Full bleed background, artwork scaled down 68% into safe zone
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep Obsidian & Midnight Navy (Full bleed) -->
    <linearGradient id="mshBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c16" />
      <stop offset="35%" stop-color="#0e1726" />
      <stop offset="70%" stop-color="#141c38" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>

    <!-- Center Radial Sapphire Glow -->
    <radialGradient id="mshCoreGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#1d4ed8" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Master Gold Gradient - Chiseled 24K Bullion -->
    <linearGradient id="mshGoldMaster" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdf2" />
      <stop offset="18%" stop-color="#fde68a" />
      <stop offset="42%" stop-color="#f59e0b" />
      <stop offset="75%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>

    <linearGradient id="mshGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef9c3" />
      <stop offset="45%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="mshGoldDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="50%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <linearGradient id="mshSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>

    <linearGradient id="mshPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>

    <filter id="mshShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <filter id="mshGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Full Bleed Background for Maskable Icon -->
  <rect width="512" height="512" fill="url(#mshBgGrad)" />
  <rect width="512" height="512" fill="url(#mshCoreGlow)" />

  <!-- 2. Scaled Inner Artwork centered inside the 65% safe zone -->
  <g transform="translate(82, 82) scale(0.68)">
    <!-- Heritage Dual Filigree Borders -->
    <rect x="20" y="20" width="472" height="472" rx="100" fill="none" stroke="url(#mshGoldMaster)" stroke-width="3" opacity="0.85" />
    <rect x="30" y="30" width="452" height="452" rx="90" fill="none" stroke="#38bdf8" stroke-width="1.2" opacity="0.25" stroke-dasharray="6 4" />

    <!-- Corner Sovereign Rivets -->
    <g fill="url(#mshGoldLight)">
      <polygon points="58,54 62,58 58,62 54,58" />
      <polygon points="454,54 458,58 454,62 450,58" />
      <polygon points="58,450 62,454 58,458 54,454" />
      <polygon points="454,450 458,454 454,458 450,454" />
    </g>

    <!-- Astrolabe Ring -->
    <g transform="translate(256, 256)">
      <circle cx="0" cy="0" r="184" fill="#070d1a" fill-opacity="0.75" stroke="url(#mshGoldMaster)" stroke-width="2.5" />
      <circle cx="0" cy="0" r="176" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.35" stroke-dasharray="4 6" />
      <circle cx="0" cy="0" r="146" fill="none" stroke="url(#mshGoldMaster)" stroke-width="1" opacity="0.25" />
      <circle cx="0" cy="0" r="112" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0.2" />

      <g stroke="url(#mshGoldLight)" stroke-width="1.5" opacity="0.45">
        <line x1="0" y1="-184" x2="0" y2="-174" />
        <line x1="0" y1="174" x2="0" y2="184" />
        <line x1="-184" y1="0" x2="-174" y2="0" />
        <line x1="174" y1="0" x2="184" y2="0" />
      </g>
    </g>

    <!-- Laurel Arc -->
    <g fill="url(#mshGoldLight)" opacity="0.55">
      <path d="M118 200 C125 195 136 200 134 210 C128 208 122 205 118 200 Z" />
      <path d="M108 230 C116 226 126 232 123 241 C117 239 111 235 108 230 Z" />
      <path d="M104 262 C112 260 120 266 117 275 C111 272 106 268 104 262 Z" />
      <path d="M108 295 C116 294 123 302 118 310 C113 307 109 301 108 295 Z" />
      <path d="M118 326 C125 328 129 337 124 345 C120 340 117 334 118 326 Z" />
      <path d="M134 354 C140 358 142 369 135 375 C132 370 131 362 134 354 Z" />

      <path d="M394 200 C387 195 376 200 378 210 C384 208 390 205 394 200 Z" />
      <path d="M404 230 C396 226 386 232 389 241 C395 239 401 235 404 230 Z" />
      <path d="M408 262 C400 260 392 266 395 275 C401 272 406 268 408 262 Z" />
      <path d="M404 295 C396 294 389 302 394 310 C399 307 403 301 404 295 Z" />
      <path d="M394 326 C387 328 383 337 388 345 C392 340 395 334 394 326 Z" />
      <path d="M378 354 C372 358 370 369 377 375 C380 370 381 362 378 354 Z" />
    </g>

    <!-- Folio of Truth Base -->
    <g filter="url(#mshShadow)">
      <path d="M256 376 C232 356 195 348 152 352 L158 392 C198 388 232 396 256 414 Z" fill="url(#mshSapphire)" />
      <path d="M256 370 C234 352 200 344 160 348 L164 384 C202 380 234 388 256 404 Z" fill="url(#mshPageGrad)" opacity="0.95" />

      <path d="M256 376 C280 356 317 348 360 352 L354 392 C314 388 280 396 256 414 Z" fill="url(#mshSapphire)" />
      <path d="M256 370 C278 352 312 344 352 348 L348 384 C310 380 278 388 256 404 Z" fill="url(#mshPageGrad)" opacity="0.9" />

      <line x1="256" y1="368" x2="256" y2="414" stroke="url(#mshGoldMaster)" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Crown Triad of Stars -->
    <g fill="url(#mshGoldMaster)">
      <polygon points="256,90 260,102 272,106 260,110 256,122 252,110 240,106 252,102" />
      <polygon points="216,106 219,114 227,117 219,120 216,128 213,120 205,117 213,114" opacity="0.85" />
      <polygon points="296,106 299,114 307,117 299,120 296,128 293,120 285,117 293,114" opacity="0.85" />
    </g>

    <!-- Master Monogram 'S' -->
    <g filter="url(#mshShadow)">
      <path d="
        M 334 168
        C 334 140, 302 126, 256 126
        C 204 126, 172 144, 172 176
        C 172 208, 196 222, 238 234
        L 274 245
        C 318 258, 342 276, 342 312
        C 342 352, 304 374, 256 374
        C 198 374, 168 350, 166 318
        L 204 314
        C 206 332, 226 344, 256 344
        C 284 344, 304 332, 304 310
        C 304 286, 284 272, 244 260
        L 208 249
        C 168 237, 136 216, 136 176
        C 136 132, 178 98, 256 98
        C 328 98, 370 130, 370 168
        Z
      " fill="url(#mshGoldMaster)" />

      <path d="
        M 330 168
        C 330 144, 302 132, 256 132
        C 210 132, 178 148, 178 176
        C 178 202, 198 216, 238 228
        L 274 239
        C 314 251, 336 268, 336 306
        L 342 312
        C 342 276, 318 258, 274 245
        L 238 234
        C 196 222, 172 208, 172 176
        C 172 144, 204 126, 256 126
        C 302 126, 334 140, 334 168
        Z
      " fill="url(#mshGoldLight)" />

      <path d="
        M 256 344
        C 284 344, 304 332, 304 310
        C 304 286, 284 272, 244 260
        L 240 266
        C 278 278, 296 290, 296 310
        C 296 326, 280 338, 256 338
        C 230 338, 212 328, 210 314
        L 204 314
        C 206 332, 226 344, 256 344
        Z
      " fill="url(#mshGoldDark)" />
    </g>

    <!-- Hub Beacon of Truth -->
    <g transform="translate(256, 242)" filter="url(#mshGlow)">
      <circle cx="0" cy="0" r="16" fill="#60a5fa" opacity="0.4" />
      <polygon points="0,-34 7,-8 34,0 7,8 0,34 -7,8 -34,0 -7,-8" fill="url(#mshGoldMaster)" />
      <polygon points="0,-28 5,-6 28,0 5,6 0,28 -5,6 -28,0 -5,-6" fill="url(#mshGoldLight)" />
      <polygon points="-18,-18 -3,-5 0,-18 3,-5 18,-18 5,-3 18,0 5,3 18,18 3,5 0,18 -3,5 -18,18 -5,3 -18,0 -5,-3" fill="url(#mshGoldLight)" opacity="0.8" />
      <polygon points="0,-9 9,0 0,9 -9,0" fill="#ffffff" />
      <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
    </g>

    <!-- Foundation Plinth -->
    <g transform="translate(256, 442)">
      <rect x="-82" y="-12" width="164" height="20" rx="6" fill="#070d1a" stroke="url(#mshGoldMaster)" stroke-width="1.5" />
      <text x="0" y="2" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="9" font-weight="800" letter-spacing="2.8" fill="url(#mshGoldLight)" text-anchor="middle">SUMMARYHUB</text>
    </g>
  </g>
</svg>`;

async function renderAssets() {
  console.log('Writing public/icon.svg...');
  fs.writeFileSync('public/icon.svg', masterSvg, 'utf8');

  console.log('Writing public/icon-maskable.svg...');
  fs.writeFileSync('public/icon-maskable.svg', maskableSvg, 'utf8');

  // Helper to render PNG at target size
  const renderPng = (svgString, size) => {
    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: size },
      shapeRendering: 2,
      textRendering: 1,
      imageRendering: 1
    });
    const pngData = resvg.render();
    return pngData.asPng();
  };

  console.log('Rendering public/pwa-512x512.png...');
  fs.writeFileSync('public/pwa-512x512.png', renderPng(masterSvg, 512));

  console.log('Rendering public/pwa-192x192.png...');
  fs.writeFileSync('public/pwa-192x192.png', renderPng(masterSvg, 192));

  console.log('Rendering public/apple-touch-icon.png (180x180)...');
  fs.writeFileSync('public/apple-touch-icon.png', renderPng(masterSvg, 180));

  console.log('Rendering public/favicon.png (64x64)...');
  fs.writeFileSync('public/favicon.png', renderPng(masterSvg, 64));

  console.log('Rendering public/pwa-maskable-512x512.png...');
  fs.writeFileSync('public/pwa-maskable-512x512.png', renderPng(maskableSvg, 512));

  console.log('Brand assets generation complete!');
}

renderAssets().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
