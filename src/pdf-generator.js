// Longevity Weekly Report — PDF Generator
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = path.join(__dirname, "..", "reports");

// ─── Color palette ───
const COLORS = {
  dark: "#0a1628",
  primary: "#00c98b",
  accent: "#4fc3f7",
  muted: "#8899aa",
  warning: "#f7c543",
  danger: "#e95f6a",
  white: "#f0f4f8",
  card: "#111d32",
  cardBorder: "#1e3350",
};

const CATEGORY_COLORS = {
  research: COLORS.primary,
  clinical_trial: COLORS.accent,
  supplement: COLORS.warning,
  biotech: "#ce93d8",
  longevity_industry: "#80cbc4",
  epigenetic: "#ff8a65",
  senescence: "#ef5350",
  other: COLORS.muted,
};

function generateReport(articles, weekStart, weekEnd) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 45, right: 45 },
    bufferPages: true,
  });

  const filepath = path.join(
    REPORT_DIR,
    `longevity-weekly-${weekEnd}.pdf`
  );
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.y;

  // ─── HEADER BACKGROUND ───
  doc.rect(0, 0, doc.page.width, 175).fill(COLORS.dark);
  doc.rect(0, 170, doc.page.width, 5).fill(COLORS.primary);

  // ─── TITLE ───
  doc.fillColor(COLORS.primary).fontSize(11).font("Helvetica-Bold");
  doc.text("LONGEVITY INTELLIGENCE", 45, 40);
  doc.fillColor(COLORS.white).fontSize(26).font("Helvetica-Bold");
  doc.text("Weekly Scan Report", 45, 58);
  doc.fillColor(COLORS.muted).fontSize(10).font("Helvetica");
  doc.text(
    `${weekStart} — ${weekEnd}  ·  ${articles.length} breakthroughs  ·  Automated scan`,
    45,
    90
  );

  // ─── KEY METRICS BAR ───
  const highImpact = articles.filter((a) => a.significance === "high").length;
  const research = articles.filter((a) => a.category === "research").length;
  const clinical = articles.filter((a) => a.category === "clinical_trial").length;
  const biotech = articles.filter((a) => a.category === "biotech").length;

  const metrics = [
    { label: "Breakthroughs", value: String(articles.length) },
    { label: "High Impact", value: String(highImpact) },
    { label: "Research Papers", value: String(research) },
    { label: "Clinical", value: String(clinical) },
    { label: "Biotech Deals", value: String(biotech) },
  ];

  let mx = 45;
  metrics.forEach((m) => {
    doc.rect(mx, 120, 95, 42).fill(COLORS.card).stroke(COLORS.cardBorder);
    doc.fillColor(COLORS.muted).fontSize(8).font("Helvetica");
    doc.text(m.label, mx + 8, 126, { width: 80, align: "center" });
    doc.fillColor(COLORS.white).fontSize(20).font("Helvetica-Bold");
    doc.text(m.value, mx + 8, 138, { width: 80, align: "center" });
    mx += 102;
  });

  doc.y = 185;
  y = 185;

  // ─── EXECUTIVE SUMMARY ───
  doc.fillColor(COLORS.primary).fontSize(13).font("Helvetica-Bold");
  doc.text("▎Executive Summary", 45, y);
  y += 22;

  const summaryText =
    `This week in longevity science (${weekStart} to ${weekEnd}) brought ${articles.length} notable developments. ` +
    `The dominant theme was epigenetic reprogramming and the Information Theory of Aging, with a landmark Nature paper from the Gladyshev lab ` +
    `providing systems-level evidence that aging involves coordinated, reversible epigenetic changes. ` +
    `On the clinical front, Retro Biosciences advanced toward Phase 1 Alzheimer's data, nasal EV therapy showed promise for brain aging in mice, ` +
    `and the APOE2 longevity gene was linked to superior neuronal DNA repair. ` +
    `Industry momentum continued with Daewoong Pharma acquiring Turn Bio's reprogramming platform and Retro hitting a $1.8B valuation. ` +
    `Practical findings included evidence that daily multivitamins modestly slow epigenetic aging and that AKG supplementation correlates with younger biological age.`;

  doc.fillColor(COLORS.white).fontSize(9.5).font("Helvetica");
  doc.text(summaryText, 45, y, { width: pageW, lineGap: 3 });
  y = doc.y + 18;

  // ─── SECTION: TOP STORIES ───
  const topStories = articles.filter((a) => a.significance === "high");
  if (topStories.length > 0) {
    doc.fillColor(COLORS.warning).fontSize(13).font("Helvetica-Bold");
    doc.text("▎Top Breakthroughs", 45, y);
    y += 22;

    topStories.forEach((article, i) => {
      // Card background
      const cardH = 90;
      if (y + cardH > doc.page.height - 55) {
        doc.addPage();
        y = 50;
      }
      doc.rect(45, y, pageW, cardH).fill(COLORS.card).stroke(COLORS.cardBorder);

      // Category badge
      const catColor = CATEGORY_COLORS[article.category] || COLORS.muted;
      doc.rect(53, y + 8, 70, 18).fill(catColor).fillOpacity(0.2);
      doc.fillColor(catColor).fontSize(7).font("Helvetica-Bold");
      doc.text(article.category.replace("_", " ").toUpperCase(), 53, y + 12, {
        width: 70,
        align: "center",
      });
      doc.fillOpacity(1);

      // Source badge
      doc.fillColor(COLORS.muted).fontSize(7).font("Helvetica");
      doc.text(article.source.toUpperCase(), 130, y + 12, { width: 60 });

      // Title
      doc.fillColor(COLORS.white).fontSize(11).font("Helvetica-Bold");
      doc.text(article.title, 53, y + 32, { width: pageW - 60 });

      // Summary
      doc.fillColor(COLORS.muted).fontSize(8.5).font("Helvetica");
      doc.text(article.summary, 53, y + 54, { width: pageW - 65, lineGap: 1 });

      y += cardH + 10;
    });
  }

  // ─── ALL STORIES ───
  if (y > doc.page.height - 100) {
    doc.addPage();
    y = 50;
  }
  doc.fillColor(COLORS.accent).fontSize(13).font("Helvetica-Bold");
  doc.text("▎All Developments This Week", 45, y);
  y += 22;

  articles.forEach((article, i) => {
    const cardH = 75;
    if (y + cardH > doc.page.height - 55) {
      doc.addPage();
      y = 50;
    }

    doc.rect(45, y, pageW, cardH).fill(COLORS.card).stroke(COLORS.cardBorder);

    // Number
    doc.fillColor(COLORS.muted).fontSize(18).font("Helvetica-Bold");
    doc.text(String(i + 1).padStart(2, "0"), 53, y + 10);

    // Significance dot
    const sigColor =
      article.significance === "high"
        ? COLORS.warning
        : article.significance === "medium"
        ? COLORS.accent
        : COLORS.muted;
    doc.circle(78, y + 16, 4).fill(sigColor);

    // Category badge
    const catColor = CATEGORY_COLORS[article.category] || COLORS.muted;
    doc.rect(90, y + 8, 72, 16).fill(catColor).fillOpacity(0.15);
    doc.fillColor(catColor).fontSize(6.5).font("Helvetica-Bold");
    doc.text(article.category.replace("_", " ").toUpperCase(), 90, y + 11.5, {
      width: 72,
      align: "center",
    });
    doc.fillOpacity(1);

    // Date
    doc.fillColor(COLORS.muted).fontSize(7).font("Helvetica");
    doc.text(article.date, 170, y + 11.5, { width: 70 });

    // Title
    doc.fillColor(COLORS.white).fontSize(10).font("Helvetica-Bold");
    doc.text(article.title, 90, y + 30, { width: pageW - 100 });

    // Summary
    doc.fillColor(COLORS.muted).fontSize(8).font("Helvetica");
    doc.text(article.summary, 90, y + 50, { width: pageW - 105, lineGap: 1 });

    y += cardH + 8;
  });

  // ─── PRACTICAL TAKEAWAYS ───
  if (y > doc.page.height - 120) {
    doc.addPage();
    y = 50;
  }
  y += 10;
  doc.fillColor(COLORS.primary).fontSize(13).font("Helvetica-Bold");
  doc.text("▎Evidence-Based Takeaways", 45, y);
  y += 22;

  const takeaways = [
    "Sleep prioritization: new data reinforces that catch-up sleep after short nights is associated with reduced mortality risk — don't neglect recovery.",
    "Daily multivitamin: the COSMOS RCT (Nature Medicine, 2026) found ~4 months slower epigenetic aging over 2 years. Effect strongest in those with accelerated baseline aging.",
    "Exercise + AKG: alpha-ketoglutarate showed notable biological age reduction effects, especially when combined with exercise in older adults.",
    "NAD+ precursors (NMN/NR): continue to show promise in preclinical models, though human lifespan data is still limited. Consult a doctor before supplementing.",
    "Brain health: the APOE2 variant demonstrates that genetics influencing DNA repair capacity directly affects cognitive aging trajectory. Lifestyle factors that support DNA repair (exercise, sleep, polyphenols) remain the best accessible interventions.",
  ];

  takeaways.forEach((t, i) => {
    doc.fillColor(COLORS.white).fontSize(9).font("Helvetica-Bold");
    doc.text(`${i + 1}.`, 45, y, { width: 20 });
    doc.fillColor(COLORS.muted).fontSize(8.5).font("Helvetica");
    doc.text(t, 65, y, { width: pageW - 70, lineGap: 2 });
    y += 38;
  });

  // ─── FOOTER ───
  doc.fillColor(COLORS.muted).fontSize(7).font("Helvetica");
  const footerY = doc.page.height - 40;
  doc.text(
    `Longevity Intelligence Weekly  ·  ${weekStart} to ${weekEnd}  ·  Automated scan  ·  ${new Date().toISOString().split("T")[0]}`,
    45,
    footerY,
    { align: "center", width: pageW }
  );
  doc.text(
    "Sources: X/Twitter longevity community, arXiv, PubMed, Reddit r/longevity, Google News. Not medical advice.",
    45,
    footerY + 12,
    { align: "center", width: pageW }
  );

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

module.exports = { generateReport };
