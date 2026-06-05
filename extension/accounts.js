// ── Category definitions ────────────────────────────────────────────────────
// blocked:true  → tweet content blurred behind overlay by default
// blocked:false → badge + profile banner only

const MEDIACHECK_CATEGORIES = {
  "state-propaganda": {
    label: "State Propaganda",
    color: "#a83200",
    bgColor: "#fff1e6",
    borderColor: "#d95c1a",
    icon: "⚑",
    description: "Government-controlled outlet with no editorial independence. Content reflects official state narrative."
  },
  "state-funded": {
    label: "State-Funded Media",
    color: "#7a4800",
    bgColor: "#fff8ed",
    borderColor: "#c47a20",
    icon: "◈",
    description: "Funded by a government but may have some editorial independence. Coverage can reflect funder's interests."
  },
  "misinformation": {
    label: "Unverified Claims",
    color: "#b71c1c",
    bgColor: "#fce8e8",
    borderColor: "#e53935",
    icon: "⚠",
    description: "Frequently posts unverified, misleading, or false information, particularly during conflict."
  },
  "conspiracy": {
    label: "Conspiracy / Fringe",
    color: "#6a0dad",
    bgColor: "#f3e8ff",
    borderColor: "#9c27b0",
    icon: "✕",
    description: "Regularly promotes conspiracy theories, pseudoscience, or fringe narratives."
  },
  "satire": {
    label: "Satire",
    color: "#1a6bb5",
    bgColor: "#e8f0fe",
    borderColor: "#1a6bb5",
    icon: "✎",
    description: "Satirical publication. Content is fictional and not factual news."
  }
};

// ── Flagged accounts ─────────────────────────────────────────────────────────

const MEDIACHECK_DEFAULT_ACCOUNTS = [

  // ══ RUSSIAN STATE MEDIA (blocked) ══════════════════════════════════════════

  {
    handle: "RT_com",
    label: "Russian State Media",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "RT (Russia Today) is funded by the Russian federal budget and operates under Russian state editorial control. Registered as a foreign agent in the US. Banned from broadcasting in the UK (Ofcom) and EU since March 2022 following the invasion of Ukraine. Twitter labelled it state-affiliated media.",
    source: "Ofcom 2022 · EU Regulation 2022/350 · FARA"
  },
  {
    handle: "RTenEspanol",
    label: "Russian State Media (ES)",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "RT en Español — Spanish-language arm of RT. Same ownership structure and editorial control as RT English.",
    source: "EU Regulation 2022/879 · FARA"
  },
  {
    handle: "RT_Arabic",
    label: "Russian State Media (AR)",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "RT Arabic — Arabic-language arm of RT, targeting Middle East and North Africa audiences with Russian state messaging.",
    source: "EU Regulation 2022/879 · RSF"
  },
  {
    handle: "RT_DE",
    label: "Russian State Media (DE)",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "RT DE — German-language RT channel. Its YouTube channel was terminated in 2021 for COVID misinformation. Banned from EU satellite carriage since 2022.",
    source: "EU Regulation 2022/350"
  },
  {
    handle: "SptnkNE",
    label: "Russian State Media",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "Sputnik is owned by Rossiya Segodnya, a Russian state media conglomerate. Registered as a foreign agent in the US. EU suspended all Sputnik distribution channels in March 2022.",
    source: "EU Regulation 2022/350 · FARA · Twitter state-media label"
  },
  {
    handle: "SputnikInt",
    label: "Russian State Media",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "Sputnik International — additional Sputnik English account. Same ownership as SptnkNE; EU-banned since 2022.",
    source: "EU Regulation 2022/350"
  },
  {
    handle: "SputnikAfrica",
    label: "Russian State Media (Africa)",
    category: "state-propaganda",
    blocked: true,
    country: "RU",
    detail: "Sputnik Africa — Rossiya Segodnya's Africa-focused outlet, part of Russia's documented information-operations on the continent.",
    source: "EU Regulation 2022/879 · Stanford Internet Observatory"
  },

  // ══ RUSSIAN STATE MEDIA (warned) ═══════════════════════════════════════════

  {
    handle: "tass_agency",
    label: "Russian State Agency",
    category: "state-propaganda",
    blocked: false,
    country: "RU",
    detail: "TASS is the official Russian state news agency, operating under a government-approved charter. War coverage follows Kremlin directives. Twitter labelled it state-affiliated media.",
    source: "TASS Federal Charter · Twitter state-media label"
  },
  {
    handle: "RiaNovsoti",
    label: "Russian State Media",
    category: "state-propaganda",
    blocked: false,
    country: "RU",
    detail: "RIA Novosti is owned by Rossiya Segodnya. EU banned its EU-territory distribution in February 2022. Twitter labelled it state-affiliated media.",
    source: "EU Regulation 2022/350"
  },

  // ══ IRANIAN STATE MEDIA (blocked) ══════════════════════════════════════════

  {
    handle: "PressTV",
    label: "Iranian State Media",
    category: "state-propaganda",
    blocked: true,
    country: "IR",
    detail: "Press TV is owned and operated by Islamic Republic of Iran Broadcasting (IRIB), a state body under the Supreme Leader. Ofcom revoked its UK licence in 2012 and 2021. Broadcasts heavily pro-regime content on conflicts in Gaza, Syria, Ukraine, and Yemen.",
    source: "Ofcom 2021 · IRIB Charter"
  },
  {
    handle: "khamenei_ir",
    label: "Iranian Supreme Leader",
    category: "state-propaganda",
    blocked: true,
    country: "IR",
    detail: "Official account of Ali Khamenei, Iran's Supreme Leader. Posts are direct state-directed messaging — war coverage reflects Iranian government's strategic interests. Account was suspended by Twitter in 2021 for violating rules on world leaders.",
    source: "Iranian Constitution Art. 110"
  },
  {
    handle: "FarsNewsAgency",
    label: "IRGC-Linked Media",
    category: "state-propaganda",
    blocked: true,
    country: "IR",
    detail: "Fars News Agency has documented links to the Islamic Revolutionary Guard Corps (IRGC). US Treasury designated IRGC a terrorist organisation; Fars is considered its semi-official outlet.",
    source: "US Treasury IRGC designation · CPJ"
  },
  {
    handle: "TasnimNews",
    label: "IRGC-Linked Media",
    category: "state-propaganda",
    blocked: false,
    country: "IR",
    detail: "Tasnim News Agency has documented ties to the IRGC Quds Force. Coverage of Middle East conflicts reflects Iranian proxy-network interests.",
    source: "Bellingcat · Middle East Eye"
  },
  {
    handle: "IRNA_en",
    label: "Iranian State Agency",
    category: "state-propaganda",
    blocked: false,
    country: "IR",
    detail: "Islamic Republic News Agency (IRNA) is Iran's official state news agency, operating under the Ministry of Culture and Islamic Guidance.",
    source: "IRNA Charter"
  },

  // ══ CHINESE STATE MEDIA ═════════════════════════════════════════════════════

  {
    handle: "CGTNOfficial",
    label: "Chinese State Media",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "CGTN is a branch of CCTV, China's state broadcaster under the direct authority of the Chinese Communist Party. Ofcom revoked its UK licence in 2021. Twitter labelled it state-affiliated media.",
    source: "Ofcom 2021 · NPC China · Twitter state-media label"
  },
  {
    handle: "CGTN_America",
    label: "Chinese State Media (US)",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "CGTN America — US arm of China Global Television Network, registered as a foreign agent. Registered under FARA by CCTV's US representatives.",
    source: "FARA registration"
  },
  {
    handle: "XinhuaNewsEN",
    label: "Chinese State Agency",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "Xinhua News Agency is the official state news agency of the PRC, operating under the State Council. It is both a news outlet and an intelligence-gathering operation according to US officials.",
    source: "Chinese State Council · Twitter state-media label"
  },
  {
    handle: "PDChina",
    label: "CCP Official Media",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "People's Daily is the official newspaper of the Chinese Communist Party Central Committee. Coverage directly reflects CCP policy positions, particularly on Taiwan, Ukraine, and territorial disputes.",
    source: "CCP Central Committee"
  },
  {
    handle: "globaltimesnews",
    label: "CCP Nationalist Media",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "Global Times is a tabloid subsidiary of People's Daily, known for nationalist and aggressive coverage. Oxford Internet Institute identified it as one of the world's most active state-media accounts.",
    source: "Oxford Internet Institute 2020 · MERICS"
  },
  {
    handle: "CCTVNews",
    label: "Chinese State Broadcaster",
    category: "state-propaganda",
    blocked: false,
    country: "CN",
    detail: "CCTV News is China Central Television's international channel — the parent broadcaster of CGTN. Directly controlled by the Chinese Communist Party's Propaganda Department.",
    source: "State Administration of Radio and Television (China)"
  },

  // ══ OTHER STATE MEDIA ═══════════════════════════════════════════════════════

  {
    handle: "teleSURtv",
    label: "Venezuelan State Media",
    category: "state-propaganda",
    blocked: false,
    country: "VE",
    detail: "teleSUR is majority-owned by the Venezuelan government (CONATEL) with stakes held by Cuba, Nicaragua, and Bolivia. Coverage of Latin America conflicts reflects the Bolivarian axis's official positions.",
    source: "teleSUR shareholder structure · CONATEL"
  },
  {
    handle: "AJEnglish",
    label: "Qatari State-Funded Media",
    category: "state-funded",
    blocked: false,
    country: "QA",
    detail: "Al Jazeera is funded by the Qatari government through the Al Jazeera Media Network. While it has editorial independence on many topics, coverage of Qatar's allies and adversaries (Saudi Arabia, Egypt, Israel/Gaza) can reflect Qatari foreign policy interests.",
    source: "Al Jazeera Media Network Charter · Freedom House"
  },
  {
    handle: "TRTWorld",
    label: "Turkish State Broadcaster",
    category: "state-funded",
    blocked: false,
    country: "TR",
    detail: "TRT World is a subsidiary of TRT (Türkiye Radyo ve Televizyon Kurumu), Turkey's public broadcaster funded by the state. Coverage often aligns with Turkish government positions on Kurdish groups, Syria, and the Caucasus.",
    source: "TRT Act No. 2954 · RSF"
  },
  {
    handle: "AnadoluAgency",
    label: "Turkish State Agency",
    category: "state-funded",
    blocked: false,
    country: "TR",
    detail: "Anadolu Agency (AA) is Turkey's official state news agency, majority-owned by the Turkish government. Its conflict coverage, particularly on Syria and the Kurdish question, reflects Ankara's positions.",
    source: "AA shareholder structure"
  },
  {
    handle: "MEE_Palestine",
    label: "Qatar-Linked Media",
    category: "state-funded",
    blocked: false,
    country: "QA",
    detail: "Middle East Eye receives funding from sources linked to Qatar. Covers Middle East conflicts with a focus sympathetic to Muslim Brotherhood-affiliated movements. Banned from Egypt and UAE.",
    source: "Reuters funding investigation 2020"
  },
  {
    handle: "KremlinRussia_E",
    label: "Russian Presidential Office",
    category: "state-propaganda",
    blocked: false,
    country: "RU",
    detail: "Official account of the Kremlin (Russian Presidential Press Service). Statements are direct Russian government communications — primary source but reflects official state narrative on conflicts.",
    source: "Kremlin.ru"
  },
  {
    handle: "MFA_Russia",
    label: "Russian Foreign Ministry",
    category: "state-propaganda",
    blocked: false,
    country: "RU",
    detail: "Official account of Russia's Ministry of Foreign Affairs. Regularly posts claims about Ukraine, NATO, and Western sanctions that contradict independent journalism.",
    source: "Russian MFA"
  },
  {
    handle: "Iran_GOV",
    label: "Iranian Government",
    category: "state-propaganda",
    blocked: false,
    country: "IR",
    detail: "Official account of the Iranian government. Messaging on regional conflicts (Gaza, Yemen, Syria) reflects Islamic Republic strategic communications.",
    source: "Islamic Republic of Iran"
  },

  // ══ MISINFORMATION / UNVERIFIED ════════════════════════════════════════════

  {
    handle: "DiscloseTv",
    label: "Unverified Claims",
    category: "misinformation",
    blocked: false,
    detail: "DiscloseTv regularly posts unverified breaking news, especially during conflicts, without attributing primary sources. Tweets have been debunked by Reuters, AFP, and Bellingcat on multiple occasions. Frequently amplified by state media.",
    source: "Reuters fact-checks · Bellingcat"
  },
  {
    handle: "Warmonitors",
    label: "Unverified War Claims",
    category: "misinformation",
    blocked: false,
    detail: "Warmonitors aggregates OSINT footage and casualty claims from conflict zones without verification. No editorial policy, no corrections record. Content from this account has been used in Russian state media.",
    source: "Bellingcat OSINT review"
  },
  {
    handle: "sentdefender",
    label: "Unverified Claims",
    category: "misinformation",
    blocked: false,
    detail: "SentinelDefender posts frequent military/conflict updates with varying accuracy. Has posted disputed claims about Ukraine, Israel/Gaza and Taiwan without subsequent corrections.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "RealAlexJones",
    label: "Conspiracy / Misinformation",
    category: "conspiracy",
    blocked: false,
    detail: "Alex Jones, founder of InfoWars, was found liable for defamation by US courts for spreading false claims about the Sandy Hook massacre. Regularly promotes conspiracy theories about conflicts, governments, and public health.",
    source: "US Federal Court – Jones v. Pozner (2022)"
  },
  {
    handle: "NaturalNews",
    label: "Health / War Disinformation",
    category: "conspiracy",
    blocked: false,
    detail: "Natural News (Mike Adams) has been banned from Facebook, YouTube, and Pinterest for spreading health misinformation. Also promotes conspiracy theories about geopolitical events and military conflicts.",
    source: "NewsGuard rating: Red · CCDH report"
  },
  {
    handle: "TheChiefNerd",
    label: "Unverified Health/War Claims",
    category: "misinformation",
    blocked: false,
    detail: "Frequently aggregates medical and conflict claims without peer-review or source verification. Posts have been labelled misleading by Community Notes.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "EpochTimes",
    label: "CCP-Linked Fringe Media",
    category: "conspiracy",
    blocked: false,
    detail: "The Epoch Times is linked to Falun Gong and has been identified by the EU DisinfoLab and Oxford Internet Institute as a coordinated inauthentic influence network. NewsGuard rates it Red for misinformation.",
    source: "EU DisinfoLab 2019 · Oxford Internet Institute · NewsGuard"
  },
  {
    handle: "OAN",
    label: "Fringe / Low Reliability",
    category: "misinformation",
    blocked: false,
    detail: "One America News Network. NewsGuard rates it Red; AT&T and DirecTV dropped it citing misinformation. Reuters and AP fact-checkers have repeatedly debunked OAN claims.",
    source: "NewsGuard Red · Reuters fact-checks"
  },

  // ══ SATIRE ══════════════════════════════════════════════════════════════════

  {
    handle: "TheOnion",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "The Onion is a long-running American satirical publication. All content is fictional and intended as comedy. Regularly confused for real news during conflicts and elections.",
    source: "The Onion, Inc."
  },
  {
    handle: "TheBabylonBee",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "The Babylon Bee is a conservative American satirical publication. Content is fictional. Has been fact-checked by Snopes and others after viral spread of headlines during news events.",
    source: "Snopes · Meta misinformation reviews"
  },
  {
    handle: "ClickHole",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "ClickHole is a satirical site parodying viral content. Affiliated with The Onion. Headlines are intentionally absurd and non-factual.",
    source: "The Onion, Inc."
  },
  {
    handle: "ThePoke",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "The Poke is a British satirical website. Content is not factual news.",
    source: "ThePoke.co.uk"
  },
  {
    handle: "WaterfordWhispers",
    label: "Satire",
    category: "satire",
    blocked: false,
    detail: "Waterford Whispers News is an Irish satirical publication. During the Ukraine conflict, several headlines were shared as real news in Eastern European media ecosystems.",
    source: "EU vs Disinformation"
  }
];
