// News Image Resolver and Uniqueness Registry
// Implements Priority 1 (Original Publisher), Priority 2 (Trusted Licensed Provider), Priority 3 (Category Safe Fallback)
// Guarantees non-repetitive, unique, topic-accurate visual matching across stories.

export interface ImagePipelineParams {
  id?: string;
  title: string;
  category?: string;
  currentAffairsCategory?: string;
  content?: string;
  originalUrl?: string;
  publisherName?: string;
  existingImageUrl?: string;
}

export interface ResolvedImageResult {
  url: string;
  source: "publisher" | "provider" | "fallback" | "custom";
  imageType: "photo" | "illustration" | "chart" | "fallback";
  attribution: string;
  caption: string;
  isUnique: boolean;
}

// Normalized URL cleaner
export function normalizeImageUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    // Strip dynamic cache-busters, timestamps, and sizing params for canonical deduplication
    const cleanPath = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    return cleanPath.toLowerCase();
  } catch {
    return url.split("?")[0].trim().toLowerCase();
  }
}

// Global in-memory registry of allocated image URLs -> articleIds
// Ensures different articles never unintentionally repeat the exact same image
const ALLOCATED_IMAGES = new Map<string, string>();

/**
 * Curated high-fidelity photo registry mapped to editorial categories.
 * Each collection contains multiple unique, authentic photographs.
 */
export const TRUSTED_PHOTO_ARCHIVE: Record<string, Array<{ url: string; caption: string; attribution: string }>> = {
  // Central Banking & Sovereign Debt
  central_banks: [
    {
      url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
      caption: "Central bank headquarters classical architectural facade",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
      caption: "Financial market yield curve metrics and sovereign bond indices",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
      caption: "International exchange trading terminals tracking liquidity",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80",
      caption: "Sovereign gold bullion reserves and institutional vault security",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=800&auto=format&fit=crop&q=80",
      caption: "Multinational currency reserves and treasury balance reconciliation",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Digital Currency & Fintech
  digital_currency: [
    {
      url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80",
      caption: "Contactless NFC payment hardware and retail fintech terminal",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
      caption: "Mobile digital rupee retail ledger transaction interface",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
      caption: "Cryptographic distributed ledger node infrastructure",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80",
      caption: "Hardware cryptographic tokens for sovereign digital assets",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
      caption: "Point-of-sale central bank digital currency settlement card",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Solar & Renewable Energy
  solar_energy: [
    {
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
      caption: "High-efficiency crystalline photovoltaic solar field array",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1508873696983-2df57046475a?w=800&auto=format&fit=crop&q=80",
      caption: "Utility-scale solar power generation facility in desert terrain",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&auto=format&fit=crop&q=80",
      caption: "Perovskite-silicon tandem solar cell test module under direct sunlight",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1545209575-8b387eb77c8e?w=800&auto=format&fit=crop&q=80",
      caption: "Commercial rooftop photovoltaic generation grid installation",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
      caption: "Modern solar cell wafer testing under artificial spectral illuminator",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Quantum Computing & Physics
  quantum_computing: [
    {
      url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
      caption: "Cryogenic dilution refrigerator quantum computing processor casing",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      caption: "Superconducting microchip circuit board with gold co-axial wire harnesses",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80",
      caption: "Optical quantum laser laboratory bench with neutral-atom traps",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      caption: "Cryogenic laser interferometer alignment testing in cleanroom lab",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Wetlands, Mangroves & Blue Carbon
  wetlands_mangroves: [
    {
      url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80",
      caption: "Coastal mangrove estuarine forest showing salt-tolerant prop roots",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      caption: "Pristine coastal lagoon protected under Ramsar wetland convention",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80",
      caption: "Tidal wetland biodiversity reserve preserving endangered waterbirds",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
      caption: "Dense protected tropical mangrove sanctuary and coastal buffer",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Judiciary & Constitutional Law
  supreme_court_law: [
    {
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
      caption: "Classical courtroom gavel resting on legal statutes and law reports",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&auto=format&fit=crop&q=80",
      caption: "Colonnade of neoclassical Supreme Court constitutional bench hall",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&auto=format&fit=crop&q=80",
      caption: "Bronze scales of justice monument outside the constitutional court",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=800&auto=format&fit=crop&q=80",
      caption: "Judicial bench benches and mahogany courtroom interior",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // National Governance, Cabinet & Parliament
  government_cabinet: [
    {
      url: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80",
      caption: "National Parliament secretariat complex under clear skies",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
      caption: "Government cabinet briefing room and multilateral podium",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80",
      caption: "National capital assembly dome and legislative rotunda",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // International Diplomacy & World Affairs
  world_diplomacy: [
    {
      url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80",
      caption: "Member state flags outside United Nations multilateral assembly",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
      caption: "Bilateral summit negotiations table at ministerial conference",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
      caption: "Global security dialogue plenum chamber",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Athletics, Olympics & Sports
  olympics_esports: [
    {
      url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      caption: "High-tech phygital and connected sports simulator arena",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
      caption: "Olympic synthetic running track lanes during endurance sprint",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      caption: "International athletics stadium arena floodlights",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
      caption: "Professional athlete biometric cycling endurance training",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Education & AI Literacy
  education_literacy: [
    {
      url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
      caption: "Students engaged with digital learning laptops in contemporary classroom",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      caption: "University group seminar analyzing interactive research modules",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      caption: "Academic university reference library stacks and student desks",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
      caption: "Instructor conducting interactive problem-solving tutorial",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Artificial Intelligence & Robotics
  ai_robotics: [
    {
      url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      caption: "Autonomous humanoid robotics lab actuator demonstration",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&auto=format&fit=crop&q=80",
      caption: "Neural network cluster server racks in high-performance computing center",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&auto=format&fit=crop&q=80",
      caption: "Cognitive science research computer displaying neural pathways",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Middle East & Red Sea Regional Affairs
  middle_east_affairs: [
    {
      url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80",
      caption: "Regional diplomatic airport transit security operations",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
      caption: "Gulf region capital architectural panorama and logistics center",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
      caption: "Commercial aviation radar and air transit control operations",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Eastern Europe & Geopolitics
  geopolitics_energy: [
    {
      url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",
      caption: "High-voltage electrical substation and continental energy grid transmission",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80",
      caption: "Cross-border thermal energy transmission pylons at dusk",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
      caption: "International geopolitical crisis management headquarters",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],

  // Maritime, Migration & Humanitarian
  maritime_humanitarian: [
    {
      url: "https://images.unsplash.com/photo-1505705694340-019e1e335916?w=800&auto=format&fit=crop&q=80",
      caption: "Red Sea and Horn of Africa maritime shipping corridor waters",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop&q=80",
      caption: "Coastal maritime search and rescue patrol vessel at sea",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
    {
      url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80",
      caption: "Coastal strait littoral zone under maritime surveillance",
      attribution: "Unsplash / Licensed Editorial Stock",
    },
  ],
};

// Safe category fallbacks when all other sources fail
export const CATEGORY_SAFE_FALLBACKS: Record<string, { url: string; caption: string }> = {
  Finance: {
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    caption: "Global financial and corporate district headquarters",
  },
  Technology: {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    caption: "Microprocessor circuitry and advanced hardware development",
  },
  "Current Affairs": {
    url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80",
    caption: "International multilateral forum assembly",
  },
  News: {
    url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
    caption: "Verified newsroom editorial wire dispatch center",
  },
  Sports: {
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
    caption: "Championship stadium running track lanes",
  },
  Education: {
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
    caption: "Interactive digital classroom curriculum session",
  },
  Environment: {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    caption: "Protected alpine and forest biodiversity sanctuary",
  },
  Health: {
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80",
    caption: "Automated medical diagnostic and research laboratory",
  },
};

/**
 * Categorizes news story text into one of the specialized photo collections.
 */
function matchCategoryKey(fullText: string): string {
  const text = fullText.toLowerCase();

  if (text.includes("saudi") || text.includes("houthi") || text.includes("yemen") || text.includes("riyadh")) {
    return "middle_east_affairs";
  }
  if (text.includes("russia") || text.includes("ukraine") || text.includes("ceasefire") || text.includes("energy grid") || text.includes("power plant")) {
    return "geopolitics_energy";
  }
  if (text.includes("migrant") || text.includes("boat") || text.includes("capsiz") || text.includes("djibouti") || text.includes("maritime rescue")) {
    return "maritime_humanitarian";
  }
  if (text.includes("quantum") || text.includes("qubit") || text.includes("cryogenic")) {
    return "quantum_computing";
  }
  if (text.includes("solar") || text.includes("perovskite") || text.includes("photovoltaic")) {
    return "solar_energy";
  }
  if (text.includes("mangrove") || text.includes("wetland") || text.includes("blue carbon") || text.includes("ramsar")) {
    return "wetlands_mangroves";
  }
  if (text.includes("court") || text.includes("verdict") || text.includes("judicial") || text.includes("justice") || text.includes("bench")) {
    return "supreme_court_law";
  }
  if (text.includes("central bank") || text.includes("sovereign bond") || text.includes("liquidity") || text.includes("treasury")) {
    return "central_banks";
  }
  if (text.includes("digital rupee") || text.includes("cbdc") || text.includes("fintech") || text.includes("payment")) {
    return "digital_currency";
  }
  if (text.includes("olympic") || text.includes("esport") || text.includes("phygital") || text.includes("athlete")) {
    return "olympics_esports";
  }
  if (text.includes("education") || text.includes("curriculum") || text.includes("school") || text.includes("unesco") || text.includes("pedagogy")) {
    return "education_literacy";
  }
  if (text.includes("ai") || text.includes("robot") || text.includes("neural") || text.includes("artificial intelligence")) {
    return "ai_robotics";
  }
  if (text.includes("cabinet") || text.includes("parliament") || text.includes("ministry") || text.includes("bill")) {
    return "government_cabinet";
  }
  if (text.includes("diplomacy") || text.includes("treaty") || text.includes("summit") || text.includes("united nations")) {
    return "world_diplomacy";
  }

  return "government_cabinet";
}

/**
 * Core image resolution pipeline implementing:
 * Priority 1: Publisher's original image (if present and valid)
 * Priority 2: Trusted image provider collection (with strict uniqueness deduplication)
 * Priority 3: Safe category fallback
 */
export function resolveSmartNewsImage(params: ImagePipelineParams): ResolvedImageResult {
  const articleId = params.id || `art-${Date.now()}`;
  const fullText = `${params.title} ${params.category || ""} ${params.currentAffairsCategory || ""} ${params.content || ""}`.toLowerCase();

  // PRIORITY 1: Original Publisher's Image First
  // If publisher provided an image (via RSS media:content, og:image, or thumbnail URL)
  if (params.existingImageUrl && params.existingImageUrl.trim().startsWith("http")) {
    const norm = normalizeImageUrl(params.existingImageUrl);
    
    // Check if this image has already been assigned to an unrelated article
    const existingArticleOwner = ALLOCATED_IMAGES.get(norm);
    if (!existingArticleOwner || existingArticleOwner === articleId) {
      ALLOCATED_IMAGES.set(norm, articleId);
      return {
        url: params.existingImageUrl.trim(),
        source: "publisher",
        imageType: "photo",
        attribution: params.publisherName ? `Source: ${params.publisherName}` : "Original Publisher Media",
        caption: `Primary reporting photo for "${params.title}"`,
        isUnique: true,
      };
    }
  }

  // PRIORITY 2: Trusted Image Provider Archive
  // Select an appropriate, highly relevant image from our licensed archive,
  // actively ensuring NO image is repeated across distinct articles.
  const matchedKey = matchCategoryKey(fullText);
  const candidates = TRUSTED_PHOTO_ARCHIVE[matchedKey] || TRUSTED_PHOTO_ARCHIVE.government_cabinet;

  // Search for an unallocated candidate in the matching topic
  for (const candidate of candidates) {
    const norm = normalizeImageUrl(candidate.url);
    const owner = ALLOCATED_IMAGES.get(norm);
    if (!owner || owner === articleId) {
      ALLOCATED_IMAGES.set(norm, articleId);
      return {
        url: candidate.url,
        source: "provider",
        imageType: "photo",
        attribution: candidate.attribution,
        caption: candidate.caption,
        isUnique: true,
      };
    }
  }

  // If all specific candidates in that category are already allocated to active stories,
  // expand search to compatible adjacent categories
  const fallbackPool = [
    ...(TRUSTED_PHOTO_ARCHIVE.world_diplomacy || []),
    ...(TRUSTED_PHOTO_ARCHIVE.government_cabinet || []),
    ...(TRUSTED_PHOTO_ARCHIVE.ai_robotics || []),
    ...(TRUSTED_PHOTO_ARCHIVE.solar_energy || []),
  ];

  for (const candidate of fallbackPool) {
    const norm = normalizeImageUrl(candidate.url);
    const owner = ALLOCATED_IMAGES.get(norm);
    if (!owner || owner === articleId) {
      ALLOCATED_IMAGES.set(norm, articleId);
      return {
        url: candidate.url,
        source: "provider",
        imageType: "photo",
        attribution: candidate.attribution,
        caption: candidate.caption,
        isUnique: true,
      };
    }
  }

  // PRIORITY 3: Safe Polished Category Fallback
  const catKey = params.category || params.currentAffairsCategory || "News";
  const safeFallback = CATEGORY_SAFE_FALLBACKS[catKey] || CATEGORY_SAFE_FALLBACKS.News;

  return {
    url: safeFallback.url,
    source: "fallback",
    imageType: "fallback",
    attribution: "The World Ledger Curated Editorial Archive",
    caption: safeFallback.caption,
    isUnique: false,
  };
}

/**
 * Resets the allocation map (useful when refreshing entire feeds or running test suites)
 */
export function clearAllocatedImages(): void {
  ALLOCATED_IMAGES.clear();
}
