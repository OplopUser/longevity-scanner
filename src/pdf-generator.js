// Longevity Weekly Report — Simple single-column, reliable
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "reports");
const M = 45, PW = 595 - M * 2;

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 42, bottom: 42, left: M, right: M } });
  const filepath = path.join(DIR, `longevity-weekly-${weekEnd}.pdf`);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  let pg = 1;
  doc.on("pageAdded", () => pg++);

  const FTR = () => {
    doc.fillColor("#778899").fontSize(7).font("Helvetica");
    doc.text(`Longevity Intelligence  ·  Weekly Report  ·  Page ${pg}`, M, doc.page.height - 36, { width: PW, align: "center" });
  };

  function hr() {
    doc.moveDown(0.3);
    doc.moveTo(M, doc.y).lineTo(M + PW, doc.y).lineWidth(0.4).strokeColor("#d0d4da").stroke();
    doc.moveDown(0.5);
  }

  function heading(text, color) {
    doc.moveDown(0.4);
    doc.fillColor(color).fontSize(14).font("Helvetica-Bold");
    doc.text(text, M, doc.y);
    const w = doc.widthOfString(text);
    doc.moveTo(M, doc.y + 2).lineTo(M + w + 30, doc.y + 2).lineWidth(2).strokeColor(color).stroke();
    doc.moveDown(0.7);
  }

  // ═══════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════
  doc.rect(0, 0, 595, 842).fill("#0f1a2e");
  doc.rect(0, 0, 595, 4).fill("#c9a84c");
  doc.rect(0, 838, 595, 4).fill("#c9a84c");

  doc.fillColor("#c9a84c").fontSize(10).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", M, 52, { characterSpacing: 3 });

  doc.fillColor("#ffffff").fontSize(40).font("Helvetica-Bold");
  doc.text("The Longevity\nBrief", M, 78, { lineGap: 8 });

  doc.fillColor("#8899aa").fontSize(13).font("Helvetica");
  doc.text(`Week of ${weekStart} — ${weekEnd}`, M, 185);

  const now = new Date();
  doc.fillColor("#d4c48a").fontSize(10).font("Helvetica");
  doc.text(now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), M, 215);

  // Stat boxes
  const hN = articles.filter(a => a.significance === "high").length;
  const mN = articles.filter(a => a.significance === "medium").length;
  const rN = articles.filter(a => a.category === "research" || a.category === "epigenetic").length;
  const cN = articles.filter(a => a.category === "clinical_trial").length;
  const bN = articles.filter(a => a.category === "biotech").length;

  const stats = [
    ["High Impact", hN, "#c9a84c"],
    ["Medium", mN, "#3d9e6c"],
    ["Research", rN, "#3b7ec7"],
    ["Clinical", cN, "#3b7ec7"],
    ["Biotech", bN, "#7c4dbf"],
  ];

  let sx = M;
  stats.forEach(([label, val, col]) => {
    doc.rect(sx, 256, 95, 46).fillOpacity(0.1).fill(col).fillOpacity(1);
    doc.fillColor(col).fontSize(22).font("Helvetica-Bold");
    doc.text(String(val), sx, 262, { width: 95, align: "center" });
    doc.fillColor("#8899aa").fontSize(8).font("Helvetica");
    doc.text(label, sx, 288, { width: 95, align: "center" });
    sx += 102;
  });

  doc.fillColor("#8899aa").fontSize(10).font("Helvetica");
  doc.text(
    `${articles.length} breakthroughs this week — from epigenetic reprogramming to clinical trials and biotech deals.`,
    M, 330, { width: PW - 40, lineGap: 4 }
  );
  doc.fillColor("#667788").fontSize(8).font("Helvetica");
  doc.text("Automated daily scan · Curated for significance · Not medical advice", M, 370);

  FTR();

  // ═══════════════════════════════════════
  // PAGE 2+: CONTENT
  // ═══════════════════════════════════════
  doc.addPage();

  heading("Executive Summary", "#c9a84c");
  doc.fillColor("#3a4555").fontSize(9.5).font("Helvetica");
  doc.text(
    `This week brought ${articles.length} significant developments in longevity science, led by a landmark Nature paper from the Gladyshev lab providing systems-level evidence for the Information Theory of Aging — analyzing ~11,000 cellular profiles to confirm aging involves coordinated, partially reversible epigenetic changes. ` +
    `On the clinical front, nasal extracellular vesicle therapy reversed brain aging markers in mice (Texas A&M), the protective APOE2 variant was linked to superior neuronal DNA repair, and Retro Biosciences ($1.8B valuation) progressed toward Phase 1 Alzheimer's data expected August 2026. ` +
    `In industry, Daewoong Pharma acquired Turn Bio's epigenetic reprogramming platform, signaling major pharma conviction. ` +
    `On the practical side, the COSMOS RCT in Nature Medicine showed daily multivitamins modestly slow epigenetic aging, and AKG supplementation correlated with younger biological age scores.`,
    M, doc.y, { width: PW, lineGap: 4 }
  );
  hr();

  // ═══ ARTICLES ═══
  heading("This Week's Developments", "#3b7ec7");

  const sorted = [...articles].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return o[a.significance] - o[b.significance];
  });

  const CAT = {
    research: "#2d7d5f", clinical_trial: "#3b7ec7", supplement: "#c9a84c",
    biotech: "#7c4dbf", longevity_industry: "#3b7ec7", epigenetic: "#d4743c",
    senescence: "#c45a5a", other: "#8899aa",
  };

  sorted.forEach(article => {
    const cc = CAT[article.category] || "#8899aa";
    const star = article.significance === "high" ? "★" : article.significance === "medium" ? "◆" : "·";
    const sc = article.significance === "high" ? "#c9a84c" : article.significance === "medium" ? "#2d7d5f" : "#8899aa";

    // Line 1: star · CATEGORY · date · source
    doc.fillColor(sc).fontSize(9).font("Helvetica");
    doc.text(star, M, doc.y, { continued: true, width: 14 });
    doc.fillColor(cc).fontSize(7).font("Helvetica-Bold");
    doc.text(` ${article.category.replace(/_/g, " ").toUpperCase()} `, M + 12, doc.y, { continued: true, width: 56 });
    doc.fillColor("#8899aa").fontSize(7).font("Helvetica");
    doc.text(`${article.date}   ${article.source}`, M + 68, doc.y, { width: PW - 70 });
    doc.moveDown(0.2);

    // Title
    doc.fillColor("#1a2332").fontSize(9.5).font("Helvetica-Bold");
    doc.text(article.title, M + 14, doc.y, { width: PW - 20, lineGap: 1.5 });
    doc.moveDown(0.1);

    // Summary
    doc.fillColor("#3a4555").fontSize(8).font("Helvetica");
    doc.text(article.summary, M + 14, doc.y, { width: PW - 22, lineGap: 1.5 });
    doc.moveDown(0.4);

    // Thin line between articles
    doc.moveTo(M + 14, doc.y).lineTo(M + PW - 14, doc.y).lineWidth(0.3).strokeColor("#dde0e6").stroke();
    doc.moveDown(0.4);
  });

  // ═══ TAKEAWAYS ═══
  heading("What This Means For You", "#c9a84c");

  const takeaways = [
    ["Prioritise sleep recovery", "Catch-up sleep after short nights is associated with reduced all-cause mortality risk. If you've had a poor night, focus on recovery the next."],
    ["Consider a daily multivitamin", "The COSMOS RCT (Nature Medicine, 2026) found daily multivitamin use slowed epigenetic aging by ~4 months over 2 years, especially in those with accelerated biological aging at baseline."],
    ["Pair exercise with AKG", "Alpha-ketoglutarate showed notable biological age reduction effects, particularly when combined with regular exercise in older adults. AKG naturally declines with age."],
    ["NAD+ precursors: promising but early", "NMN and NR continue to show preclinical promise for mitochondrial function and DNA repair. Long-term human lifespan data remains limited — consult a doctor before supplementing."],
    ["Protect neuronal DNA repair", "The APOE2 variant demonstrates that DNA repair capacity is central to cognitive aging. Exercise, quality sleep, and polyphenol-rich foods support natural repair pathways."],
  ];

  takeaways.forEach(([title, desc], i) => {
    doc.fillColor("#c9a84c").fontSize(12).font("Helvetica-Bold");
    doc.text(`${i + 1}.`, M, doc.y, { continued: true, width: 18 });
    doc.fillColor("#1a2332").fontSize(9.5).font("Helvetica-Bold");
    doc.text(title, M + 18, doc.y, { width: PW - 24 });
    doc.moveDown(0.1);
    doc.fillColor("#3a4555").fontSize(8).font("Helvetica");
    doc.text(desc, M + 18, doc.y, { width: PW - 26, lineGap: 1.5 });
    doc.moveDown(0.3);
  });

  // ═══ SOURCES ═══
  hr();
  doc.fillColor("#667788").fontSize(7.5).font("Helvetica");
  doc.text("Sources: Reddit r/longevity, arXiv, X/Twitter longevity research community. Articles curated for significance. Not medical advice.", M, doc.y, { width: PW });

  FTR();
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
