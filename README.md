# Longevity Intelligence Scanner

Automated daily scanner and weekly PDF report generator for longevity science news.

## What It Does

- **Daily scan** — fetches the latest longevity research from Reddit r/longevity, arXiv preprints, and news sources
- **Weekly PDF report** — aggregates 7 days of scans into a professionally formatted PDF with executive summary, categorized breakthroughs, and evidence-based takeaways
- **Automated delivery** — cron jobs handle daily collection and weekly report generation

## Architecture

```
longevity-scanner/
├── src/
│   ├── daily-scan.js        # Fetches Reddit + arXiv daily
│   ├── weekly-report.js     # Aggregates week → PDF
│   ├── pdf-generator.js     # PDF generation (pdfkit)
│   └── generate-example.js  # One-off example generator
├── data/daily/              # Daily JSON scan files
├── reports/                 # Generated PDF reports
├── .env.example             # Configuration template
└── README.md
```

## Data Sources

| Source | Method | Frequency |
|--------|--------|-----------|
| Reddit r/longevity | JSON API (no auth) | Daily |
| arXiv | OAI-PMH API (no auth) | Daily |

## Setup

```bash
npm install
cp .env.example .env
```

## Usage

```bash
# Run daily scan
node src/daily-scan.js

# Generate weekly report
node src/weekly-report.js

# Generate example with pre-loaded data
node src/generate-example.js
```

## Cron Automation

Daily scan at 08:00 UTC + weekly report every Monday at 09:00 UTC.

## Categories Tracked

- 🧬 Epigenetic reprogramming
- 🧪 Clinical trials
- 💊 Supplements & compounds
- 🏭 Biotech industry
- 🧠 Senescence & senolytics
- 📈 Longevity industry

Not medical advice. For informational purposes only.
