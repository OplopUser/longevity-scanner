// Longevity Weekly Report — Simple linear flow, no manual page tracking
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "reports");
const M = 42, PW = 595 - M * 2;

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 45, bottom: 45, left: M, right: M } });
  const filepath = path.join(REPORT_DIR, `longevity-weekly-${weekEnd}.pdf`);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Track pages simply
  let page = 1;
  doc.on("pageAdded", () => page++);

  // Footer helper: draws at absolute position, does NOT affect doc.y
  function footer() {
    const y = doc.page.height - 36;
    doc.fillColor("#94a3b8").fontSize(7).font("Helvetica");
    doc.text(`Longevity Intelligence  ·  Weekly Report  ·  p.${page}  ·  Not medical advice`, M, y, {
      width: PW, align: "center",
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════════════════════════
  doc.rect(0, 0, doc.page.width, 180).fill("#152238");
  doc.rect(0, 176, doc.page.width, 4).fill("#b8942e");

  doc.fillColor("#b8942e").fontSize(9).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", M, 30, { characterSpacing: 2 });

  doc.fillColor("#ffffff").fontSize(30).font("Helvetica-Bold");
  doc.text("The Longevity Brief", M, 50);

  doc.fillColor("#94a3b8").fontSize(11).font("Helvetica");
  doc.text(`Week of ${weekStart} — ${weekEnd}`, M, 88);

  const now = new Date();
  doc.fillColor("#e8d5a3").fontSize(9).font("Helvetica");
  doc.text(`${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  ·  ${articles.length} stories`, M, 110);

  const hN = articles.filter((a) => a.significance === "high").length;
  const mN = articles.filter((a) => a.significance === "medium").length;
  const loN = articles.length - hN - mN;
  const rN = articles.filter((a) => a.category === "research" || a.category === "epigenetic").length;
  const cN = articles.filter((a) => a.category === "clinical_trial").length;
  const bN = articles.filter((a) => a.category === "biotech").length;

  // Simple stat line
  doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold");
  doc.text(`${hN} high  ·  ${mN} medium  ·  ${loN} low`, M, 138);
  doc.fillColor("#94a3b8").fontSize(9).font("Helvetica");
  doc.text(`${rN} research  ·  ${cN} clinical  ·  ${bN} biotech`, M, 158);

  // Footer on cover
  footer();

  // ═══════════════════════════════════════════════════════════
  // PAGE 2+: CONTENT (single linear flow, no manual page breaks)
  // ═══════════════════════════════════════════════════════════
  doc.addPage();

  // Section header helper — draws header with underline
  function section(title, color) {
    doc.fillColor(color).fontSize(14).font("Helvetica-Bold");
    doc.text(title, { lineGap: 0 });
    const ruleY = doc.y + 2;
    doc.moveTo(M, ruleY).lineTo(M + doc.widthOfString(title) + 40, ruleY).lineWidth(2).strokeColor(color).stroke();
    doc.moveDown(0.5);
  }

  // ═══ EXECUTIVE SUMMARY ═══
  section("Executive Summary", "#b8942e");
  doc.fillColor("#3a4555").fontSize(9).font("Helvetica");
  doc.text(
    `This week brought ${articles.length} developments in longevity science, led by a landmark Nature paper from the Gladyshev lab providing systems-level evidence for the Information Theory of Aging — analyzing ~11,000 cellular profiles to confirm aging involves coordinated, partially reversible epigenetic changes. ` +
    `On the clinical front: nasal EV therapy reversed brain aging markers in mice (Texas A&M), the protective APOE2 variant was linked to superior neuronal DNA repair, and Retro Biosciences ($1.8B valuation) progressed toward Phase 1 Alzheimer's data expected August 2026. ` +
    `In industry, Daewoong Pharma acquired Turn Bio's epigenetic reprogramming platform, signaling major pharma conviction. ` +
    `On the practical side, the COSMOS RCT in Nature Medicine showed daily multivitamins modestly slow epigenetic aging (~4 months over 2 years), and AKG supplementation correlated with younger biological age scores.`,
    { width: PW, lineGap: 3 }
  );
  doc.moveDown(0.8);

  // ═══ ARTICLES ═══
  section("This Week's Developments", "#2563a0");

  const sorted = [...articles].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return o[a.significance] - o[b.significance];
  });

  const catColors = {
    research: "#2d7d5f", clinical_trial: "#2563a0", supplement: "#b8942e",
    biotech: "#6b3fa0", longevity_industry: "#2563a0", epigenetic: "#c2672a",
    senescence: "#b5343a", other: "#6b7b8d",
  };
  const sigChars = { high: "★", medium: "◆", low: "·" };
  const sigCols = { high: "#b8942e", medium: "#2d7d5f", low: "#94a3b8" };

  sorted.forEach((article, i) => {
    const cc = catColors[article.category] || "#6b7b8d";

    // Header line: [sig] CATEGORY · date · source
    doc.fillColor(sigCols[article.significance]).fontSize(9).font("Helvetica");
    doc.text(sigChars[article.significance], M, doc.y, { continued: true, width: 14 });
    doc.fillColor(cc).fontSize(7).font("Helvetica-Bold");
    doc.text(` ${article.category.replace("_", " ").toUpperCase()}  `, M + 12, doc.y, { continued: true, width: 56 });
    doc.fillColor("#94a3b8").fontSize(7).font("Helvetica");
    doc.text(` ${article.date}  ·  ${article.source}`, M + 68, doc.y, { width: PW - 70 });
    doc.moveDown(0.1);

    // Title
    doc.fillColor("#1e2b3c").fontSize(9.5).font("Helvetica-Bold");
    doc.text(article.title, M + 14, doc.y, { width: PW - 20, lineGap: 1.5 });
    doc.moveDown(0.1);

    // Summary
    doc.fillColor("#3a4555").fontSize(8).font("Helvetica");
    doc.text(article.summary, M + 14, doc.y, { width: PW - 22, lineGap: 1.5 });

    // Separator
    doc.moveDown(0.3);
    doc.moveTo(M + 7, doc.y).lineTo(M + PW - 7, doc.y).lineWidth(0.3).strokeColor("#e8ecf0").stroke();
    doc.moveDown(0.3);
  });

  // ═══ TAKEAWAYS ═══
  doc.moveDown(0.3);
  section("What This Means For You", "#b8942e");

  const takeaways = [
    "Prioritise sleep recovery — catch-up sleep after short nights is associated with reduced all-cause mortality risk. If you've had a poor night, focus on recovery the next.",
    "Consider a daily multivitamin — the COSMOS RCT (Nature Medicine, 2026) found daily multivitamin use slowed epigenetic aging by ~4 months over 2 years, especially in those with accelerated baseline aging.",
    "Pair exercise with AKG — alpha-ketoglutarate showed notable biological age reduction effects, particularly when combined with regular exercise in older adults.",
    "NAD+ precursors (NMN/NR) continue to show preclinical promise for mitochondrial function and DNA repair. Long-term human data remains limited — consult a doctor before supplementing.",
    "Protect neuronal DNA repair — the APOE2 variant demonstrates that DNA repair capacity is central to cognitive aging. Exercise, quality sleep, and polyphenol-rich foods support natural repair pathways.",
  ];

  takeaways.forEach((t, i) => {
    doc.fillColor("#b8942e").fontSize(10).font("Helvetica-Bold");
    doc.text(`${i + 1}.`, M, doc.y, { continued: true, width: 16 });
    doc.fillColor("#3a4555").fontSize(8).font("Helvetica");
    doc.text(` ${t}`, M + 16, doc.y, { width: PW - 22, lineGap: 2 });
    doc.moveDown(0.2);
  });

  // ═══ SOURCES ═══
  doc.moveDown(0.5);
  doc.moveTo(M, doc.y).lineTo(M + PW, doc.y).lineWidth(0.5).strokeColor("#e8ecf0").stroke();
  doc.moveDown(0.3);
  doc.fillColor("#6b7b8d").fontSize(7).font("Helvetica");
  doc.text("Sources: Reddit r/longevity, arXiv, X/Twitter longevity research community. Articles curated for significance and categorised by domain. This report is for informational purposes only and does not constitute medical advice.", { width: PW, lineGap: 2 });

  // Final footer
  footer();
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
