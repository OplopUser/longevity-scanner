// Longevity Weekly Report — PDF Generator (Event-based footers, no buffer pages)
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "reports");

const C = {
  navy: "#152238", ink: "#1e2b3c", body: "#3a4555", mute: "#6b7b8d",
  lightMute: "#94a3b8", gold: "#b8942e", goldLight: "#e8d5a3",
  green: "#2d7d5f", greenBg: "#e8f5e9", blue: "#2563a0", blueBg: "#e3edf7",
  red: "#b5343a", redBg: "#fce8e8", purple: "#6b3fa0", purpleBg: "#f1e8fa",
  orange: "#c2672a", orangeBg: "#fef0e4", cardBg: "#f7f9fb",
  cardBorder: "#e2e8f0", divider: "#e8ecf0", white: "#ffffff",
};

const CAT = {
  research: { c: C.green, b: C.greenBg },
  clinical_trial: { c: C.blue, b: C.blueBg },
  supplement: { c: C.gold, b: C.goldLight },
  biotech: { c: C.purple, b: C.purpleBg },
  longevity_industry: { c: C.blue, b: C.blueBg },
  epigenetic: { c: C.orange, b: C.orangeBg },
  senescence: { c: C.red, b: C.redBg },
  other: { c: C.mute, b: C.cardBg },
};

const M = 50, PH = 842, FY = PH - 40, BOT = PH - 60;

function footer(doc) {
  const pn = doc.bufferedPageRange().count;
  doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
  doc.text("Longevity Intelligence  ·  Weekly Report  ·  Not medical advice", M, FY, { width: 300 });
  doc.text(`${pn}`, doc.page.width - 65, FY, { width: 40, align: "right" });
}

function space(doc, n) {
  if (doc.y + n > BOT) {
    footer(doc);
    doc.addPage();
  }
}

function section(doc, title, color) {
  space(doc, 45);
  doc.moveDown(0.4);
  doc.fillColor(color).fontSize(15).font("Helvetica-Bold");
  doc.text(title, M, doc.y, { lineGap: 0 });
  const w = doc.widthOfString(title);
  doc.moveTo(M, doc.y + 2).lineTo(M + w + 30, doc.y + 2).lineWidth(2).strokeColor(color).stroke();
  doc.moveDown(0.6);
}

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({ size: "A4", margins: { top: 55, bottom: 55, left: M, right: M } });
  const filepath = path.join(REPORT_DIR, `longevity-weekly-${weekEnd}.pdf`);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // No pageAdded event — footers drawn manually before each addPage + final page

  const pw = doc.page.width - M * 2;

  // ═══ COVER HEADER ═══
  doc.rect(0, 0, doc.page.width, 210).fill(C.navy);
  doc.rect(0, 206, doc.page.width, 4).fill(C.gold);
  doc.fillColor(C.gold).fontSize(9).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", M, 40, { characterSpacing: 3 });
  doc.fillColor(C.white).fontSize(34).font("Helvetica-Bold");
  doc.text("The Longevity Brief", M, 62);
  doc.fillColor(C.lightMute).fontSize(12).font("Helvetica");
  doc.text(`Week of ${weekStart}  —  ${weekEnd}`, M, 110);
  const now = new Date();
  doc.fillColor(C.goldLight).fontSize(9).font("Helvetica");
  doc.text(`Issue #1  ·  ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  ·  ${articles.length} stories`, M, 135);

  // Pills
  const counts = {
    high: articles.filter(a => a.significance === "high").length,
    med: articles.filter(a => a.significance === "medium").length,
    research: articles.filter(a => a.category === "research" || a.category === "epigenetic").length,
    clinical: articles.filter(a => a.category === "clinical_trial").length,
    biotech: articles.filter(a => a.category === "biotech").length,
  };
  const pills = [[counts.high,"high impact"],[counts.med,"medium"],[counts.research,"research"],[counts.clinical,"clinical"],[counts.biotech,"biotech"]];
  let px = M;
  pills.forEach(([val, label]) => {
    doc.save();
    doc.rect(px, 160, 98, 38).fillOpacity(0.12).fill(C.white).fillOpacity(1);
    doc.restore();
    doc.fillColor(C.white).fontSize(20).font("Helvetica-Bold");
    doc.text(String(val), px, 163, { width: 98, align: "center" });
    doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
    doc.text(label, px, 186, { width: 98, align: "center" });
    px += 104;
  });

  doc.y = 230;

  // ═══ EXECUTIVE SUMMARY ═══
  section(doc, "Executive Summary", C.gold);
  doc.fillColor(C.body).fontSize(9.5).font("Helvetica");
  doc.text(
    `This week brought ${articles.length} significant developments in longevity science, led by a landmark Nature paper from the Gladyshev lab providing systems-level evidence for the Information Theory of Aging. ` +
    `The study analyzed ~11,000 cellular profiles and found that aging involves coordinated, partially reversible epigenetic changes — not merely random damage. ` +
    `On the clinical front, nasal extracellular vesicle therapy reversed brain aging markers in mice (Texas A&M), ` +
    `the protective APOE2 variant was linked to superior neuronal DNA repair, and Retro Biosciences ($1.8B valuation) progressed toward Phase 1 Alzheimer's data expected in August. ` +
    `In industry, Daewoong Pharma acquired Turn Bio's epigenetic reprogramming platform, signaling major pharma conviction. ` +
    `On the practical side, the COSMOS RCT in Nature Medicine showed daily multivitamins modestly slow epigenetic aging, and AKG supplementation correlated with younger biological age scores.`,
    M, doc.y, { width: pw, lineGap: 4 }
  );
  doc.moveDown(1);

  // ═══ TOP BREAKTHROUGHS ═══
  const top = articles.filter(a => a.significance === "high");
  if (top.length > 0) {
    section(doc, "Top Breakthroughs", C.green);
    top.forEach(article => {
      const cat = CAT[article.category] || CAT.other;
      doc.fontSize(11).font("Helvetica-Bold");
      const tH = doc.heightOfString(article.title, { width: pw - 32 });
      doc.fontSize(8.5).font("Helvetica");
      const sH = doc.heightOfString(article.summary, { width: pw - 36, lineGap: 1.5 });
      const h = Math.max(78, tH + sH + 50);
      space(doc, h + 12);
      const cy = doc.y;

      doc.rect(M, cy, pw, h).fill(C.cardBg).stroke(C.cardBorder);
      doc.rect(M, cy + 2, 4, h - 4).fill(cat.c);
      doc.rect(M + 12, cy + 10, 80, 16).fill(cat.b);
      doc.fillColor(cat.c).fontSize(7).font("Helvetica-Bold");
      doc.text(article.category.replace("_"," ").toUpperCase(), M + 12, cy + 13.5, { width: 80, align: "center" });
      doc.fillColor(cat.c).fontSize(7).font("Helvetica");
      doc.text("★ HIGH IMPACT", M + 98, cy + 13.5);
      doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
      doc.text(article.date, M + 14, cy + 32);
      doc.fillColor(C.ink).fontSize(11).font("Helvetica-Bold");
      doc.text(article.title, M + 12, cy + 44, { width: pw - 30, lineGap: 2 });
      doc.fillColor(C.body).fontSize(8.5).font("Helvetica");
      doc.text(article.summary, M + 12, cy + 44 + tH + 6, { width: pw - 34, lineGap: 1.5 });
      doc.y = cy + h + 12;
    });
  }

  // ═══ ALL DEVELOPMENTS ═══
  section(doc, "All Developments This Week", C.blue);
  articles.forEach((article, i) => {
    const cat = CAT[article.category] || CAT.other;
    doc.fontSize(10).font("Helvetica-Bold");
    const tH = doc.heightOfString(article.title, { width: pw - 50 });
    doc.fontSize(8).font("Helvetica");
    const sH = doc.heightOfString(article.summary, { width: pw - 54, lineGap: 1 });
    const h = Math.max(60, tH + sH + 26);
    space(doc, h + 8);
    const cy = doc.y;

    doc.rect(M, cy, pw, h).fill(C.cardBg).stroke(C.cardBorder);

    const nc = article.significance === "high" ? C.gold : article.significance === "medium" ? C.green : C.lightMute;
    doc.save();
    doc.circle(M + 18, cy + h / 2, 14).fillOpacity(0.15).fill(nc).fillOpacity(1);
    doc.restore();
    doc.fillColor(nc).fontSize(11).font("Helvetica-Bold");
    doc.text(String(i + 1).padStart(2, "0"), M + 7, cy + h / 2 - 7, { width: 22, align: "center" });

    doc.rect(M + 38, cy + 8, 66, 14).fill(cat.b);
    doc.fillColor(cat.c).fontSize(6).font("Helvetica-Bold");
    doc.text(article.category.replace("_"," ").toUpperCase(), M + 38, cy + 11, { width: 66, align: "center" });
    doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
    doc.text(`${article.date}  ·  ${article.source}`, M + 110, cy + 11);

    doc.fillColor(C.ink).fontSize(10).font("Helvetica-Bold");
    doc.text(article.title, M + 38, cy + 27, { width: pw - 50, lineGap: 1 });
    doc.fillColor(C.mute).fontSize(8).font("Helvetica");
    doc.text(article.summary, M + 38, cy + 27 + tH + 4, { width: pw - 52, lineGap: 1 });
    doc.y = cy + h + 8;
  });

  // ═══ TAKEAWAYS ═══
  section(doc, "What This Means For You", C.gold);
  const takeaways = [
    { t: "Prioritise sleep recovery", d: "New data reinforces that catch-up sleep after short nights is associated with reduced all-cause mortality risk. If you've had a poor night, prioritise recovery the next night." },
    { t: "Consider a daily multivitamin", d: "The COSMOS RCT (Nature Medicine, 2026) found daily multivitamin use slowed epigenetic aging by ~4 months over 2 years. Effect strongest in those with accelerated biological aging." },
    { t: "Pair exercise with targeted supplementation", d: "Alpha-ketoglutarate (AKG) showed notable biological age reduction effects, especially when combined with regular exercise in older adults." },
    { t: "NAD+ precursors: promising but early", d: "NMN and NR continue to show preclinical promise. Long-term human lifespan data remains limited. Consult a doctor before supplementing." },
    { t: "Protect your brain's DNA repair", d: "The APOE2 variant highlights that neuronal DNA repair is central to cognitive aging. Exercise, sleep, polyphenols, and stress management support natural DNA repair." },
  ];
  takeaways.forEach((item, i) => {
    doc.fontSize(10).font("Helvetica-Bold");
    const tH = doc.heightOfString(item.t, { width: pw - 60 });
    doc.fontSize(8).font("Helvetica");
    const dH = doc.heightOfString(item.d, { width: pw - 56, lineGap: 1.5 });
    const h = Math.max(48, tH + dH + 20);
    space(doc, h + 8);
    const cy = doc.y;

    doc.rect(M, cy, pw, h).fill(C.cardBg).stroke(C.divider);
    doc.fillColor(C.gold).fontSize(16).font("Helvetica-Bold");
    doc.text(`${i + 1}`, M + 12, cy + 14);
    doc.fillColor(C.ink).fontSize(10).font("Helvetica-Bold");
    doc.text(item.t, M + 38, cy + 12);
    doc.fillColor(C.body).fontSize(8).font("Helvetica");
    doc.text(item.d, M + 38, cy + 12 + tH + 4, { width: pw - 54, lineGap: 1.5 });
    doc.y = cy + h + 8;
  });

  // ═══ SOURCES ═══
  space(doc, 60);
  doc.moveDown(0.5);
  doc.moveTo(M, doc.y).lineTo(M + pw, doc.y).lineWidth(1).strokeColor(C.divider).stroke();
  doc.moveDown(0.5);
  doc.fillColor(C.mute).fontSize(8).font("Helvetica");
  doc.text(
    "Sources: Reddit r/longevity, arXiv, X/Twitter longevity research community, Google News. Articles curated for significance and categorised by domain. Not medical advice.",
    M, doc.y, { width: pw, lineGap: 3 }
  );

  // Final page footer (pageAdded only fires on addPage, not the last page)
  footer(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
