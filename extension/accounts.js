// Default flagged accounts
// blocked:true → tweet content is hidden behind an overlay by default

const MEDIACHECK_DEFAULT_ACCOUNTS = [
  // ── Fully blocked (highest concern) ──────────────────────────────────────
  {
    handle: "rt_com",
    label: "Russian State Media",
    category: "state-affiliated",
    blocked: true,
    detail: "RT (formerly Russia Today) is funded by the Russian federal budget and registered as a foreign agent in the US, UK, and EU. Banned from broadcasting in the UK and EU during the 2022 Ukraine invasion.",
    source: "Foreign Agents Registration Act · Ofcom · European Commission"
  },
  {
    handle: "presstv",
    label: "Iranian State Media",
    category: "state-affiliated",
    blocked: true,
    detail: "Press TV is owned and operated by the Islamic Republic of Iran Broadcasting (IRIB), a state body under the Supreme Leader. Banned from UK and EU satellite platforms.",
    source: "Ofcom (UK) · EBU"
  },
  {
    handle: "sptnkne",
    label: "Russian State Media",
    category: "state-affiliated",
    blocked: true,
    detail: "Sputnik is a Russian state-owned international news agency and radio broadcast service. Registered as a foreign agent in multiple countries; EU distribution banned since March 2022.",
    source: "EU Regulation 2022/350 · FARA"
  },
  {
    handle: "khamenei_ir",
    label: "Iranian Supreme Leader",
    category: "state-affiliated",
    blocked: true,
    detail: "Official account of Ali Khamenei, Iran's Supreme Leader. Posts are state-directed messaging from the highest level of the Iranian government.",
    source: "Islamic Republic of Iran"
  },

  // ── Flagged (warned, not blocked) ─────────────────────────────────────────
  {
    handle: "tass_agency",
    label: "Russian State Media",
    category: "state-affiliated",
    blocked: false,
    detail: "TASS is the official Russian state news agency, directly subordinate to the Russian government. Its war coverage is subject to mandatory state directives.",
    source: "TASS charter · Russian federal law"
  },
  {
    handle: "rianovosti",
    label: "Russian State Media",
    category: "state-affiliated",
    blocked: false,
    detail: "RIA Novosti is owned by the Russian state media holding Rossiya Segodnya. Banned from broadcasting in the EU since February 2022.",
    source: "EU sanctions · Roskomnadzor"
  },
  {
    handle: "xinhua_world",
    label: "Chinese State Media",
    category: "state-affiliated",
    blocked: false,
    detail: "Xinhua News Agency is the official state news agency of the People's Republic of China, under the direct authority of the State Council.",
    source: "Chinese State Council"
  },
  {
    handle: "cgtnofficial",
    label: "Chinese State Media",
    category: "state-affiliated",
    blocked: false,
    detail: "CGTN (China Global Television Network) is a branch of China Central Television (CCTV), a Chinese state broadcaster. Ofcom revoked its UK licence in 2021.",
    source: "Ofcom Decision 2021 · NPC China"
  },
  {
    handle: "trtworld",
    label: "Turkish State Media",
    category: "state-affiliated",
    blocked: false,
    detail: "TRT World is a subsidiary of TRT, the Turkish state broadcaster funded and overseen by the Turkish government.",
    source: "TRT Charter · Turkish Radio and Television Corporation Act"
  },

  // ── Unverified / low reliability ──────────────────────────────────────────
  {
    handle: "disclosetv",
    label: "Unverified Claims",
    category: "misinformation",
    blocked: false,
    detail: "Frequently posts unverified or contested claims during breaking news events — especially around conflicts — without crediting primary sources. Content regularly removed by Twitter.",
    source: "EU DisinfoLab · NewsGuard"
  },
  {
    handle: "warmonitors",
    label: "Unverified Claims",
    category: "misinformation",
    blocked: false,
    detail: "Aggregates unverified footage and casualty claims from conflict zones. Accuracy of individual posts is disputed; no clear editorial policy.",
    source: "Self-published"
  },

  // ── Satire ────────────────────────────────────────────────────────────────
  {
    handle: "theonion",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "The Onion is a long-running satirical publication. All content is fictional and intended as comedy — not factual reporting.",
    source: "The Onion, Inc."
  },
  {
    handle: "thebabylonbee",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "The Babylon Bee is a satirical publication. Content is fictional and intended as comedy — not factual reporting.",
    source: "The Babylon Bee, LLC"
  }
];

const MEDIACHECK_CATEGORIES = {
  "state-affiliated": { color: "#b84c00", icon: "⚑", bgColor: "#fff0e0", borderColor: "#e07030" },
  "misinformation":   { color: "#b71c1c", icon: "⚠", bgColor: "#fce8e8", borderColor: "#e53935" },
  "satire":           { color: "#1a6bb5", icon: "✎", bgColor: "#e8f0fe", borderColor: "#1a6bb5" }
};
