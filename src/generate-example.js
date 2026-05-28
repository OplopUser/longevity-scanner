const { generateReport } = require("./pdf-generator.js");

const articles = [
  {
    title: "Nature Paper: Systems-Level Evidence for the Information Theory of Aging",
    source: "nature",
    url: "https://x.com/davidasinclair/status/2059740268237292003",
    date: "2026-05-25",
    summary: "Gladyshev lab (Harvard) analyzed ~11,000 cellular gene expression profiles and found aging involves coordinated, partially reversible epigenetic changes — not just random damage. Introduced transcriptomic clocks outperforming chronological age for mortality prediction. OSK reprogramming, young blood factors, and early embryogenesis all reversed aging transcriptional states.",
    category: "epigenetic",
    significance: "high"
  },
  {
    title: "Nasal EV Therapy Reverses Brain Aging in Mice",
    source: "journal",
    url: "https://x.com/i/status/2059667077854589153",
    date: "2026-05-26",
    summary: "Texas A&M researchers delivered microRNA-loaded extracellular vesicles nasally to aged mice. Just two doses reduced chronic neuroinflammation, restored mitochondrial function, and improved memory/recognition. Published in Journal of Extracellular Vesicles. Human translation faces delivery challenges but targets core dementia mechanisms.",
    category: "research",
    significance: "high"
  },
  {
    title: "APOE2 Longevity Gene Enhances Neuronal DNA Repair",
    source: "journal",
    url: "https://x.com/i/status/2058233545093783651",
    date: "2026-05-24",
    summary: "The rare protective APOE2 variant dramatically improves neuronal DNA repair, reduces strand breaks, and confers resistance to cellular senescence. Adding APOE2 protein to APOE4-carrying neurons reduced damage signals. Highlights genomic stability as a key mechanism for brain healthspan.",
    category: "research",
    significance: "high"
  },
  {
    title: "Retro Biosciences Hits $1.8B Valuation, Phase 1 Alzheimer's Trial Progressing",
    source: "news",
    url: "https://x.com/TimePieChina/status/2059648822117036118",
    date: "2026-05-27",
    summary: "Sam Altman-backed Retro Biosciences reached $1.8B valuation. Their Phase 1 trial targeting Alzheimer's-related mechanisms shows good safety so far, with full data expected August 2026. Represents growing investor confidence in longevity biotech.",
    category: "biotech",
    significance: "high"
  },
  {
    title: "Daewoong Pharma Acquires Turn Bio's Epigenetic Reprogramming Platform",
    source: "news",
    url: "https://x.com/davidasinclair/status/2059331247369810104",
    date: "2026-05-26",
    summary: "Major Korean pharma Daewoong acquired Turn Bio's epigenetic reprogramming technology for full-scale R&D on aging-related diseases. Signals big pharma's growing conviction that reprogramming is a platform technology, not just a niche research area.",
    category: "biotech",
    significance: "high"
  },
  {
    title: "Multivitamins Slow Epigenetic Aging — COSMOS RCT Results in Nature Medicine",
    source: "journal",
    url: "https://x.com/Rainmaker1973/status/2058155827513467265",
    date: "2026-05-23",
    summary: "The COSMOS randomized trial found daily multivitamin use modestly slowed epigenetic aging by ~4 months over 2 years as measured by DNA methylation clocks. Benefits were stronger in participants with accelerated biological aging at baseline. One of the first RCTs to show an intervention affecting an epigenetic aging clock.",
    category: "supplement",
    significance: "medium"
  },
  {
    title: "Supplements Linked to Younger Biological Age: AKG, CoQ10, NAD+ Boosters",
    source: "journal",
    url: "https://x.com/davidasinclair/status/2059336390454747445",
    date: "2026-05-26",
    summary: "Study linked alpha-ketoglutarate (AKG), carotenoids, CoQ10, curcumin, vitamin D3, and NAD+ boosters to younger biological age scores on saliva-based tests. AKG showed particularly notable effects in exercising older men. Heavy supplement use was not harmful in this cohort.",
    category: "supplement",
    significance: "medium"
  },
  {
    title: "OSK/Yamanaka Factors: Partial Reprogramming Restores Vision in Aged Mice",
    source: "research",
    url: "https://x.com/neil_xbt/status/2058541827284750487",
    date: "2026-05-24",
    summary: "Partial cellular reprogramming using Yamanaka (OSK) factors restored vision in aged mice with optic nerve damage and glaucoma. Progressing toward human trials initially for blindness, then potentially skin and brain. Researchers frame aging as an information problem with a backup copy of youthful epigenetic data.",
    category: "research",
    significance: "medium"
  },
  {
    title: "Insilico Medicine Developing AI Models for Longevity Drug Discovery",
    source: "news",
    url: "https://x.com/FirstSquawk/status/2059231990180954119",
    date: "2026-05-25",
    summary: "AI drug discovery company Insilico Medicine is building specialized AI models targeting longevity pathways. Their platform screens for compounds that modulate aging hallmarks. Represents convergence of AI and aging biology as a drug discovery strategy.",
    category: "longevity_industry",
    significance: "medium"
  },
  {
    title: "Young Blood Factors: Parabiosis Studies Continue to Inspire New Therapies",
    source: "research",
    url: "https://x.com/LxngevityLab/status/2057842292325745035",
    date: "2026-05-22",
    summary: "Renewed interest in heterochronic parabiosis: old mice paired with young show neurogenesis, improved memory, new blood vessels, reduced inflammation, better mitochondria, and lifespan benefits. Researchers are working to identify specific circulating factors to develop drug-based alternatives to plasma transfer.",
    category: "research",
    significance: "medium"
  },
  {
    title: "Economic Case: Slowing Aging by 10% Worth ~$1 Trillion Annually",
    source: "news",
    url: "https://x.com/grok/status/2057651873461485917",
    date: "2026-05-22",
    summary: "ARK Invest analysis: slowing aging by even 10% could generate nearly $1 trillion in annual US economic value through improved healthspan and compressed morbidity. The economic case for longevity investment now dwarfs many traditional drug markets.",
    category: "longevity_industry",
    significance: "medium"
  },
  {
    title: "Catch-Up Sleep Associated with Reduced Mortality Risk",
    source: "research",
    url: "https://x.com/neil_xbt/status/2058541827284750487",
    date: "2026-05-24",
    summary: "New data reinforces that catch-up sleep after periods of short sleep is associated with reduced all-cause mortality risk. Emphasizes that sleep recovery matters — not just average sleep duration. Practical implications for shift workers and those with irregular schedules.",
    category: "research",
    significance: "low"
  }
];

generateReport(articles, "2026-05-22", "2026-05-28")
  .then(filepath => console.log("PDF:", filepath))
  .catch(err => { console.error(err); process.exit(1); });
