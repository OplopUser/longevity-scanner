#!/usr/bin/env node
/**
 * Longevity Daily Scanner
 * Fetches the latest longevity news from multiple sources and saves to daily JSON.
 * Run: node src/daily-scan.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "daily");
const TODAY = new Date().toISOString().split("T")[0];

async function fetchRedditLongevity() {
  try {
    const res = await fetch(
      "https://www.reddit.com/r/longevity/search.json?q=news+OR+research+OR+breakthrough&sort=new&restrict_sr=on&t=week&limit=10",
      { headers: { "User-Agent": "longevity-scanner/1.0" } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.children || []).map((child) => ({
      title: child.data.title,
      source: "reddit",
      url: `https://reddit.com${child.data.permalink}`,
      date: new Date(child.data.created_utc * 1000).toISOString().split("T")[0],
      summary: child.data.selftext?.substring(0, 300) || child.data.title,
      category: guessCategory(child.data.title + " " + (child.data.selftext || "")),
      significance: child.data.score > 50 ? "medium" : "low",
      score: child.data.score,
      comments: child.data.num_comments,
    }));
  } catch (e) {
    console.error("Reddit fetch error:", e.message);
    return [];
  }
}

async function fetchArxiv() {
  try {
    const res = await fetch(
      "http://export.arxiv.org/api/query?search_query=all:longevity+OR+all:aging+OR+all:senescence+OR+all:rejuvenation+OR+all:lifespan&sortBy=submittedDate&sortOrder=descending&max_results=10"
    );
    if (!res.ok) return [];
    const text = await res.text();

    // Simple regex parsing (no XML parser dependency)
    const entries = text.split("<entry>").slice(1);
    return entries.map((entry) => {
      const title = (entry.match(/<title>(.*?)<\/title>/s)?.[1] || "").replace(/\s+/g, " ").trim();
      const summary = (entry.match(/<summary>(.*?)<\/summary>/s)?.[1] || "").replace(/\s+/g, " ").trim().substring(0, 300);
      const published = entry.match(/<published>(\d{4}-\d{2}-\d{2})/)?.[1] || TODAY;
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1] || "";
      return {
        title,
        source: "arxiv",
        url: id,
        date: published,
        summary,
        category: "research",
        significance: "medium",
      };
    });
  } catch (e) {
    console.error("arXiv fetch error:", e.message);
    return [];
  }
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/epigenetic|reprogram|yamanaka|osk|methylation/i.test(t)) return "epigenetic";
  if (/clinic|trial|phase|patient|fda/i.test(t)) return "clinical_trial";
  if (/supplement|vitamin|nmn|nr|nad|resveratrol|metformin|rapamycin|akg/i.test(t)) return "supplement";
  if (/biotech|startup|valu|fund|acquis|investor|series/i.test(t)) return "biotech";
  if (/senesc|senolytic|dasatinib|quercetin|fisetin/i.test(t)) return "senescence";
  if (/industry|conference|podcast|longevity economy/i.test(t)) return "longevity_industry";
  return "research";
}

async function main() {
  console.log(`\n🔬 Longevity Daily Scanner — ${TODAY}\n`);

  const [redditArticles, arxivArticles] = await Promise.all([
    fetchRedditLongevity(),
    fetchArxiv(),
  ]);

  const allArticles = [...redditArticles, ...arxivArticles];

  // Deduplicate by title similarity
  const seen = new Set();
  const deduped = allArticles.filter((a) => {
    const key = a.title.substring(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by significance > date
  const sigOrder = { high: 0, medium: 1, low: 2 };
  deduped.sort((a, b) => sigOrder[a.significance] - sigOrder[b.significance]);

  // Save daily file
  const filepath = path.join(DATA_DIR, `${TODAY}.json`);
  fs.writeFileSync(filepath, JSON.stringify(deduped, null, 2));

  console.log(`  Reddit: ${redditArticles.length} articles`);
  console.log(`  arXiv:  ${arxivArticles.length} papers`);
  console.log(`  Saved:  ${deduped.length} unique articles → ${filepath}`);

  // Print highlights
  const highlights = deduped.filter((a) => a.significance !== "low").slice(0, 5);
  if (highlights.length > 0) {
    console.log(`\n  Highlights:`);
    highlights.forEach((a) => {
      console.log(`  [${a.significance.toUpperCase()}] ${a.title.substring(0, 80)}`);
    });
  }
  console.log();
}

main().catch(console.error);
