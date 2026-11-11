import { jsPDF } from "jspdf";
import { SummaryItem } from "../types";

export interface ExportOptions {
  includeDetailedAnalysis?: boolean;
  includeKeyFacts?: boolean;
  includeTableOfContents?: boolean;
  includeSourceUrls?: boolean;
  includeVerificationData?: boolean;
  format?: "txt" | "md" | "json" | "pdf";
}

/**
 * Formats a clean, high-legibility plain text summary file for offline reading.
 * Engineered for any screen, e-reader, notepad, terminal, or printing.
 */
export function generatePlainTextSummary(
  summaries: SummaryItem[],
  options: ExportOptions = {}
): string {
  const {
    includeDetailedAnalysis = true,
    includeKeyFacts = true,
    includeTableOfContents = true,
    includeSourceUrls = true,
    includeVerificationData = true,
  } = options;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalMinutes = summaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0);
  const totalWordsEstimate = summaries.reduce((acc, curr) => {
    const quickWords = curr.quickSummary.join(" ").split(/\s+/).length;
    const detailWords = curr.detailedSummary ? curr.detailedSummary.split(/\s+/).length : 0;
    return acc + quickWords + detailWords;
  }, 0);

  const divider = "================================================================================";
  const subDivider = "--------------------------------------------------------------------------------";
  const thinDivider = "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ";

  let output = "";

  // Title Banner
  output += `${divider}\n`;
  output += `                     THE WORLD LEDGER — OFFLINE READING DISPATCH\n`;
  output += `                     Saved Articles & Curated Global Knowledge\n`;
  output += `${divider}\n\n`;

  // Metadata block
  output += `Generated Date:       ${dateFormatted} at ${timeFormatted}\n`;
  output += `Total Saved Articles: ${summaries.length} articles\n`;
  output += `Total Reading Time:   ~${totalMinutes} minutes\n`;
  output += `Estimated Word Count: ~${totalWordsEstimate.toLocaleString()} words\n`;
  output += `Offline Status:       100% Self-Contained (No Internet Connection Required)\n\n`;

  // Table of Contents
  if (includeTableOfContents && summaries.length > 0) {
    output += `${subDivider}\n`;
    output += `TABLE OF CONTENTS\n`;
    output += `${subDivider}\n`;
    summaries.forEach((item, idx) => {
      const num = (idx + 1).toString().padStart(2, " ");
      const categoryTag = item.category ? `[${item.category}]` : "";
      output += `${num}. ${item.title} — ${item.creatorName} ${categoryTag} (~${item.readingTimeMinutes}m)\n`;
    });
    output += `\n`;
  }

  // Articles Section
  output += `${divider}\n`;
  output += `ARTICLES & EXECUTIVE SUMMARIES\n`;
  output += `${divider}\n\n`;

  summaries.forEach((item, idx) => {
    const itemNum = idx + 1;
    output += `${subDivider}\n`;
    output += `ARTICLE #${itemNum} OF ${summaries.length}: ${item.title.toUpperCase()}\n`;
    output += `${subDivider}\n`;

    output += `Creator:      ${item.creatorName} (${item.creatorHandle})\n`;
    output += `Platform:     ${item.platform.toUpperCase()}\n`;
    output += `Category:     ${item.category}${item.currentAffairsCategory ? ` > ${item.currentAffairsCategory}` : ""}\n`;
    output += `Reading Time: ~${item.readingTimeMinutes} minutes\n`;
    output += `Published:    ${item.publishDate}\n`;
    if (includeSourceUrls && item.originalUrl) {
      output += `Original URL: ${item.originalUrl}\n`;
    }

    if (includeVerificationData && item.verification?.isVerified) {
      output += `Verification: [VERIFIED: ${item.verification.verificationScore}% Score] Authority: ${item.verification.verifiedSources.join(", ")}\n`;
    }
    output += `\n`;

    // 1. Quick Takeaways
    output += `[ KEY TAKEAWAYS ]\n`;
    if (item.quickSummary && item.quickSummary.length > 0) {
      item.quickSummary.forEach((point) => {
        output += `  * ${point.trim()}\n`;
      });
    } else {
      output += `  * No bullet points provided.\n`;
    }
    output += `\n`;

    // 2. Easy Summary (if exists)
    if (item.easySummary && item.easySummary.trim()) {
      output += `[ CONCISE EXPLANATION ]\n`;
      output += `  ${item.easySummary.trim()}\n\n`;
    }

    // 3. Detailed Analysis
    if (includeDetailedAnalysis && item.detailedSummary && item.detailedSummary.trim()) {
      output += `[ IN-DEPTH BREAKDOWN ]\n`;
      const paragraphs = item.detailedSummary.split(/\n+/);
      paragraphs.forEach((p) => {
        if (p.trim()) {
          output += `  ${p.trim()}\n\n`;
        }
      });
    }

    // 4. Key Facts & Data
    if (includeKeyFacts && item.keyFacts) {
      const { names, dates, statistics, decisions, announcements } = item.keyFacts;
      const hasFacts =
        (names && names.length > 0) ||
        (dates && dates.length > 0) ||
        (statistics && statistics.length > 0) ||
        (decisions && decisions.length > 0) ||
        (announcements && announcements.length > 0);

      if (hasFacts) {
        output += `[ KEY FACTS & CRITICAL ENTITIES ]\n`;
        if (names && names.length > 0) {
          output += `  • People & Entities:  ${names.join(", ")}\n`;
        }
        if (dates && dates.length > 0) {
          output += `  • Dates & Timeline:   ${dates.join(", ")}\n`;
        }
        if (statistics && statistics.length > 0) {
          output += `  • Key Metrics & Stats: ${statistics.join("; ")}\n`;
        }
        if (decisions && decisions.length > 0) {
          output += `  • Decisions & Actions: ${decisions.join("; ")}\n`;
        }
        if (announcements && announcements.length > 0) {
          output += `  • Official Statements: ${announcements.join("; ")}\n`;
        }
        output += `\n`;
      }
    }

    // 5. Exam Relevance / Study Note
    if (item.examRelevance && item.examRelevance.trim()) {
      output += `[ REVISION & STUDY HIGHLIGHT ]\n`;
      output += `  ${item.examRelevance.trim()}\n\n`;
    }

    output += `${thinDivider}\n\n`;
  });

  // Footer
  output += `${divider}\n`;
  output += `End of The World Ledger Offline Digest\n`;
  output += `Exported for personal, offline educational revision & research.\n`;
  output += `${divider}\n`;

  return output;
}

/**
 * Formats a clean Markdown document (.md) for tools like Obsidian, Notion, Logseq, Bear.
 */
export function generateMarkdownSummary(
  summaries: SummaryItem[],
  options: ExportOptions = {}
): string {
  const {
    includeDetailedAnalysis = true,
    includeKeyFacts = true,
    includeTableOfContents = true,
    includeSourceUrls = true,
    includeVerificationData = true,
  } = options;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalMinutes = summaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0);

  let md = `# The World Ledger — Saved Dispatches Offline Digest\n\n`;
  md += `> **Export Date:** ${dateFormatted}  \n`;
  md += `> **Total Saved Articles:** ${summaries.length}  \n`;
  md += `> **Estimated Reading Time:** ~${totalMinutes} minutes  \n`;
  md += `> **Environment:** Offline Reading Archive  \n\n`;

  if (includeTableOfContents && summaries.length > 0) {
    md += `## Table of Contents\n\n`;
    summaries.forEach((item, idx) => {
      const anchor = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      md += `${idx + 1}. [${item.title}](#${anchor}) — *${item.creatorName}* (\`${item.category}\` • ${item.readingTimeMinutes} min)\n`;
    });
    md += `\n---\n\n`;
  }

  summaries.forEach((item, idx) => {
    md += `## ${idx + 1}. ${item.title}\n\n`;

    md += `- **Creator:** ${item.creatorName} (\`${item.creatorHandle}\`)\n`;
    md += `- **Platform:** ${item.platform.toUpperCase()}\n`;
    md += `- **Category:** ${item.category}${item.currentAffairsCategory ? ` / ${item.currentAffairsCategory}` : ""}\n`;
    md += `- **Read Time:** ~${item.readingTimeMinutes} minutes\n`;
    md += `- **Published:** ${item.publishDate}\n`;
    if (includeSourceUrls && item.originalUrl) {
      md += `- **Original Source:** [Open Link](${item.originalUrl})\n`;
    }

    if (includeVerificationData && item.verification?.isVerified) {
      md += `- **Verification:** :white_check_mark: **Verified (${item.verification.verificationScore}%)** via *${item.verification.verifiedSources.join(", ")}*\n`;
    }

    md += `\n### Key Takeaways\n\n`;
    if (item.quickSummary && item.quickSummary.length > 0) {
      item.quickSummary.forEach((point) => {
        md += `- ${point}\n`;
      });
    }
    md += `\n`;

    if (item.easySummary) {
      md += `### Concise Summary\n\n${item.easySummary}\n\n`;
    }

    if (includeDetailedAnalysis && item.detailedSummary) {
      md += `### Detailed In-Depth Breakdown\n\n${item.detailedSummary}\n\n`;
    }

    if (includeKeyFacts && item.keyFacts) {
      const { names, dates, statistics, decisions, announcements } = item.keyFacts;
      md += `### Key Facts & Entities\n\n`;
      if (names && names.length > 0) md += `- **People & Organizations:** ${names.join(", ")}\n`;
      if (dates && dates.length > 0) md += `- **Dates & Deadlines:** ${dates.join(", ")}\n`;
      if (statistics && statistics.length > 0) md += `- **Statistics & Metrics:** ${statistics.join("; ")}\n`;
      if (decisions && decisions.length > 0) md += `- **Key Decisions:** ${decisions.join("; ")}\n`;
      if (announcements && announcements.length > 0) md += `- **Announcements:** ${announcements.join("; ")}\n`;
      md += `\n`;
    }

    if (item.examRelevance) {
      md += `> **Revision / Study Note:**  \n> ${item.examRelevance}\n\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Formats a clean JSON archive for full offline portability and backup.
 */
export function generateJsonSummary(summaries: SummaryItem[]): string {
  const archive = {
    exportedAt: new Date().toISOString(),
    generator: "The World Ledger Offline Exporter",
    articleCount: summaries.length,
    articles: summaries,
  };
  return JSON.stringify(archive, null, 2);
}

/**
 * Triggers a browser download of the generated text content.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Sanitizes strings for standard Latin-1 Helvetica font in jsPDF,
 * replacing emojis, smart punctuation, and unsupported glyphs.
 */
function sanitizePdfText(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .replace(/[\u2022\u25CF\u25AA]/g, "*")
    .replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 160 && code <= 255) return char;
      return "";
    });
}

/**
 * Generates a formatted PDF document using jsPDF for offline reading and archiving.
 * Includes executive cover metadata, table of contents, structured article breakdowns,
 * key facts & entities, exam notes, and running headers & footers.
 */
export function generatePdfSummary(
  summaries: SummaryItem[],
  options: ExportOptions = {}
): jsPDF {
  const {
    includeDetailedAnalysis = true,
    includeKeyFacts = true,
    includeTableOfContents = true,
    includeSourceUrls = true,
    includeVerificationData = true,
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 16;
  const rightMargin = 16;
  const topMargin = 22;
  const bottomMargin = 22;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 178mm

  let currentY = topMargin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = topMargin;
      return true;
    }
    return false;
  };

  const printWrapped = (
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    color: [number, number, number] = [30, 41, 59],
    lineHeight?: number
  ) => {
    const cleanText = sanitizePdfText(text);
    if (!cleanText.trim()) return;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lh = lineHeight || Math.max(3.8, fontSize * 0.45);
    const lines = doc.splitTextToSize(cleanText, maxWidth);
    for (const line of lines) {
      checkPageBreak(lh);
      doc.text(line, x, currentY);
      currentY += lh;
    }
  };

  // 1. Cover / Top Header Banner (Page 1)
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(leftMargin, currentY, contentWidth, 3, "F");
  currentY += 8;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 27, 75); // Deep Indigo
  doc.text("The World Ledger — International News & Intelligence Digest", leftMargin, currentY);
  currentY += 6;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Curated Executive Summaries & Research Archive", leftMargin, currentY);
  currentY += 8;

  // Metadata Card
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalMinutes = summaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0);

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, currentY, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const colWidth = contentWidth / 3;
  // Col 1
  doc.text("DATE EXPORTED", leftMargin + 4, currentY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizePdfText(dateFormatted), leftMargin + 4, currentY + 11.5);

  // Col 2
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("ARTICLES SELECTED", leftMargin + colWidth + 4, currentY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${summaries.length} Articles (~${totalMinutes}m read)`, leftMargin + colWidth + 4, currentY + 11.5);

  // Col 3
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("FORMAT & PORTABILITY", leftMargin + colWidth * 2 + 4, currentY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Self-Contained Offline PDF", leftMargin + colWidth * 2 + 4, currentY + 11.5);

  currentY += 24;

  // 2. Table of Contents (if enabled & >= 2 articles)
  if (includeTableOfContents && summaries.length > 1) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text("TABLE OF CONTENTS", leftMargin, currentY);
    currentY += 2;
    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(0.4);
    doc.line(leftMargin, currentY, leftMargin + contentWidth, currentY);
    currentY += 5;

    summaries.forEach((item, idx) => {
      checkPageBreak(6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const numStr = `${idx + 1}.`;
      doc.text(numStr, leftMargin + 2, currentY);

      doc.setFont("helvetica", "normal");
      const titleClean = sanitizePdfText(item.title);
      const metaClean = `— ${sanitizePdfText(item.creatorName)} [${sanitizePdfText(item.category)}] (${item.readingTimeMinutes}m)`;
      const lineStr = `${titleClean} ${metaClean}`;
      const splitTOC = doc.splitTextToSize(lineStr, contentWidth - 14);
      doc.text(splitTOC[0], leftMargin + 8, currentY);
      currentY += 5;
    });

    currentY += 5;
  }

  // 3. Articles Section
  summaries.forEach((item, idx) => {
    // If not first item and current position is low, start new page for clean presentation
    if (idx > 0 && currentY > pageHeight - bottomMargin - 55) {
      doc.addPage();
      currentY = topMargin;
    } else if (idx > 0) {
      // Horizontal separator
      currentY += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(leftMargin, currentY, leftMargin + contentWidth, currentY);
      currentY += 6;
    }

    // Article Header Block
    checkPageBreak(25);
    
    // Category & Platform Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229); // Indigo 600
    const catPlatform = `ARTICLE ${idx + 1} OF ${summaries.length}  |  ${item.category.toUpperCase()}${item.currentAffairsCategory ? ` > ${item.currentAffairsCategory.toUpperCase()}` : ""}  |  ${item.platform.toUpperCase()}  |  ~${item.readingTimeMinutes} MIN READ`;
    doc.text(sanitizePdfText(catPlatform), leftMargin, currentY);
    currentY += 4.5;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(15, 23, 42); // Slate 900
    const titleLines = doc.splitTextToSize(sanitizePdfText(item.title), contentWidth);
    for (const line of titleLines) {
      checkPageBreak(6);
      doc.text(line, leftMargin, currentY);
      currentY += 5.2;
    }

    // Creator & Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const creatorLine = `By ${sanitizePdfText(item.creatorName)} (${sanitizePdfText(item.creatorHandle)})  •  Published: ${sanitizePdfText(item.publishDate)}`;
    doc.text(creatorLine, leftMargin, currentY);
    currentY += 4;

    // Fact Verification
    if (includeVerificationData && item.verification?.isVerified) {
      checkPageBreak(5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129); // Emerald 600
      const verText = `[FACT-CHECK VERIFIED: ${item.verification.verificationScore}% SCORE] Sources: ${sanitizePdfText(item.verification.verifiedSources.join(", "))}`;
      doc.text(verText, leftMargin, currentY);
      currentY += 4;
    }

    // Source URL
    if (includeSourceUrls && item.originalUrl) {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(59, 130, 246); // Blue 500
      const urlText = `Original Source: ${sanitizePdfText(item.originalUrl)}`;
      doc.text(doc.splitTextToSize(urlText, contentWidth)[0], leftMargin, currentY);
      currentY += 4;
    }

    currentY += 2;

    // Key Takeaways
    if (item.quickSummary && item.quickSummary.length > 0) {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text("KEY TAKEAWAYS", leftMargin, currentY);
      currentY += 4;

      item.quickSummary.forEach((point) => {
        checkPageBreak(6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(79, 70, 229);
        doc.text("-", leftMargin + 2, currentY);

        printWrapped(point, leftMargin + 6, contentWidth - 6, 8.5, "normal", [30, 41, 59], 4.2);
        currentY += 0.5;
      });
      currentY += 2;
    }

    // Concise Summary
    if (item.easySummary) {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("EXECUTIVE SUMMARY", leftMargin, currentY);
      currentY += 4;

      // Tinted block quote border
      const startQuoteY = currentY - 1;
      printWrapped(item.easySummary, leftMargin + 4, contentWidth - 6, 8.5, "normal", [51, 65, 85], 4.2);
      doc.setDrawColor(199, 210, 254);
      doc.setLineWidth(0.8);
      doc.line(leftMargin + 1, startQuoteY, leftMargin + 1, currentY);
      currentY += 3;
    }

    // Detailed Breakdown
    if (includeDetailedAnalysis && item.detailedSummary) {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("DETAILED IN-DEPTH ANALYSIS", leftMargin, currentY);
      currentY += 4;

      printWrapped(item.detailedSummary, leftMargin, contentWidth, 8.5, "normal", [51, 65, 85], 4.2);
      currentY += 2;
    }

    // Key Facts & Entities
    if (includeKeyFacts && item.keyFacts) {
      const { names, dates, statistics, decisions, announcements } = item.keyFacts;
      const hasFacts = (names?.length || 0) + (dates?.length || 0) + (statistics?.length || 0) + (decisions?.length || 0) + (announcements?.length || 0) > 0;
      
      if (hasFacts) {
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text("KEY FACTS & VERIFIED METRICS", leftMargin, currentY);
        currentY += 4;

        if (names && names.length > 0) {
          printWrapped(`* Key Entities & Figures: ${names.join(", ")}`, leftMargin + 2, contentWidth - 4, 8, "normal", [71, 85, 105], 4);
        }
        if (dates && dates.length > 0) {
          printWrapped(`* Critical Dates: ${dates.join(", ")}`, leftMargin + 2, contentWidth - 4, 8, "normal", [71, 85, 105], 4);
        }
        if (statistics && statistics.length > 0) {
          printWrapped(`* Statistics & Data: ${statistics.join("; ")}`, leftMargin + 2, contentWidth - 4, 8, "normal", [71, 85, 105], 4);
        }
        if (decisions && decisions.length > 0) {
          printWrapped(`* Key Decisions: ${decisions.join("; ")}`, leftMargin + 2, contentWidth - 4, 8, "normal", [71, 85, 105], 4);
        }
        if (announcements && announcements.length > 0) {
          printWrapped(`* Announcements: ${announcements.join("; ")}`, leftMargin + 2, contentWidth - 4, 8, "normal", [71, 85, 105], 4);
        }
        currentY += 2;
      }
    }

    // Exam / Revision Notes
    if (item.examRelevance) {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9); // Amber 700
      doc.text("STUDY & REVISION TAKEAWAY", leftMargin, currentY);
      currentY += 3.5;
      printWrapped(item.examRelevance, leftMargin, contentWidth, 8, "italic", [120, 53, 15], 4);
      currentY += 2;
    }
  });

  // 4. Running Headers & Footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Header on page 2+
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text("The World Ledger — Curated International Digest", leftMargin, 12);
      doc.text("Offline Reading Archive", pageWidth - rightMargin, 12, { align: "right" });
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 14, pageWidth - rightMargin, 14);
    }

    // Footer on all pages
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, pageHeight - 14, pageWidth - rightMargin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("The World Ledger • International Intelligence Archive", leftMargin, pageHeight - 9);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 9, { align: "right" });
  }

  return doc;
}

/**
 * Triggers a download of the formatted PDF summary document.
 */
export function downloadPdf(
  summaries: SummaryItem[],
  filename: string,
  options: ExportOptions = {}
): void {
  const doc = generatePdfSummary(summaries, options);
  doc.save(filename);
}

