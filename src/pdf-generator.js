// Longevity Weekly Report — Minimal, natural flow, no manual page tracking
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "reports");
const M = 42, PW = 595 - M * 2; // A4 = 595 wide

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 45, bottom: 40, left: M, right: M } });
  const filepath = path.join(REPORT_DIR, `longevity-weekly-${weekEnd}.pdf`);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Page number tracker
  let pageNum = 1;
  doc.on("pageAdded", () => { pageNum++; });

  // Draw page number at bottom (absolute position, does NOT advance doc.y)
  function pageFooter() {
    const fY = doc.page.height - 32;
    doc.fillColor("#94a3b8").fontSize(6.5).font("Helvetica");
    doc.text(`Longevity Intelligence · Weekly Report · p.${pageNum}`, M, fY, { width: PW, align: "center" });
  }

  // Safe addPage — draw footer on current page first, then start new page
  function newPage() {
    pageFooter();
    doc.addPage();
  }

  // ═══ COVER ═══
  doc.rect(0, 0, doc.page.width, 145).fill("#152238");
  doc.rect(0, 141, doc.page.width, 4).fill("#b8942e");
  doc.fillColor("#b8942e").fontSize(8).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", M, 26, { characterSpacing: 2 });
  doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold");
  doc.text("The Longevity Brief", M, 42);
  doc.fillColor("#94a3b8").fontSize(10).font("Helvetica");
  doc.text(`Week of ${weekStart} — ${weekEnd}`, M, 74);
  doc.fillColor("#e8d5a3").fontSize(8).font("Helvetica");
  doc.text(`${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  ·  ${articles.length} stories`, M, 92);

  const hN = articles.filter(a => a.significance === "high").length;
  const mN = articles.filter(a => a.significance === "medium").length;
  doc.fillColor("#ffffff").fontSize(9).font("Helvetica");
  doc.text(`${hN} high impact  ·  ${mN} medium  ·  ${articles.length - hN - mN} low`, M, 114);

  // Jump past cover area
  doc.y = 162;

  // ═══ EXECUTIVE SUMMARY ═══
  if (doc.y + 60 > doc.page.height - 55) newPage();
  doc.fillColor("#b8942e").fontSize(12).font("Helvetica-Bold");
  doc.text("Executive Summary", { continued: false });
  doc.moveTo(M, doc.y + 1).lineTo(M + 130, doc.y + 1).lineWidth(1.5).strokeColor("#b8942e").stroke();
  doc.moveDown(0.4);
  doc.fillColor("#3a4555").fontSize(8.5).font("Helvetica");
  doc.text(
    `This week brought ${articles.length} developments in longevity science, led by a landmark Nature paper from the Gladyshev lab providing systems-level evidence for the Information Theory of Aging (analyzed ~11,000 cellular profiles). On the clinical front: nasal EV therapy reversed brain aging in mice (Texas A&M), the APOE2 variant was linked to superior neuronal DNA repair, and Retro Biosciences ($1.8B) progressed toward Phase 1 Alzheimer's data due August. Daewoong Pharma acquired Turn Bio's epigenetic reprogramming platform. COSMOS RCT showed multivitamins modestly slow epigenetic aging; AKG correlated with younger biological age.`,
    { width: PW, lineGap: 3 }
  );
  doc.moveDown(0.6);

  // ═══ ARTICLES (dense list) ═══
  if (doc.y + 30 > doc.page.height - 55) newPage();
  doc.fillColor("#2563a0").fontSize(12).font("Helvetica-Bold");
  doc.text("This Week's Developments", { continued: false });
  doc.moveTo(M, doc.y + 1).lineTo(M + 175, doc.y + 1).lineWidth(1.5).strokeColor("#2563a0").stroke();
  doc.moveDown(0.5);

  const sorted = [...articles].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return o[a.significance] - o[b.significance];
  });

  const catColors = { research: "#2d7d5f", clinical_trial: "#2563a0", supplement: "#b8942e", biotech: "#6b3fa0", longevity_industry: "#2563a0", epigenetic: "#c2672a", senescence: "#b5343a", other: "#6b7b8d" };
  const sigDot = { high: "●", medium: "◉", low: "○" };
  const sigCol = { high: "#b8942e", medium: "#2d7d5f", low: "#94a3b8" };

  sorted.forEach((article, i) => {
    // Estimate needed space
    doc.fontSize(9).font("Helvetica-Bold");
    const tH = doc.heightOfString(article.title, { width: PW - 28 });
    doc.fontSize(7.5).font("Helvetica");
    const sH = doc.heightOfString(article.summary, { width: PW - 36, lineGap: 1 });
    const needed = tH + sH + 20;

    if (doc.y + needed > doc.page.height - 55) newPage();

    const cc = catColors[article.category] || "#6b7b8d";

    // Dot + category + date on one line
    doc.fillColor(sigCol[article.significance]).fontSize(9).font("Helvetica");
    doc.text(`${sigDot[article.significance]}  `, M, doc.y, { continued: true, width: 18 });
    doc.fillColor(cc).fontSize(6.5).font("Helvetica-Bold");
    doc.text(`${article.category.replace("_"," ").toUpperCase()}  `, M + 16, doc.y, { continued: true, width: 54 });
    doc.fillColor("#94a3b8").fontSize(6.5).font("Helvetica");
    doc.text(`${article.date}  ${article.source}`, M + 72, doc.y, { width: 110 });
    doc.moveDown(0.2);

    // Title
    doc.fillColor("#1e2b3c").fontSize(9).font("Helvetica-Bold");
    doc.text(article.title, M + 14, doc.y, { width: PW - 18, lineGap: 1 });
    doc.moveDown(0.1);

    // Summary
    doc.fillColor("#3a4555").fontSize(7.5).font("Helvetica");
    doc.text(article.summary, M + 14, doc.y, { width: PW - 22, lineGap: 1 });

    // Thin separator
    doc.moveDown(0.3);
    doc.moveTo(M + 7, doc.y).lineTo(M + PW - 7, doc.y).lineWidth(0.3).strokeColor("#e8ecf0").stroke();
    doc.moveDown(0.3);
  });

  // ═══ TAKEAWAYS ═══
  if (doc.y + 40 > doc.page.height - 55) newPage();
  doc.fillColor("#b8942e").fontSize(12).font("Helvetica-Bold");
  doc.text("What This Means For You", { continued: false });
  doc.moveTo(M, doc.y + 1).lineTo(M + 160, doc.y + 1).lineWidth(1.5).strokeColor("#b8942e").stroke();
  doc.moveDown(0.4);

  const takeaways = [
    "Prioritise sleep recovery — catch-up sleep after short nights is associated with reduced mortality risk.",
    "Consider a daily multivitamin — the COSMOS RCT found ~4 months slower epigenetic aging over 2 years (Nature Medicine, 2026).",
    "Pair exercise with AKG — alpha-ketoglutarate showed notable biological age reduction, especially with regular exercise.",
    "NAD+ precursors (NMN/NR) show preclinical promise but long-term human data remains limited — consult a doctor first.",
    "Protect neuronal DNA repair — the APOE2 variant shows DNA repair capacity is central to cognitive aging. Exercise, sleep, and polyphenols support natural repair pathways.",
  ];

  takeaways.forEach((t, i) => {
    doc.fontSize(7.5).font("Helvetica");
    const h = doc.heightOfString(t, { width: PW - 20, lineGap: 1 }) + 6;
    if (doc.y + h > doc.page.height - 55) newPage();

    doc.fillColor("#b8942e").fontSize(10).font("Helvetica-Bold");
    doc.text(`${i + 1}.`, M, doc.y, { continued: true, width: 16 });
    doc.fillColor("#3a4555").fontSize(7.5).font("Helvetica");
    doc.text(`  ${t}`, M + 16, doc.y, { width: PW - 22, lineGap: 1 });
    doc.moveDown(0.2);
  });

  // ═══ FOOTER ═══
  if (doc.y + 20 > doc.page.height - 55) newPage();
  doc.moveDown(0.5);
  doc.moveTo(M, doc.y).lineTo(M + PW, doc.y).lineWidth(0.5).strokeColor("#e8ecf0").stroke();
  doc.moveDown(0.3);
  doc.fillColor("#6b7b8d").fontSize(6.5).font("Helvetica");
  doc.text("Sources: Reddit r/longevity, arXiv, X/Twitter. Curated for significance. Not medical advice.", { width: PW });

  // Last page footer
  pageFooter();
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
