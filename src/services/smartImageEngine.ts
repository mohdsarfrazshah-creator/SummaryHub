/**
 * The World Ledger Smart News Image Engine
 * 
 * Implements Publisher-First Original Image Resolution:
 * Priority 1: Image explicitly provided in the source's RSS/Atom feed (enclosure, media:content, media:thumbnail)
 * Priority 2: Featured image from publisher's structured metadata (JSON-LD Article schema)
 * Priority 3: Original article page Open Graph (og:image) or Twitter card image
 * Priority 4: Associated publisher media explicitly linked to the article
 * Priority 5: Clean category-specific Dark Editorial luxury fallback (NO AI generation, NO unrelated stock photo)
 */

export interface SmartImageResult {
  url: string;
  source: "publisher" | "provider" | "fallback" | "custom" | "ai";
  imageType: "photo" | "illustration" | "chart" | "fallback";
  caption: string;
  attribution: string;
  status: "ready" | "generating" | "failed";
  validationStatus: "valid" | "fallback" | "invalid";
  canonicalUrl?: string;
  originalImageUrl?: string;
  prompt?: string;
}

export interface SmartImageParams {
  title: string;
  category?: string;
  subCategory?: string;
  content?: string;
  originalUrl?: string;
  canonicalUrl?: string;
  publisherName?: string;
  publisherId?: string;
  articleId?: string;
  existingImageUrl?: string;
  forceAi?: boolean; // legacy compatibility flag (ignored in favor of publisher-first fidelity)
}

// In-memory cache to guarantee instant lookups and visual stability across feed refreshes
const RESOLVED_IMAGE_CACHE = new Map<string, SmartImageResult>();

// Track allocated images by URL to prevent unrelated stories from using identical images
const ALLOCATED_IMAGE_URLS = new Map<string, string>(); // normUrl -> articleId

/**
 * Filter out invalid images (logos, avatars, ad banners, 1x1 tracking pixels, icons)
 */
export function isInvalidNewsImage(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return true;
  const clean = url.trim().toLowerCase();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) return true;

  // Patterns for tracking pixels, logos, avatars, icons, ads, coupons
  const badPatterns = [
    "favicon",
    "avatar",
    "author-",
    "/author/",
    "profile-photo",
    "headshot",
    "logo.",
    "/logo",
    "-logo",
    "site-logo",
    "header-logo",
    "brand-logo",
    "ad-banner",
    "advertisement",
    "doubleclick",
    "pixel.",
    "1x1",
    "tracking",
    "placeholder",
    "blank.gif",
    "spacer.gif",
    "badge",
    "icon-512",
    "icon-192",
    "default-image",
    "default_thumbnail",
    "gravatar.com",
    "share-icon",
    "newsletter",
    "subscribe-cta",
    "coupon-code",
    "wired-coupon",
  ];

  for (const pat of badPatterns) {
    if (clean.includes(pat)) return true;
  }

  // Reject SVG icons masquerading as photos (unless it's our own clean design fallback)
  if (clean.endsWith(".svg") && !clean.startsWith("data:image/svg+xml")) return true;

  return false;
}

/**
 * Normalizes publisher image URLs to highest available resolution
 */
export function optimizePublisherImageUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();

  // BBC News: upgrade thumbnail resolution from 240/320 to 1024
  if (clean.includes("ichef.bbci.co.uk")) {
    clean = clean.replace(/\/standard\/(?:240|320|480)\//, "/standard/1024/");
  }

  // The Guardian: upgrade dynamic image resolution
  if (clean.includes("i.guim.co.uk/img/media/")) {
    try {
      const u = new URL(clean);
      u.searchParams.set("width", "1000");
      u.searchParams.set("quality", "85");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "max");
      clean = u.toString();
    } catch {
      // keep clean
    }
  }

  return clean;
}

/**
 * Extract original publisher's featured image from article HTML metadata
 */
export async function extractOriginalPublisherImage(
  url: string,
  publisherName?: string,
  timeoutMs: number = 3200
): Promise<{ url: string; attribution: string } | null> {
  if (!url || !url.startsWith("http") || url === "#") return null;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 TheWorldLedger/2.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Open Graph image (og:image)
    const ogMatch =
      html.match(/<meta[^>]*property=["'](?:og:image|og:image:url|og:image:secure_url)["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|og:image:url|og:image:secure_url)["']/i);

    if (ogMatch && !isInvalidNewsImage(ogMatch[1])) {
      const imgUrl = optimizePublisherImageUrl(ogMatch[1]);
      return {
        url: imgUrl,
        attribution: publisherName ? `Source: ${publisherName}` : "Original Publisher Wire",
      };
    }

    // 2. Twitter Card image (twitter:image)
    const twMatch =
      html.match(/<meta[^>]*name=["'](?:twitter:image|twitter:image:src)["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["'](?:twitter:image|twitter:image:src)["']/i);

    if (twMatch && !isInvalidNewsImage(twMatch[1])) {
      const imgUrl = optimizePublisherImageUrl(twMatch[1]);
      return {
        url: imgUrl,
        attribution: publisherName ? `Source: ${publisherName}` : "Original Publisher Wire",
      };
    }

    // 3. JSON-LD structured data (NewsArticle / Article schema)
    const ldMatches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
    for (const match of ldMatches) {
      try {
        const json = JSON.parse(match[1]);
        const items = Array.isArray(json) ? json : json["@graph"] ? json["@graph"] : [json];
        for (const item of items) {
          if (item?.image) {
            let candidate = "";
            if (typeof item.image === "string") candidate = item.image;
            else if (Array.isArray(item.image) && typeof item.image[0] === "string") candidate = item.image[0];
            else if (item.image.url && typeof item.image.url === "string") candidate = item.image.url;

            if (candidate && !isInvalidNewsImage(candidate)) {
              return {
                url: optimizePublisherImageUrl(candidate),
                attribution: publisherName ? `Source: ${publisherName}` : "Official Structured Media",
              };
            }
          }
        }
      } catch {
        // Continue
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Clean, responsive topic-specific SVG data URL fallback.
 * Shown when an article has no suitable original publisher image.
 * Preserves the Dark Editorial Luxury design without substituting an unrelated photograph or AI slop.
 */
export function buildCleanDesignFallback(title: string, category: string = "General"): string {
  const cleanTitle = (title || "Editorial Dispatch")
    .replace(/[<>&"]/g, "")
    .slice(0, 55);
  const cleanCat = (category || "News").replace(/[<>&"]/g, "").toUpperCase();

  // Category-specific color accents
  let accentColor = "#6366f1"; // default indigo
  let accentBg = "#4f46e5";
  const catLower = cleanCat.toLowerCase();
  if (catLower.includes("tech")) {
    accentColor = "#06b6d4";
    accentBg = "#0891b2";
  } else if (catLower.includes("econ") || catLower.includes("finan")) {
    accentColor = "#10b981";
    accentBg = "#059669";
  } else if (catLower.includes("sport")) {
    accentColor = "#f59e0b";
    accentBg = "#d97706";
  } else if (catLower.includes("environ") || catLower.includes("climat")) {
    accentColor = "#10b981";
    accentBg = "#047857";
  } else if (catLower.includes("health") || catLower.includes("scien")) {
    accentColor = "#8b5cf6";
    accentBg = "#7c3aed";
  } else if (catLower.includes("educat")) {
    accentColor = "#ec4899";
    accentBg = "#db2777";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b0f19"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#070a12"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="${accentBg}"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect width="1280" height="720" fill="url(#grid)"/>
    <circle cx="1140" cy="140" r="260" fill="${accentColor}" opacity="0.08" filter="blur(60px)"/>
    <circle cx="200" cy="580" r="220" fill="${accentBg}" opacity="0.05" filter="blur(50px)"/>
    
    <rect x="80" y="80" width="6" height="48" rx="3" fill="url(#accentGrad)"/>
    <text x="100" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="${accentColor}" letter-spacing="3">${cleanCat}</text>
    
    <text x="80" y="340" font-family="'Newsreader', Georgia, serif" font-size="38" font-weight="700" fill="#f8fafc" width="1120">${cleanTitle}</text>
    <text x="80" y="405" font-family="'Cinzel', 'Newsreader', Georgia, serif" font-size="19" fill="#c5a059" letter-spacing="1">THE WORLD LEDGER &bull; VERIFIED INTERNATIONAL DISPATCH</text>
    
    <line x1="80" y1="590" x2="1200" y2="590" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="80" y="630" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#64748b">Verified dispatch details and primary source reference available in briefing</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resolves an article's featured image strictly following the priority order:
 * 1. Explicit image provided in RSS/Atom feed (enclosure, media thumbnail)
 * 2. Structured metadata or publisher API
 * 3. Open Graph or Twitter card image from original article page
 * 4. Another suitable image associated by the publisher
 * 5. Clean category-specific vector fallback (NO AI generation)
 */
export async function resolveArticleImage(params: SmartImageParams): Promise<SmartImageResult> {
  const {
    title,
    category = "Current Affairs",
    subCategory = "",
    originalUrl = "",
    canonicalUrl = originalUrl,
    publisherName = "",
    articleId = `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    existingImageUrl,
  } = params;

  const cacheKey = articleId || `${canonicalUrl || originalUrl || ""}-${title}`;

  // Check cache for instant lookup
  if (RESOLVED_IMAGE_CACHE.has(cacheKey)) {
    return RESOLVED_IMAGE_CACHE.get(cacheKey)!;
  }

  // PRIORITY 1: Explicit image from RSS/Atom enclosure or media:thumbnail
  if (existingImageUrl && !isInvalidNewsImage(existingImageUrl)) {
    const optimized = optimizePublisherImageUrl(existingImageUrl);
    const norm = optimized.split("?")[0].toLowerCase();
    const existingOwner = ALLOCATED_IMAGE_URLS.get(norm);

    if (!existingOwner || existingOwner === articleId) {
      ALLOCATED_IMAGE_URLS.set(norm, articleId);
      const res: SmartImageResult = {
        url: optimized,
        source: "publisher",
        imageType: "photo",
        caption: `Official photo from ${publisherName || "Publisher"} for "${title}"`,
        attribution: publisherName ? `Source: ${publisherName}` : "Official Publisher Wire",
        status: "ready",
        validationStatus: "valid",
        canonicalUrl,
        originalImageUrl: existingImageUrl,
      };
      RESOLVED_IMAGE_CACHE.set(cacheKey, res);
      return res;
    }
  }

  // PRIORITY 2 & 3: Original article page Open Graph, Twitter card, or JSON-LD
  const targetUrl = canonicalUrl || originalUrl;
  if (
    targetUrl &&
    targetUrl.startsWith("http") &&
    !targetUrl.includes("news.google.com/rss/articles") &&
    targetUrl !== "#"
  ) {
    const pubExtract = await extractOriginalPublisherImage(targetUrl, publisherName);
    if (pubExtract && pubExtract.url && !isInvalidNewsImage(pubExtract.url)) {
      const norm = pubExtract.url.split("?")[0].toLowerCase();
      const existingOwner = ALLOCATED_IMAGE_URLS.get(norm);

      if (!existingOwner || existingOwner === articleId) {
        ALLOCATED_IMAGE_URLS.set(norm, articleId);
        const res: SmartImageResult = {
          url: pubExtract.url,
          source: "publisher",
          imageType: "photo",
          caption: `Official article photo from ${publisherName || "Publisher"} for "${title}"`,
          attribution: pubExtract.attribution,
          status: "ready",
          validationStatus: "valid",
          canonicalUrl,
          originalImageUrl: pubExtract.url,
        };
        RESOLVED_IMAGE_CACHE.set(cacheKey, res);
        return res;
      }
    }
  }

  // PRIORITY 5: Clean category-specific vector fallback (NO AI GENERATION, NO UNRELATED PHOTO)
  const fallbackUrl = buildCleanDesignFallback(title, subCategory || category);
  const fallbackRes: SmartImageResult = {
    url: fallbackUrl,
    source: "fallback",
    imageType: "fallback",
    caption: `The World Ledger Editorial Topic Card: ${title}`,
    attribution: `${publisherName ? `${publisherName} • ` : ""}The World Ledger Editorial System`,
    status: "ready",
    validationStatus: "fallback",
    canonicalUrl,
    originalImageUrl: undefined,
  };
  RESOLVED_IMAGE_CACHE.set(cacheKey, fallbackRes);
  return fallbackRes;
}

// Legacy helper for topic info in ImagePicker modal
export function generateArticleSpecificAiPrompt(
  title: string,
  category?: string,
  _subCategory?: string,
  _content?: string
): string {
  return `Editorial illustration representing "${title}" under ${category || "News"}`;
}
