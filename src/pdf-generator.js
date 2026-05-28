// Longevity Weekly Report — PDF Generator (Fixed)
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "reports");

const C = {
  bg: "#fcfcfc",
  navy: "#152238",
  ink: "#1e2b3c",
  body: "#3a4555",
  mute: "#6b7b8d",
  lightMute: "#94a3b8",
  gold: "#b8942e",
  goldLight: "#e8d5a3",
  green: "#2d7d5f",
  greenBg: "#e8f5e9",
  blue: "#2563a0",
  blueBg: "#e3edf7",
  red: "#b5343a",
  redBg: "#fce8e8",
  purple: "#6b3fa0",
  purpleBg: "#f1e8fa",
  orange: "#c2672a",
  orangeBg: "#fef0e4",
  cardBg: "#f7f9fb",
  cardBorder: "#e2e8f0",
  divider: "#e8ecf0",
  white: "#ffffff",
};

const CAT_THEME = {
  research: { color: C.green, bg: C.greenBg },
  clinical_trial: { color: C.blue, bg: C.blueBg },
  supplement: { color: C.gold, bg: C.goldLight },
  biotech: { color: C.purple, bg: C.purpleBg },
  longevity_industry: { color: C.blue, bg: C.blueBg },
  epigenetic: { color: C.orange, bg: C.orangeBg },
  senescence: { color: C.red, bg: C.redBg },
  other: { color: C.mute, bg: C.cardBg },
};

function ensureSpace(doc, needed, y) {
  // Returns {y, pageNum} — if not enough space, adds a new page
  if (y + needed > doc.page.height - 60) {
    doc.addPage();
    return y < 100 ? { y: 55, pageNum: -1 } : { y: 55, pageNum: -1 };
  }
  return { y, pageNum: -1 };
}

function drawFooter(doc, pageNum) {
  const footerY = doc.page.height - 35;
  doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
  doc.text("Longevity Intelligence  ·  Weekly Report  ·  Not medical advice", 50, footerY, { width: 300 });
  doc.text(`${pageNum}`, doc.page.width - 65, footerY, { width: 40, align: "right" });
}

// Measure text height for a given width
function textHeight(doc, text, width, fontSize) {
  doc.fontSize(fontSize);
  const lines = doc.heightOfString(text, { width, lineGap: 1.5 });
  return lines;
}

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 55, bottom: 55, left: 50, right: 50 },
    bufferPages: false,
  });

  const filepath = path.join(REPORT_DIR, `longevity-weekly-${weekEnd}.pdf`);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const pw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let pageNum = 1;

  // ═══ COVER HEADER ═══
  doc.rect(0, 0, doc.page.width, 210).fill(C.navy);
  doc.rect(0, 206, doc.page.width, 4).fill(C.gold);

  doc.fillColor(C.gold).fontSize(9).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", 50, 40, { characterSpacing: 3 });

  doc.fillColor(C.white).fontSize(34).font("Helvetica-Bold");
  doc.text("The Longevity Brief", 50, 62);

  doc.fillColor(C.lightMute).fontSize(12).font("Helvetica");
  doc.text(`Week of ${weekStart}  —  ${weekEnd}`, 50, 110);

  const now = new Date();
  doc.fillColor(C.goldLight).fontSize(9).font("Helvetica");
  doc.text(
    `Issue #1  ·  ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  ·  ${articles.length} stories`,
    50, 135
  );

  // Metric pills — CRITICAL: reset opacity after each rect
  const highN = articles.filter((a) => a.significance === "high").length;
  const medN = articles.filter((a) => a.significance === "medium").length;
  const researchN = articles.filter((a) => a.category === "research" || a.category === "epigenetic").length;
  const clinN = articles.filter((a) => a.category === "clinical_trial").length;
  const biotechN = articles.filter((a) => a.category === "biotech").length;

  const pills = [
    [`${highN}`, "high impact"],
    [`${medN}`, "medium"],
    [`${researchN}`, "research"],
    [`${clinN}`, "clinical"],
    [`${biotechN}`, "biotech"],
  ];

  let px = 50;
  pills.forEach(([val, label]) => {
    const w = 98;
    doc.save();
    doc.rect(px, 160, w, 38).fillOpacity(0.12).fill(C.white);
    doc.restore();
    doc.fillColor(C.white).fillOpacity(1).fontSize(20).font("Helvetica-Bold");
    doc.text(val, px, 163, { width: w, align: "center" });
    doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
    doc.text(label, px, 186, { width: w, align: "center" });
    px += w + 6;
  });

  let y = 230;

  // ═══ EXECUTIVE SUMMARY ═══
  // Section header
  doc.fillColor(C.gold).fontSize(15).font("Helvetica-Bold");
  doc.text("Executive Summary", 50, y, { lineGap: 0 });
  const titleW = doc.widthOfString("Executive Summary");
  y += 20;
  doc.moveTo(50, y).lineTo(50 + titleW + 30, y).lineWidth(2).strokeColor(C.gold).stroke();
  y += 12;

  const summaryText =
    `This week brought ${articles.length} significant developments in longevity science, led by a landmark Nature paper from the Gladyshev lab providing systems-level evidence for the Information Theory of Aging. ` +
    `The study analyzed ~11,000 cellular profiles and found that aging involves coordinated, partially reversible epigenetic changes — not merely random damage. ` +
    `On the clinical front, nasal extracellular vesicle therapy reversed brain aging markers in mice (Texas A&M), ` +
    `the protective APOE2 variant was linked to superior neuronal DNA repair, and Retro Biosciences ($1.8B valuation) progressed toward Phase 1 Alzheimer's data expected in August. ` +
    `In industry, Daewoong Pharma acquired Turn Bio's epigenetic reprogramming platform, signaling major pharma conviction. ` +
    `On the practical side, the COSMOS RCT in Nature Medicine showed daily multivitamins modestly slow epigenetic aging, and AKG supplementation correlated with younger biological age scores.`;

  doc.fillColor(C.body).fontSize(9.5).font("Helvetica");
  doc.text(summaryText, 50, y, { width: pw, lineGap: 4 });
  y = doc.y + 16;

  // ═══ TOP BREAKTHROUGHS ═══
  const topStories = articles.filter((a) => a.significance === "high");
  if (topStories.length > 0) {
    // Check space for section header + at least 1 card
    if (y + 100 > doc.page.height - 60) {
      drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
    }

    doc.fillColor(C.green).fontSize(15).font("Helvetica-Bold");
    doc.text("Top Breakthroughs", 50, y);
    y += 20;
    doc.moveTo(50, y).lineTo(50 + doc.widthOfString("Top Breakthroughs") + 30, y).lineWidth(2).strokeColor(C.green).stroke();
    y += 14;

    topStories.forEach((article) => {
      const cat = CAT_THEME[article.category] || CAT_THEME.other;

      // Measure needed height: title + summary
      doc.fontSize(11).font("Helvetica-Bold");
      const titleH = doc.heightOfString(article.title, { width: pw - 32 });
      doc.fontSize(8.5).font("Helvetica");
      const summaryH = doc.heightOfString(article.summary, { width: pw - 36, lineGap: 1.5 });
      const cardH = Math.max(78, titleH + summaryH + 28 + 24);

      if (y + cardH > doc.page.height - 60) {
        drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
      }

      // Card background
      doc.roundedRect(50, y, pw, cardH, 4).fill(C.cardBg).stroke(C.cardBorder);
      // Left accent
      doc.roundedRect(50, y + 2, 4, cardH - 4, 2).fill(cat.color);

      // Category tag
      doc.roundedRect(62, y + 10, 80, 16, 3).fill(cat.bg);
      doc.fillColor(cat.color).fontSize(7).font("Helvetica-Bold");
      doc.text(article.category.replace("_", " ").toUpperCase(), 62, y + 13.5, { width: 80, align: "center" });

      // Date + impact
      doc.fillColor(cat.color).fontSize(7).font("Helvetica");
      doc.text("★ HIGH IMPACT", 148, y + 13.5);
      doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
      doc.text(article.date, 64, y + 32);

      // Title
      doc.fillColor(C.ink).fontSize(11).font("Helvetica-Bold");
      doc.text(article.title, 62, y + 44, { width: pw - 30, lineGap: 2 });

      // Summary
      const summaryY = y + 44 + titleH + 4;
      doc.fillColor(C.body).fontSize(8.5).font("Helvetica");
      doc.text(article.summary, 62, summaryY, { width: pw - 34, lineGap: 1.5 });

      y += cardH + 12;
    });
  }

  // ═══ ALL DEVELOPMENTS ═══
  if (y + 60 > doc.page.height - 60) {
    drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
  }

  doc.fillColor(C.blue).fontSize(15).font("Helvetica-Bold");
  doc.text("All Developments This Week", 50, y);
  y += 20;
  doc.moveTo(50, y).lineTo(50 + doc.widthOfString("All Developments This Week") + 30, y).lineWidth(2).strokeColor(C.blue).stroke();
  y += 14;

  articles.forEach((article, i) => {
    const cat = CAT_THEME[article.category] || CAT_THEME.other;

    // Measure height dynamically
    doc.fontSize(10).font("Helvetica-Bold");
    const titleH = doc.heightOfString(article.title, { width: pw - 50 });
    doc.fontSize(8).font("Helvetica");
    const summaryH = doc.heightOfString(article.summary, { width: pw - 54, lineGap: 1 });
    const cardH = Math.max(60, titleH + summaryH + 20);

    if (y + cardH > doc.page.height - 60) {
      drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
    }

    doc.roundedRect(50, y, pw, cardH, 3).fill(C.cardBg).stroke(C.cardBorder);

    // Number circle
    const numColor = article.significance === "high" ? C.gold : article.significance === "medium" ? C.green : C.lightMute;
    doc.save();
    doc.circle(68, y + cardH / 2, 14).fillOpacity(0.15).fill(numColor);
    doc.restore();
    doc.fillColor(numColor).fontSize(11).font("Helvetica-Bold");
    doc.text(String(i + 1).padStart(2, "0"), 57, y + cardH / 2 - 7, { width: 22, align: "center" });

    // Category tag
    doc.roundedRect(88, y + 8, 66, 14, 3).fill(cat.bg);
    doc.fillColor(cat.color).fontSize(6).font("Helvetica-Bold");
    doc.text(article.category.replace("_", " ").toUpperCase(), 88, y + 11, { width: 66, align: "center" });

    // Date + source
    doc.fillColor(C.lightMute).fontSize(7).font("Helvetica");
    doc.text(`${article.date}  ·  ${article.source}`, 160, y + 11);

    // Title
    doc.fillColor(C.ink).fontSize(10).font("Helvetica-Bold");
    doc.text(article.title, 88, y + 27, { width: pw - 50, lineGap: 1 });

    // Summary
    doc.fillColor(C.mute).fontSize(8).font("Helvetica");
    doc.text(article.summary, 88, y + 27 + titleH + 2, { width: pw - 52, lineGap: 1 });

    y += cardH + 8;
  });

  // ═══ WHAT THIS MEANS FOR YOU ═══
  if (y + 100 > doc.page.height - 60) {
    drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
  }

  doc.fillColor(C.gold).fontSize(15).font("Helvetica-Bold");
  doc.text("What This Means For You", 50, y);
  y += 20;
  doc.moveTo(50, y).lineTo(50 + doc.widthOfString("What This Means For You") + 30, y).lineWidth(2).strokeColor(C.gold).stroke();
  y += 14;

  const takeaways = [
    { t: "Prioritise sleep recovery", d: "New data reinforces that catch-up sleep after short nights is associated with reduced all-cause mortality risk. If you've had a poor night, prioritise recovery the next night — don't just push through." },
    { t: "Consider a daily multivitamin", d: "The COSMOS RCT (Nature Medicine, 2026) found daily multivitamin use slowed epigenetic aging by ~4 months over 2 years, measured via DNA methylation clocks. Effect strongest in those with accelerated biological aging at baseline." },
    { t: "Pair exercise with targeted supplementation", d: "Alpha-ketoglutarate (AKG) showed notable biological age reduction effects, especially when combined with regular exercise in older adults. AKG is naturally produced by the body and declines with age." },
    { t: "NAD+ precursors: promising but early", d: "NMN and NR continue to show preclinical promise for mitochondrial function and DNA repair. Long-term human lifespan data remains limited. Speak with a doctor familiar with longevity medicine before supplementing." },
    { t: "Protect your brain's DNA repair machinery", d: "The APOE2 variant's protective effects highlight that neuronal DNA repair capacity is central to cognitive aging. Exercise, quality sleep, polyphenol-rich foods, and stress management support the body's natural DNA repair pathways." },
  ];

  takeaways.forEach((item, i) => {
    doc.fontSize(10).font("Helvetica-Bold");
    const titleH = doc.heightOfString(item.t, { width: pw - 60 });
    doc.fontSize(8).font("Helvetica");
    const descH = doc.heightOfString(item.d, { width: pw - 56, lineGap: 1.5 });
    const h = Math.max(48, titleH + descH + 20);

    if (y + h > doc.page.height - 60) {
      drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
    }

    doc.roundedRect(50, y, pw, h, 3).fill(C.cardBg).stroke(C.divider);

    doc.fillColor(C.gold).fontSize(16).font("Helvetica-Bold");
    doc.text(`${i + 1}`, 62, y + 14);

    doc.fillColor(C.ink).fontSize(10).font("Helvetica-Bold");
    doc.text(item.t, 88, y + 12);

    doc.fillColor(C.body).fontSize(8).font("Helvetica");
    doc.text(item.d, 88, y + 12 + titleH + 4, { width: pw - 54, lineGap: 1.5 });

    y += h + 8;
  });

  // ═══ SOURCES ═══
  if (y + 60 > doc.page.height - 60) {
    drawFooter(doc, pageNum); pageNum++; doc.addPage(); y = 55;
  }
  y += 10;
  doc.moveTo(50, y).lineTo(50 + pw, y).lineWidth(1).strokeColor(C.divider).stroke();
  y += 14;

  doc.fillColor(C.mute).fontSize(8).font("Helvetica");
  doc.text(
    "Sources scanned daily: Reddit r/longevity, arXiv (longevity/aging/senescence/rejuvenation), X/Twitter longevity research community, Google News alerts. Articles are curated for significance and categorised by domain. This report is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider before starting any supplement or treatment regimen.",
    50, y, { width: pw, lineGap: 3 }
  );

  // Final footer
  drawFooter(doc, pageNum);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
