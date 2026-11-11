function cleanHtml(str) {
  if (!str) return "";
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssFeed(xml, defaultSource, defaultCat, defaultSubCat) {
  const items = [];
  const itemMatches = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
  
  for (const block of itemMatches) {
    const rawTitle = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
    const rawLink = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] 
      || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
    const rawPubDate = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] 
      || block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] || "";
    const rawDesc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] 
      || block.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1] 
      || block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || "";

    // Skip affiliate coupons or promo code spam
    if (rawTitle.toLowerCase().includes("coupon") || rawTitle.toLowerCase().includes("promo code")) continue;

    // Image priority: media:content -> enclosure -> media:thumbnail -> img in desc
    const rawMedia = 
      block.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1] ||
      block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1] ||
      rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
      undefined;

    let mediaUrl = rawMedia && rawMedia.startsWith("http") ? rawMedia.trim() : undefined;
    if (mediaUrl && mediaUrl.includes("ichef.bbci.co.uk")) {
      mediaUrl = mediaUrl.replace(/\/standard\/(?:240|320|480)\//, "/standard/1024/");
    }

    const title = cleanHtml(rawTitle);
    const link = cleanHtml(rawLink);
    const description = cleanHtml(rawDesc);

    if (title && title.length > 12 && link) {
      items.push({
        title,
        link,
        pubDate: rawPubDate && !isNaN(Date.parse(rawPubDate)) ? new Date(rawPubDate).toISOString() : new Date().toISOString(),
        description: description.slice(0, 350),
        mediaUrl
      });
    }
  }
  return items;
}

async function run() {
  const feeds = [
    { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", cat: "News", sub: "International News" },
    { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss", cat: "Current Affairs", sub: "National News" },
    { name: "The Guardian Sport", url: "https://www.theguardian.com/sport/rss", cat: "Sports", sub: "Sports" },
    { name: "Vox", url: "https://www.vox.com/rss/index.xml", cat: "Current Affairs", sub: "National News" }
  ];

  for (const f of feeds) {
    const res = await fetch(f.url, { headers: { "User-Agent": "SummaryHub/2.0" } });
    const xml = await res.text();
    const parsed = parseRssFeed(xml, f.name, f.cat, f.sub);
    const withImg = parsed.filter(p => Boolean(p.mediaUrl)).length;
    console.log(`[${f.name}] Parsed: ${parsed.length} total, ${withImg} with publisher image. First image: ${parsed[0]?.mediaUrl?.slice(0, 60)}`);
  }
}
run();
