#!/usr/bin/env node
/**
 * Longevity Weekly Report Generator
 * Aggregates the past 7 days of daily scans and generates a PDF report.
 * Run: node src/weekly-report.js
 */

const fs = require("fs");
const path = require("path");
const { generateReport } = require("./pdf-generator.js");

const DATA_DIR = path.join(__dirname, "..", "data", "daily");

function getPastWeekDates() {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function loadDailyScans(dates) {
  const allArticles = [];
  for (const date of dates) {
    const filepath = path.join(DATA_DIR, `${date}.json`);
    if (fs.existsSync(filepath)) {
      try {
        const articles = JSON.parse(fs.readFileSync(filepath, "utf-8"));
        allArticles.push(...articles);
      } catch (e) {
        console.error(`Error reading ${date}.json:`, e.message);
      }
    }
  }
  return allArticles;
}

function deduplicate(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = a.title.substring(0, 80).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const dates = getPastWeekDates();
  const weekStart = dates[0];
  const weekEnd = dates[dates.length - 1];

  console.log(`\n📊 Generating weekly report: ${weekStart} → ${weekEnd}`);

  let articles = loadDailyScans(dates);

  // If no daily scans exist, use hardcoded fallback (for first run)
  if (articles.length === 0) {
    console.log("  No daily scans found — using fallback data.");
    articles = require("./fallback-articles.json");
  } else {
    articles = deduplicate(articles);
    // Sort by significance
    const sigOrder = { high: 0, medium: 1, low: 2 };
    articles.sort((a, b) => sigOrder[a.significance] - sigOrder[b.significance]);
  }

  console.log(`  Articles: ${articles.length}`);
  console.log(`  High impact: ${articles.filter((a) => a.significance === "high").length}`);

  const filepath = await generateReport(articles, weekStart, weekEnd);
  console.log(`  PDF saved: ${filepath}\n`);
  return filepath;
}

main().catch(console.error);
