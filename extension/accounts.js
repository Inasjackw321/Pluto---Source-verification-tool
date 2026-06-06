// trust: 0–100 (higher = more reliable / independent)
// blocked: true → content hidden behind overlay by default

const PLUTO_CATEGORIES = {
  "state-propaganda": {
    label: "State Propaganda",
    color: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#d97706",
    dotColor: "#d97706",
    icon: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8.5 7L9.5 11L6 9L2.5 11L3.5 7L1 4.5H4.5L6 1Z" fill="currentColor"/></svg>`,
    textIcon: "★"
  },
  "state-funded": {
    label: "State-Funded Media",
    color: "#92400e",
    bgColor: "#fef3c7",
    borderColor: "#b45309",
    dotColor: "#b45309",
    icon: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M6 3v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    textIcon: "◉"
  },
  "misinformation": {
    label: "Unverified Claims",
    color: "#991b1b",
    bgColor: "#fef2f2",
    borderColor: "#ef4444",
    dotColor: "#ef4444",
    icon: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 10H1L6 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M6 5v2.5M6 9v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    textIcon: "▲"
  },
  "conspiracy": {
    label: "Conspiracy / Fringe",
    color: "#6d28d9",
    bgColor: "#f5f3ff",
    borderColor: "#8b5cf6",
    dotColor: "#8b5cf6",
    icon: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2" fill="currentColor"/><path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.6 2.6l.7.7M8.7 8.7l.7.7M2.6 9.4l.7-.7M8.7 3.3l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    textIcon: "✕"
  },
  "satire": {
    label: "Satire",
    color: "#1d4ed8",
    bgColor: "#eff6ff",
    borderColor: "#3b82f6",
    dotColor: "#3b82f6",
    icon: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 9c0-3.3 2.7-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 9c0-3.3-2.7-6-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><circle cx="6" cy="10" r="1" fill="currentColor"/></svg>`,
    textIcon: "ꙅ"
  }
};

const PLUTO_ACCOUNTS = [

  // ═══ RUSSIAN STATE PROPAGANDA (blocked by default) ════════════════════════

  {
    handle: "RT_com", label: "Russian State Media", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT (Russia Today) is funded by the Russian federal budget. Registered as a foreign agent in the US. Banned from broadcasting in the UK and EU since the 2022 invasion of Ukraine.",
    source: "Ofcom 2022 · EU Reg. 2022/350 · FARA"
  },
  {
    handle: "RTenEspanol", label: "Russian State Media (ES)", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT en Español — Spanish-language arm of RT. Identical ownership and editorial control.",
    source: "EU Reg. 2022/879 · FARA"
  },
  {
    handle: "RT_Arabic", label: "Russian State Media (AR)", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT Arabic targets Middle East and North Africa audiences with Russian state messaging.",
    source: "EU Reg. 2022/879 · RSF"
  },
  {
    handle: "RT_DE", label: "Russian State Media (DE)", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT DE — German-language channel. YouTube terminated it in 2021 for COVID misinformation. EU-banned since 2022.",
    source: "EU Reg. 2022/350"
  },
  {
    handle: "SptnkNE", label: "Sputnik", category: "state-propaganda",
    blocked: true, trust: 5, country: "RU",
    detail: "Sputnik is owned by Rossiya Segodnya, a Russian state media holding. Registered as a foreign agent in the US. All EU distribution suspended March 2022.",
    source: "EU Reg. 2022/350 · FARA · Twitter state-media label"
  },
  {
    handle: "SputnikInt", label: "Sputnik International", category: "state-propaganda",
    blocked: true, trust: 5, country: "RU",
    detail: "Sputnik International — secondary Sputnik English account. Same entity as SptnkNE.",
    source: "EU Reg. 2022/350"
  },
  {
    handle: "SputnikAfrica", label: "Sputnik Africa", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "Part of Russia's documented information operations across Africa. Part of Rossiya Segodnya.",
    source: "EU Reg. 2022/879 · Stanford Internet Observatory"
  },

  // ═══ RUSSIAN STATE (warned, not blocked) ══════════════════════════════════

  {
    handle: "tass_agency", label: "TASS (Russia)", category: "state-propaganda",
    blocked: false, trust: 18, country: "RU",
    detail: "TASS is Russia's official state news agency, operating under a government-approved charter. War coverage follows Kremlin directives.",
    source: "TASS Federal Charter · Twitter state-media label"
  },
  {
    handle: "RiaNovsoti", label: "RIA Novosti", category: "state-propaganda",
    blocked: false, trust: 14, country: "RU",
    detail: "RIA Novosti is owned by Rossiya Segodnya. EU banned its EU-territory distribution in February 2022.",
    source: "EU Reg. 2022/350"
  },
  {
    handle: "KremlinRussia_E", label: "Kremlin (Russia)", category: "state-propaganda",
    blocked: false, trust: 20, country: "RU",
    detail: "Official Kremlin press service. Statements are direct Russian government communications — primary source, but represents official state narrative.",
    source: "kremlin.ru"
  },
  {
    handle: "MFA_Russia", label: "Russian Foreign Ministry", category: "state-propaganda",
    blocked: false, trust: 18, country: "RU",
    detail: "Russia's Ministry of Foreign Affairs regularly posts claims about Ukraine and NATO that contradict independent journalism.",
    source: "Russian MFA"
  },

  // ═══ IRANIAN STATE (blocked) ══════════════════════════════════════════════

  {
    handle: "PressTV", label: "Iranian State Media", category: "state-propaganda",
    blocked: true, trust: 6, country: "IR",
    detail: "Press TV is owned by the Islamic Republic of Iran Broadcasting (IRIB), a body under the Supreme Leader. Ofcom revoked its UK licence. Produces heavily pro-regime content on Gaza, Syria, Ukraine, and Yemen.",
    source: "Ofcom 2021 · IRIB Charter"
  },
  {
    handle: "khamenei_ir", label: "Iran Supreme Leader", category: "state-propaganda",
    blocked: true, trust: 3, country: "IR",
    detail: "Official account of Ali Khamenei. Posts are direct state-directed messaging at the highest level of the Iranian government. Previously suspended by Twitter for violating world-leader policies.",
    source: "Iranian Constitution Art. 110"
  },
  {
    handle: "FarsNewsAgency", label: "IRGC-Linked Media", category: "state-propaganda",
    blocked: true, trust: 7, country: "IR",
    detail: "Fars News has documented links to the IRGC, which the US Treasury has designated as a terrorist organisation.",
    source: "US Treasury IRGC designation · CPJ"
  },

  // ═══ IRANIAN STATE (warned) ═══════════════════════════════════════════════

  {
    handle: "TasnimNews", label: "IRGC-Linked Media", category: "state-propaganda",
    blocked: false, trust: 12, country: "IR",
    detail: "Tasnim News Agency has documented ties to the IRGC Quds Force. Covers Middle East conflicts from an Iranian proxy-network perspective.",
    source: "Bellingcat · Middle East Eye"
  },
  {
    handle: "IRNA_en", label: "Iranian State Agency", category: "state-propaganda",
    blocked: false, trust: 20, country: "IR",
    detail: "IRNA is Iran's official state news agency, operating under the Ministry of Culture and Islamic Guidance.",
    source: "IRNA Charter"
  },
  {
    handle: "Iran_GOV", label: "Iranian Government", category: "state-propaganda",
    blocked: false, trust: 15, country: "IR",
    detail: "Official Iranian government account. Messaging on regional conflicts reflects Islamic Republic strategic communications.",
    source: "Islamic Republic of Iran"
  },

  // ═══ CHINESE STATE MEDIA ══════════════════════════════════════════════════

  {
    handle: "CGTNOfficial", label: "Chinese State Media", category: "state-propaganda",
    blocked: false, trust: 22, country: "CN",
    detail: "CGTN is a branch of CCTV under direct CCP authority. Ofcom revoked its UK licence in 2021. Twitter labelled it state-affiliated media.",
    source: "Ofcom 2021 · NPC China · Twitter state-media label"
  },
  {
    handle: "CGTN_America", label: "Chinese State Media (US)", category: "state-propaganda",
    blocked: false, trust: 22, country: "CN",
    detail: "CGTN America — US bureau of China Global Television Network, registered as a foreign agent under FARA.",
    source: "FARA registration"
  },
  {
    handle: "XinhuaNewsEN", label: "Chinese State Agency", category: "state-propaganda",
    blocked: false, trust: 25, country: "CN",
    detail: "Xinhua is the PRC's official state news agency under the State Council. US officials have described it as both a news outlet and intelligence-gathering operation.",
    source: "Chinese State Council · Twitter state-media label"
  },
  {
    handle: "PDChina", label: "CCP Official Newspaper", category: "state-propaganda",
    blocked: false, trust: 18, country: "CN",
    detail: "People's Daily is the official newspaper of the CCP Central Committee. Coverage directly reflects party policy on Taiwan, Ukraine, and territorial disputes.",
    source: "CCP Central Committee"
  },
  {
    handle: "globaltimesnews", label: "CCP Nationalist Media", category: "state-propaganda",
    blocked: false, trust: 15, country: "CN",
    detail: "Global Times (People's Daily subsidiary) is known for aggressive nationalist coverage. Oxford Internet Institute identified it as one of the world's most active state-media Twitter accounts.",
    source: "Oxford Internet Institute 2020 · MERICS"
  },
  {
    handle: "CCTVNews", label: "Chinese State Broadcaster", category: "state-propaganda",
    blocked: false, trust: 22, country: "CN",
    detail: "CCTV News — parent broadcaster of CGTN. Directly controlled by the CCP's Propaganda Department.",
    source: "State Administration of Radio and Television (China)"
  },

  // ═══ OTHER STATE PROPAGANDA ════════════════════════════════════════════════

  {
    handle: "teleSURtv", label: "Venezuelan State Media", category: "state-propaganda",
    blocked: false, trust: 20, country: "VE",
    detail: "teleSUR is majority-owned by the Venezuelan government (CONATEL), with stakes held by Cuba, Nicaragua, and Bolivia.",
    source: "teleSUR shareholder structure · CONATEL"
  },

  // ═══ STATE-FUNDED (editorial independence varies) ══════════════════════════

  {
    handle: "AJEnglish", label: "Qatari-Funded Media", category: "state-funded",
    blocked: false, trust: 52, country: "QA",
    detail: "Al Jazeera is funded by Qatar's royal family through the AJMN. While it covers stories ignored by Western media, its coverage of Qatar's allies/adversaries reflects Qatari foreign policy interests.",
    source: "AJMN Charter · Freedom House 2023"
  },
  {
    handle: "TRTWorld", label: "Turkish State Broadcaster", category: "state-funded",
    blocked: false, trust: 44, country: "TR",
    detail: "TRT World is a subsidiary of Turkey's state broadcaster TRT. Coverage on Kurdish groups, Syria, and the Caucasus often aligns with Ankara's positions.",
    source: "TRT Act No. 2954 · RSF"
  },
  {
    handle: "AnadoluAgency", label: "Turkish State Agency", category: "state-funded",
    blocked: false, trust: 46, country: "TR",
    detail: "Anadolu Agency is majority-owned by the Turkish government. Its conflict coverage reflects Turkish government positions, especially on Syria.",
    source: "AA shareholder structure"
  },
  {
    handle: "MEE_Palestine", label: "Qatar-Linked Media", category: "state-funded",
    blocked: false, trust: 40, country: "QA",
    detail: "Middle East Eye receives funding from sources linked to Qatar. Covers conflicts in a way sympathetic to Muslim Brotherhood-affiliated movements. Banned in Egypt and UAE.",
    source: "Reuters funding investigation 2020"
  },

  // ═══ MISINFORMATION ═══════════════════════════════════════════════════════

  {
    handle: "DiscloseTv", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 20,
    detail: "Regularly posts unverified breaking news — especially during conflicts — without primary sources. Claims have been debunked by Reuters, AFP, and Bellingcat. Frequently amplified by Russian state media.",
    source: "Reuters fact-checks · Bellingcat"
  },
  {
    handle: "Warmonitors", label: "Unverified War Claims", category: "misinformation",
    blocked: false, trust: 22,
    detail: "Aggregates OSINT footage and casualty claims from conflict zones with no verification. No corrections record. Content has been reused by Russian state media.",
    source: "Bellingcat OSINT review"
  },
  {
    handle: "sentdefender", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 28,
    detail: "SentinelDefender posts frequent military/conflict updates with varying accuracy. Disputed claims about Ukraine, Israel/Gaza, and Taiwan without subsequent corrections.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "OAN", label: "Low Reliability News", category: "misinformation",
    blocked: false, trust: 18,
    detail: "One America News Network. Rated Red by NewsGuard. Dropped by AT&T and DirecTV for misinformation. Repeatedly debunked by Reuters and AP.",
    source: "NewsGuard Red rating · Reuters fact-checks"
  },
  {
    handle: "TheChiefNerd", label: "Unverified Health / War Claims", category: "misinformation",
    blocked: false, trust: 24,
    detail: "Aggregates medical and conflict claims without peer-review or source verification. Posts labelled misleading by Community Notes.",
    source: "Community Notes (Twitter)"
  },

  // ═══ CONSPIRACY / FRINGE ══════════════════════════════════════════════════

  {
    handle: "RealAlexJones", label: "Conspiracy / InfoWars", category: "conspiracy",
    blocked: false, trust: 5,
    detail: "Alex Jones was found liable for defamation by US courts for spreading false claims about the Sandy Hook massacre. Regularly promotes conspiracy theories about conflicts and governments.",
    source: "US Federal Court – Jones v. Pozner (2022)"
  },
  {
    handle: "NaturalNews", label: "Health / War Disinfo", category: "conspiracy",
    blocked: false, trust: 4,
    detail: "Banned from Facebook, YouTube, and Pinterest for health misinformation. Also promotes conspiracy theories about geopolitical events.",
    source: "NewsGuard Red · CCDH report"
  },
  {
    handle: "EpochTimes", label: "Influence Network", category: "conspiracy",
    blocked: false, trust: 16,
    detail: "Linked to Falun Gong. Identified by EU DisinfoLab and Oxford Internet Institute as a coordinated inauthentic influence network. Rated Red by NewsGuard.",
    source: "EU DisinfoLab 2019 · Oxford Internet Institute · NewsGuard"
  },

  // ═══ RUSSIAN / PRO-RUSSIA INFLUENCERS ════════════════════════════════════

  {
    handle: "jacksonhinklle", label: "Pro-Russia Influencer", category: "conspiracy",
    blocked: false, trust: 8,
    detail: "Consistently amplifies Russian state narratives on Ukraine, Gaza, and US politics. Content reposted by RT and Sputnik. Multiple posts labelled misleading by Community Notes.",
    source: "Community Notes · NewsGuard · Bellingcat 2023"
  },
  {
    handle: "mylordbebo", label: "Pro-Russia Influencer", category: "conspiracy",
    blocked: false, trust: 10,
    detail: "Lord Bebo amplifies Russian state media talking points on Ukraine, Gaza, and Western governments. Content routinely mirrors RT and Sputnik framing with no independent sourcing.",
    source: "Community Notes · EU DisinfoLab"
  },
  {
    handle: "megatron_ron", label: "Pro-Russia Influencer", category: "conspiracy",
    blocked: false, trust: 10,
    detail: "Megatron promotes pro-Russian narratives on Ukraine and the Middle East. Content cited by Russian state media. Posts labelled misleading by Community Notes.",
    source: "Community Notes · Bellingcat"
  },

  // ═══ IRANIAN INFLUENCE OPERATIONS ════════════════════════════════════════

  {
    handle: "iranobserver0", label: "Iran-Linked Account", category: "state-propaganda",
    blocked: false, trust: 12, country: "IR",
    detail: "Account promotes Iranian state narratives on regional conflicts and opposes US/Israeli policy. Content pattern consistent with IRGC-linked influence operations.",
    source: "Community Notes · Stanford Internet Observatory"
  },
  {
    handle: "m_mahdibaba", label: "Iranian State-Linked", category: "state-propaganda",
    blocked: false, trust: 14, country: "IR",
    detail: "Posts content aligned with Iranian state media narratives on geopolitical conflicts. Amplifies IRGC-linked media sources.",
    source: "Community Notes (Twitter)"
  },

  // ═══ CHINESE STATE MEDIA (additional handles) ════════════════════════════

  {
    handle: "cgtneurope", label: "Chinese State Media (EU)", category: "state-propaganda",
    blocked: false, trust: 22, country: "CN",
    detail: "CGTN Europe — EU bureau of China Global Television Network, controlled by the CCP's Propaganda Department. Continues operating after Ofcom revoked CGTN's UK broadcast licence in 2021.",
    source: "Ofcom 2021 · EU DisinfoLab"
  },
  {
    handle: "cgtnamerica", label: "Chinese State Media (US)", category: "state-propaganda",
    blocked: false, trust: 22, country: "CN",
    detail: "CGTN America — US bureau of China Global Television Network. Registered as a foreign agent under FARA. Identical editorial oversight as CGTNOfficial.",
    source: "FARA registration 2019"
  },

  // ═══ MULTI-STATE / BLOC PROPAGANDA ═══════════════════════════════════════

  {
    handle: "bricsinfo", label: "Bloc Propaganda", category: "state-propaganda",
    blocked: false, trust: 15,
    detail: "Promotes BRICS messaging that frequently amplifies Russian, Chinese, and Iranian state narratives on sanctions, the Ukraine war, and Western institutions.",
    source: "EU DisinfoLab · Community Notes"
  },

  // ═══ UNVERIFIED WAR / OSINT ACCOUNTS ═════════════════════════════════════

  {
    handle: "osintwarfare", label: "Unverified War Intel", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Posts military intelligence and conflict claims without source verification. Content frequently amplified by state media before independent confirmation.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "rnintel", label: "Unverified Intel Claims", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Posts conflict and intelligence claims from open sources. Accuracy varies significantly. No editorial standards or corrections policy.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "menchosint", label: "Unverified OSINT", category: "misinformation",
    blocked: false, trust: 32,
    detail: "OSINT aggregator posting conflict updates without verification. Content shared widely before accuracy can be confirmed.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "terror_alarm", label: "Unverified Terror Claims", category: "misinformation",
    blocked: false, trust: 25,
    detail: "Posts terror alerts and security incident claims, often before official confirmation. Has published false and retracted alerts. No corrections record.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "dd_geopolitics", label: "Unverified Geopolitics", category: "misinformation",
    blocked: false, trust: 26,
    detail: "Posts geopolitical and military updates citing unverified sources. Content frequently amplified by Russian and Iranian state media.",
    source: "Community Notes · Bellingcat"
  },
  {
    handle: "aq701", label: "Unverified Military Claims", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Posts military and conflict claims from open sources without verification. Content has been amplified by state media actors.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "royalintel_", label: "Unverified Intel Claims", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Posts geopolitical and intelligence claims without verifiable sources. Presents itself as an authoritative intelligence source without traceable credentials.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "middle_east_spectator", label: "Unverified ME Claims", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Posts Middle East conflict updates without consistent source verification. Has spread unconfirmed casualty figures and battle claims.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "secretsqrl123", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 25,
    detail: "Posts geopolitical and intelligence claims without verifiable sourcing.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "mossadil", label: "Unverified Intel Claims", category: "misinformation",
    blocked: false, trust: 20,
    detail: "Posts intelligence and security claims about the Middle East and Israel without verifiable sourcing. Presents content as authoritative intelligence leaks.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "firstsquawk", label: "Unverified Breaking News", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Rapid-fire breaking news alerts, often posted before information can be verified. Some alerts have required subsequent retraction.",
    source: "Community Notes (Twitter)"
  },

  // ═══ PARTISAN COMMENTATORS ════════════════════════════════════════════════

  {
    handle: "benshapiro", label: "Partisan Commentary", category: "misinformation",
    blocked: false, trust: 35,
    detail: "The Daily Wire, co-founded by Shapiro, is rated low factual reporting by MBFC. Posts regularly contain misleading framing on LGBTQ+ issues, climate, and elections.",
    source: "Media Bias/Fact Check · PolitiFact · Community Notes"
  },
  {
    handle: "timcast", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 22,
    detail: "Tim Pool regularly posts political claims without source verification. Multiple posts have been labelled misleading by Community Notes. Has spread election fraud narratives.",
    source: "Community Notes · NewsGuard"
  },
  {
    handle: "libsoftiktok", label: "Targeted Misinformation", category: "misinformation",
    blocked: false, trust: 18,
    detail: "Libs of TikTok has repeatedly doxed educators and healthcare workers, leading to documented harassment campaigns. Multiple temporary suspensions across platforms.",
    source: "Washington Post investigation 2022 · CCDH report"
  },
  {
    handle: "cobratate", label: "Conspiracy / Fringe", category: "conspiracy",
    blocked: false, trust: 12,
    detail: "Andrew Tate spreads misogynistic narratives and conspiracy theories. Banned from YouTube, Facebook, Instagram, and TikTok. Posts frequently receive Community Notes corrections.",
    source: "Community Notes · CCDH report 2022"
  },
  {
    handle: "gunthereagleman", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 20,
    detail: "Posts political and health claims that frequently lack sourcing. Multiple posts have received Community Notes corrections for factual inaccuracies.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "elonmusk", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Frequently posts unverified claims and political misinformation. Multiple posts have received Community Notes corrections. As owner of X, posts receive outsized algorithmic amplification.",
    source: "Community Notes · PolitiFact · AP Fact Check"
  },

  // ═══ ALTERNATIVE / ADVOCACY MEDIA ════════════════════════════════════════

  {
    handle: "dropsitenews", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Publishes leaked documents and conflict claims without consistent editorial verification. Some content has been disputed by subsequent mainstream reporting.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "euromaidanpr", label: "Ukrainian Nationalist Media", category: "state-propaganda",
    blocked: false, trust: 30, country: "UA",
    detail: "EuroMaidan PR promotes exclusively pro-Ukrainian government narratives. All Russian sources treated as false and Ukrainian government claims as fact, without independent verification.",
    source: "EU DisinfoLab · Bellingcat media audit"
  },
  {
    handle: "in2thinair", label: "Conspiracy / Fringe", category: "conspiracy",
    blocked: false, trust: 10,
    detail: "Posts conspiracy theories about governments, vaccines, the New World Order, and geopolitical events without credible sourcing.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "uk_rept", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 25,
    detail: "Posts UK and European political commentary without consistent source verification. Claims disputed by mainstream fact-checkers.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "gbpolitcs", label: "Unverified Claims", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Posts UK political commentary and news claims. Multiple posts labelled misleading by Community Notes for factual inaccuracies.",
    source: "Community Notes (Twitter)"
  },
  {
    handle: "nyprepper1", label: "Conspiracy / Fringe", category: "conspiracy",
    blocked: false, trust: 15,
    detail: "Posts prepper and conspiracy content including unverified claims about government crises, collapse scenarios, and false flag events.",
    source: "Community Notes (Twitter)"
  },

  // ═══ SATIRE ═══════════════════════════════════════════════════════════════

  {
    handle: "TheOnion", label: "Satire", category: "satire",
    blocked: false, trust: 100,
    detail: "The Onion is a long-running satirical publication. All content is intentionally fictional. Flagged only to prevent viral spread during breaking news.",
    source: "The Onion, Inc."
  },
  {
    handle: "TheBabylonBee", label: "Satire", category: "satire",
    blocked: false, trust: 100,
    detail: "The Babylon Bee is a conservative satirical publication. Fictional content. Snopes and Meta have reviewed headlines that went viral as real news.",
    source: "Snopes · Meta misinformation reviews"
  },
  {
    handle: "ClickHole", label: "Satire", category: "satire",
    blocked: false, trust: 100,
    detail: "ClickHole (Onion subsidiary) parodies viral content. Intentionally absurd — not factual.",
    source: "The Onion, Inc."
  },
  {
    handle: "ThePoke", label: "Satire", category: "satire",
    blocked: false, trust: 100,
    detail: "The Poke is a British satirical website. Content is not factual news.",
    source: "ThePoke.co.uk"
  },
  {
    handle: "WaterfordWhispers", label: "Satire", category: "satire",
    blocked: false, trust: 100,
    detail: "Irish satirical site. Several headlines were shared as real news in Eastern European media ecosystems during the Ukraine conflict.",
    source: "EU vs Disinformation"
  }
];
