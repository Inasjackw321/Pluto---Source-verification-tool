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

  // ═══ RUSSIAN OFFICIALS & DIPLOMATIC ══════════════════════════════════════

  {
    handle: "MedvedevRussiaE", label: "Russian Security Council", category: "state-propaganda",
    blocked: false, trust: 8, country: "RU",
    detail: "Dmitry Medvedev, Deputy Chairman of Russia's Security Council. Known for nuclear threats and extreme anti-Western posts used in state information operations.",
    source: "Kremlin Security Council · Reuters"
  },
  {
    handle: "zakharova_mfa", label: "Russian MFA Spokesperson", category: "state-propaganda",
    blocked: false, trust: 12, country: "RU",
    detail: "Maria Zakharova is the official spokesperson for Russia's Ministry of Foreign Affairs. A primary source of Russian government disinformation narratives on Ukraine and NATO.",
    source: "Russian MFA"
  },
  {
    handle: "nebenzya", label: "Russian UN Ambassador", category: "state-propaganda",
    blocked: false, trust: 14, country: "RU",
    detail: "Vasily Nebenzya is Russia's Permanent Representative to the UN. Regularly uses UN platforms and social media to spread Kremlin narratives on Ukraine.",
    source: "UN Security Council records"
  },
  {
    handle: "Depoluyan", label: "Russian Deputy UN Envoy", category: "state-propaganda",
    blocked: false, trust: 14, country: "RU",
    detail: "Dmitry Polyansky, Russia's Deputy Permanent Representative to the UN. Active amplifier of Russian MFA narratives on Western social media.",
    source: "UN records"
  },
  {
    handle: "solovievlive", label: "Russian State TV Host", category: "state-propaganda",
    blocked: false, trust: 5, country: "RU",
    detail: "Vladimir Solovyov hosts flagship shows on Russia-1 and Rossiya-24 (state TV). Sanctioned by the EU, UK, and US for spreading war propaganda. Owns property in Italy under sanctions.",
    source: "EU sanctions list · UK FCDO · OFAC"
  },
  {
    handle: "RT_FR", label: "Russian State Media (FR)", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT en Français — French-language arm of RT. Banned from broadcasting in EU since March 2022 under EU Reg. 2022/350.",
    source: "EU Reg. 2022/350"
  },
  {
    handle: "vesti_ru", label: "Russian State TV News", category: "state-propaganda",
    blocked: false, trust: 12, country: "RU",
    detail: "Vesti.ru is the digital news arm of Rossiya-1, a Russian state television channel directly controlled by VGTRK (All-Russia State Television). War coverage follows Kremlin directives.",
    source: "VGTRK charter · RSF"
  },
  {
    handle: "pravdaoficial", label: "Pravda (Russia)", category: "state-propaganda",
    blocked: false, trust: 10, country: "RU",
    detail: "Pravda is the historic mouthpiece of Russian state power. Remained closely aligned with the Kremlin and the Communist Party throughout post-Soviet transitions.",
    source: "RSF · Communist Party of Russia affiliation"
  },
  {
    handle: "RussEmbFrance", label: "Russian Embassy (France)", category: "state-propaganda",
    blocked: false, trust: 15, country: "RU",
    detail: "Official Russian Embassy in France account. Part of Russia's coordinated diplomatic information operation across European social media.",
    source: "EU Information Manipulation report 2022"
  },
  {
    handle: "RusEmbassyGer", label: "Russian Embassy (Germany)", category: "state-propaganda",
    blocked: false, trust: 15, country: "RU",
    detail: "Official Russian Embassy in Germany. Regularly posts disinformation narratives targeting German-speaking audiences.",
    source: "BfV German domestic intelligence · EU EUvsDisinfo"
  },

  // ═══ CHINESE STATE OFFICIALS ═════════════════════════════════════════════

  {
    handle: "ZhaoLijian", label: "Chinese MFA (Former)", category: "state-propaganda",
    blocked: false, trust: 10, country: "CN",
    detail: "Zhao Lijian is a former Chinese MFA spokesperson who pioneered aggressive 'wolf warrior' diplomacy on Twitter. Known for spreading debunked conspiracy theories including Fort Detrick COVID claims.",
    source: "RAND Corporation · Twitter state-media label"
  },
  {
    handle: "LiuPengyu", label: "Chinese Embassy Spokesperson", category: "state-propaganda",
    blocked: false, trust: 14, country: "CN",
    detail: "Liu Pengyu is the spokesperson for China's Embassy in Washington, DC. Prominent amplifier of Chinese government narratives denying Xinjiang abuses and promoting Belt and Road.",
    source: "Chinese Embassy Washington"
  },
  {
    handle: "CGTNDocumentary", label: "Chinese State Media", category: "state-propaganda",
    blocked: false, trust: 18, country: "CN",
    detail: "CGTN Documentary — documentary division of CGTN, China's state international broadcaster. Produces propaganda-style documentaries on Tibet, Xinjiang, and Taiwan.",
    source: "Ofcom CGTN licence revocation 2021"
  },
  {
    handle: "ChinaEmbassy_AU", label: "Chinese Embassy (Australia)", category: "state-propaganda",
    blocked: false, trust: 16, country: "CN",
    detail: "Official Chinese Embassy in Australia. Involved in documented influence operations targeting Chinese-Australian communities.",
    source: "ASPI China Influence report"
  },
  {
    handle: "ChinaEmbFrance", label: "Chinese Embassy (France)", category: "state-propaganda",
    blocked: false, trust: 16, country: "CN",
    detail: "Chinese Embassy in France. Published disputed claims about Taiwan, Xinjiang, and COVID origins.",
    source: "French SGDSN · Reuters"
  },
  {
    handle: "ChinaXinhuaEN", label: "Xinhua (China)", category: "state-propaganda",
    blocked: false, trust: 20, country: "CN",
    detail: "Xinhua News Agency English — additional Xinhua account. State-run agency with over 10,000 domestic and overseas staff. All foreign coverage subject to Party censorship.",
    source: "CPJ · RSF"
  },

  // ═══ SAUDI / GULF STATE MEDIA ════════════════════════════════════════════

  {
    handle: "AlArabiya", label: "Saudi-Funded Media", category: "state-funded",
    blocked: false, trust: 42, country: "SA",
    detail: "Al Arabiya is owned by MBC Group, controlled by Saudi-linked investors with close ties to the Saudi royal family. Coverage of Yemen and Iran closely tracks Saudi state positions.",
    source: "Gulf Media Journal · CPJ"
  },
  {
    handle: "AlArabiyaEng", label: "Saudi-Funded Media (EN)", category: "state-funded",
    blocked: false, trust: 42, country: "SA",
    detail: "Al Arabiya English — same ownership as Al Arabiya. English-language arm targeting Western audiences.",
    source: "MBC Group shareholder structure"
  },
  {
    handle: "skynewsarabia", label: "UAE-Funded Media", category: "state-funded",
    blocked: false, trust: 44, country: "AE",
    detail: "Sky News Arabia is a joint venture between Sky Group and Abu Dhabi Media Investment Corporation (UAE government-linked). Coverage of Qatar, Iran, and Turkey reflects UAE government positions.",
    source: "ADMIC ownership · Middle East Eye"
  },

  // ═══ VENEZUELAN / BOLIVARIAN ══════════════════════════════════════════════

  {
    handle: "teleSUR", label: "Venezuelan State TV", category: "state-propaganda",
    blocked: false, trust: 14, country: "VE",
    detail: "TeleSUR is majority-owned by the Venezuelan government with partial stakes from Cuba, Bolivia, and Nicaragua. Produces anti-US content aligned with the Bolivarian Alliance narrative.",
    source: "TeleSUR shareholder documents"
  },
  {
    handle: "CorreodelOrinoco", label: "Venezuelan State Press", category: "state-propaganda",
    blocked: false, trust: 10, country: "VE",
    detail: "Correo del Orinoco is an official Venezuelan government newspaper, founded by Hugo Chavez in 2009. Covers the Maduro government without editorial independence.",
    source: "Venezuelan Government Press"
  },
  {
    handle: "AVN_Agencia", label: "Venezuelan State News", category: "state-propaganda",
    blocked: false, trust: 12, country: "VE",
    detail: "Agencia Venezolana de Noticias (AVN) is Venezuela's official state news agency. All content represents Venezuelan government communications.",
    source: "Venezuelan Ministry of Communication"
  },

  // ═══ MORE IRAN-ALIGNED ════════════════════════════════════════════════════

  {
    handle: "Iran_Diplomacy", label: "Iranian Diplomatic Network", category: "state-propaganda",
    blocked: false, trust: 15, country: "IR",
    detail: "Iranian government-linked diplomatic account. Posts align with Iranian MFA narratives on nuclear negotiations, US sanctions, and regional conflicts.",
    source: "Iranian MOFA"
  },

  // ═══ PRO-KREMLIN WESTERN VOICES ═══════════════════════════════════════════

  {
    handle: "BenjaminNorton", label: "Pro-Russia/China Analyst", category: "misinformation",
    blocked: false, trust: 20,
    detail: "Ben Norton (Multipolarista) produces analysis that consistently amplifies Russian and Chinese state narratives while dismissing Western institutions. Content widely cited by RT and CGTN.",
    source: "Hamilton68 · FIMI Watch"
  },
  {
    handle: "Multipolarista", label: "Pro-Russia/China Media", category: "misinformation",
    blocked: false, trust: 18,
    detail: "Multipolarista is Ben Norton's publication. Consistently promotes Russian and Chinese government narratives on Ukraine, Taiwan, and Western sanctions.",
    source: "DFRLab · Hamilton 2.0"
  },
  {
    handle: "PatrickLancaster", label: "Pro-Kremlin Reporter", category: "misinformation",
    blocked: false, trust: 15, country: "RU",
    detail: "Patrick Lancaster is a UK-born journalist operating from Russian-controlled areas of Ukraine. Content exclusively presents Russian military perspectives without independent verification.",
    source: "Bellingcat · BBC Verify"
  },
  {
    handle: "eva_bartlett", label: "Pro-Kremlin Reporter", category: "misinformation",
    blocked: false, trust: 14,
    detail: "Eva Bartlett is a Canadian blogger whose work claiming Syrian hospital attacks were staged has been debunked by Reuters, Snopes, and the UN. Widely cited by Russian state media.",
    source: "Reuters fact-check · Snopes · The Guardian"
  },

  // ═══ MISINFORMATION / BAD SOURCE ══════════════════════════════════════════

  {
    handle: "BreitbartNews", label: "Far-Right Outlet", category: "misinformation",
    blocked: false, trust: 22,
    detail: "Breitbart News receives a red rating from NewsGuard for repeatedly publishing false or misleading content. Multiple stories retracted after legal action or debunking.",
    source: "NewsGuard Red rating · AP fact-checks"
  },
  {
    handle: "TheGatewayPundit", label: "Habitual Misinformation", category: "misinformation",
    blocked: false, trust: 8,
    detail: "The Gateway Pundit has been documented spreading false stories about elections, shootings, and COVID. Rated as one of the most prolific sources of online misinformation by the Stanford Internet Observatory.",
    source: "Stanford Internet Observatory · NewsGuard Red · Reuters"
  },
  {
    handle: "ZeroHedge", label: "Financial Disinformation", category: "misinformation",
    blocked: false, trust: 24,
    detail: "Zero Hedge published under a fake Bulgarian author name. The EU DisinfoLab and US intelligence found it amplifies Russian state narratives. Banned from Twitter in 2020, reinstated under new ownership.",
    source: "EU DisinfoLab · Bloomberg investigation · DNI report"
  },
  {
    handle: "Newsmax", label: "Low Reliability News", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Newsmax reached a settlement with Dominion Voting Systems related to false 2020 election fraud claims. Multiple anchors resigned over editorial pressure to spread false narratives.",
    source: "Dominion settlement · AP · CPJ"
  },
  {
    handle: "NewsmaxTV", label: "Low Reliability News", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Newsmax TV — broadcast arm of Newsmax. Settled with Dominion Voting Systems for claims related to 2020 election misinformation.",
    source: "Dominion settlement · Newsguard"
  },
  {
    handle: "PragerU", label: "Misleading Education Content", category: "misinformation",
    blocked: false, trust: 30,
    detail: "PragerU videos have been rated inaccurate on climate change, history, and economics by AFP Fact Check, Politifact, and academic reviewers. Not an accredited university despite the name.",
    source: "AFP Fact Check · Politifact · California Dept of Education"
  },
  {
    handle: "JackPosobiec", label: "Habitual Misinformation", category: "misinformation",
    blocked: false, trust: 12,
    detail: "Jack Posobiec spread the debunked Seth Rich conspiracy theory and multiple false stories about Comet Ping Pong (Pizzagate). Verified as spreading Russian disinformation by the Senate Intelligence Committee.",
    source: "Senate Intel Report Vol. 2 · Reuters · AP"
  },
  {
    handle: "LauraLoomer", label: "Extreme Misinformation", category: "misinformation",
    blocked: false, trust: 10,
    detail: "Laura Loomer has been banned from Twitter, Facebook, PayPal, Uber, Lyft, GoFundMe, and other platforms for spreading false and hateful content. Promoted multiple debunked conspiracy theories.",
    source: "NewsGuard · AP fact-checks"
  },
  {
    handle: "RebelNewsOnline", label: "Far-Right Outlet", category: "misinformation",
    blocked: false, trust: 26, country: "CA",
    detail: "Rebel News is a Canadian far-right outlet rated Red by NewsGuard. Has spread false claims about COVID vaccines, elections, and immigration with minimal correction rate.",
    source: "NewsGuard Red rating · Canadian Press"
  },
  {
    handle: "EzraLevant", label: "Far-Right Media Founder", category: "misinformation",
    blocked: false, trust: 22, country: "CA",
    detail: "Ezra Levant founded Rebel News and has repeatedly published content found defamatory or inaccurate by Canadian courts. Promotes anti-Muslim and anti-immigration conspiracy narratives.",
    source: "NewsGuard · Canadian court records"
  },
  {
    handle: "ThePostMillennial", label: "Far-Right Outlet", category: "misinformation",
    blocked: false, trust: 28, country: "CA",
    detail: "The Post Millennial is a Canadian right-wing outlet with a history of publishing misleading stories. Connected to American Conservative Union and Republican Party fundraising networks.",
    source: "NewsGuard · Canadian Anti-Hate Network"
  },
  {
    handle: "BlazeTV", label: "Partisan Commentary", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Blaze TV is Glenn Beck's media network. Has spread false claims about COVID vaccines, elections, and climate change. NewsGuard rates it orange for multiple violations.",
    source: "NewsGuard · AP fact-checks"
  },
  {
    handle: "GlennBeck", label: "Conspiracy / Disinformation", category: "misinformation",
    blocked: false, trust: 22,
    detail: "Glenn Beck promoted multiple debunked conspiracy theories including Obama birther claims, Soros conspiracies, and false COVID vaccine claims. Lost Fox News contract over extremist content.",
    source: "PolitiFact · AP · Media Matters"
  },
  {
    handle: "marklevinshow", label: "Partisan Disinformation", category: "misinformation",
    blocked: false, trust: 28,
    detail: "Mark Levin has spread false claims about election fraud, COVID vaccines, and the January 6 investigation. Cited by multiple fact-checkers for repeated inaccuracies.",
    source: "PolitiFact · FactCheck.org"
  },
  {
    handle: "JamesOKeefeIII", label: "Deceptive Journalism", category: "misinformation",
    blocked: false, trust: 14,
    detail: "James O'Keefe's videos have been found deceptively edited in multiple investigations. Courts found Project Veritas liable for defamation in separate actions. Removed from his own organisation in 2023.",
    source: "AP · NYT investigation · Court records"
  },
  {
    handle: "Project_Veritas", label: "Deceptive Journalism", category: "misinformation",
    blocked: false, trust: 12,
    detail: "Project Veritas produces sting operations using deceptive editing. Multiple news organisations have found footage selectively cut to misrepresent subjects. Court defamation judgements.",
    source: "AP · WaPo investigations · Court records"
  },
  {
    handle: "RealCandaceO", label: "Partisan Misinformation", category: "misinformation",
    blocked: false, trust: 24,
    detail: "Candace Owens spread debunked claims about COVID vaccines and 2020 election fraud. Multiple posts flagged by Twitter/Meta community notes for inaccuracy.",
    source: "PolitiFact · Reuters fact-checks"
  },
  {
    handle: "CharlieKirk11", label: "Partisan Misinformation", category: "misinformation",
    blocked: false, trust: 26,
    detail: "Charlie Kirk (Turning Point USA) repeatedly spreads false claims about immigration statistics, election fraud, and campus policies. Documented by PolitiFact with multiple 'False' ratings.",
    source: "PolitiFact · FactCheck.org"
  },
  {
    handle: "TomiLahren", label: "Partisan Commentary", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Tomi Lahren has spread false claims about crime statistics, immigration, and COVID. Content regularly receives Community Notes corrections.",
    source: "PolitiFact · AP fact-checks"
  },
  {
    handle: "dbongino", label: "Conspiracy / Disinformation", category: "misinformation",
    blocked: false, trust: 20,
    detail: "Dan Bongino repeatedly amplified false 2020 election fraud claims, COVID vaccine conspiracy theories, and deep state narratives. Parler owner known for coordinating with far-right networks.",
    source: "PolitiFact · FactCheck.org · AP"
  },
  {
    handle: "MattWalshBlog", label: "Extreme Disinformation", category: "misinformation",
    blocked: false, trust: 24,
    detail: "Matt Walsh (Daily Wire) has spread false information about trans healthcare, suicide statistics, and crime. PolitiFact and Reuters have fact-checked multiple false claims.",
    source: "PolitiFact · Reuters fact-checks"
  },
  {
    handle: "WNDNews", label: "Habitual Misinformation", category: "misinformation",
    blocked: false, trust: 10,
    detail: "WorldNetDaily (WND) receives a Red rating from NewsGuard for repeatedly publishing false or misleading claims. One of the first outlets to promote birther conspiracy theories about Obama.",
    source: "NewsGuard Red · PolitiFact · FactCheck.org"
  },
  {
    handle: "DailyCaller", label: "Low Reliability News", category: "misinformation",
    blocked: false, trust: 30,
    detail: "The Daily Caller has published multiple stories rated false by PolitiFact and FactCheck.org. Tucker Carlson co-founded it; editors have been linked to white nationalist publications.",
    source: "PolitiFact · Media Bias/Fact Check"
  },
  {
    handle: "townhallcom", label: "Partisan Outlet", category: "misinformation",
    blocked: false, trust: 30,
    detail: "Townhall.com is a conservative commentary website that has published articles rated false by multiple fact-checkers on immigration, crime, and COVID topics.",
    source: "PolitiFact · AFP fact-checks"
  },
  {
    handle: "PJMedia", label: "Partisan Outlet", category: "misinformation",
    blocked: false, trust: 28,
    detail: "PJ Media (formerly Pajamas Media) publishes commentary and reporting that regularly fails fact-checks. Media Bias/Fact Check rates it low for factual reporting.",
    source: "Media Bias/Fact Check · PolitiFact"
  },
  {
    handle: "AmericanThinker", label: "Partisan Outlet", category: "misinformation",
    blocked: false, trust: 26,
    detail: "American Thinker has published content that later required retractions, including false claims about Dominion Voting Systems. NewsGuard rates it red.",
    source: "NewsGuard Red · Dominion retraction"
  },
  {
    handle: "TheBlaze", label: "Partisan Disinformation", category: "misinformation",
    blocked: false, trust: 28,
    detail: "The Blaze (Glenn Beck media) has spread multiple false narratives about elections, COVID, and government overreach. Media Bias/Fact Check rates it low credibility.",
    source: "NewsGuard · Media Bias/Fact Check"
  },

  // ═══ GLOBAL STATE MEDIA ═══════════════════════════════════════════════════

  {
    handle: "DDNewsLive", label: "Indian State Media", category: "state-funded",
    blocked: false, trust: 50, country: "IN",
    detail: "Doordarshan News (DD News) is India's public state broadcaster, under Prasar Bharati (statutory body). Coverage favours government positions, especially on Pakistan, China, and domestic politics.",
    source: "Prasar Bharati Act 1990 · RSF India press freedom index"
  },
  {
    handle: "FanaBC", label: "Ethiopian State Media", category: "state-propaganda",
    blocked: false, trust: 20, country: "ET",
    detail: "Fana Broadcasting Corporate is majority state-owned and closely aligned with the Ethiopian government. Systematic pro-government coverage during the Tigray conflict.",
    source: "CPJ Ethiopia reports · RSF"
  },
  {
    handle: "ENA_Ethiopia", label: "Ethiopian State Agency", category: "state-propaganda",
    blocked: false, trust: 18, country: "ET",
    detail: "Ethiopian News Agency (ENA) is the official state news agency. Coverage consistently amplifies government narratives on conflicts and dissent.",
    source: "CPJ Ethiopia"
  },
  {
    handle: "VietnamPlus", label: "Vietnamese State Media", category: "state-propaganda",
    blocked: false, trust: 25, country: "VN",
    detail: "VietnamPlus is the online portal of the Vietnam News Agency (VNA), the official state news agency of the Socialist Republic of Vietnam. All editorial content is state-controlled.",
    source: "VNA Charter · RSF Vietnam press freedom index"
  },
  {
    handle: "VNA_Official", label: "Vietnamese State Agency", category: "state-propaganda",
    blocked: false, trust: 22, country: "VN",
    detail: "Vietnam News Agency (VNA) — official Vietnamese state news agency. Owned and directed by the Communist Party of Vietnam.",
    source: "VNA Charter"
  },
  {
    handle: "CubaVisionInt", label: "Cuban State TV", category: "state-propaganda",
    blocked: false, trust: 16, country: "CU",
    detail: "Cubavision Internacional is Cuba's international state television channel. All content is produced under direct Communist Party oversight.",
    source: "ICRT Cuba state media charter"
  },
  {
    handle: "NicaraguaGOBE", label: "Nicaraguan State Media", category: "state-propaganda",
    blocked: false, trust: 15, country: "NI",
    detail: "Nicaraguan government communications account. Since 2021, the Ortega government has shut down over 50 independent media outlets, making state media the primary information source.",
    source: "CPJ Nicaragua · RSF"
  },
  {
    handle: "RT_Deutsch", label: "Russian State Media (DE)", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "RT Deutsch — another German-language RT account. YouTube terminated RT DE in 2021 for COVID misinformation. EU banned RT from broadcasting in all member states in March 2022.",
    source: "EU Reg. 2022/350 · YouTube enforcement"
  },
  {
    handle: "SputnikBreaking", label: "Sputnik Breaking News", category: "state-propaganda",
    blocked: true, trust: 4, country: "RU",
    detail: "Sputnik breaking news account. Part of Rossiya Segodnya — same entity as SputnikInt and SptnkNE. Registered as foreign agent in the US.",
    source: "FARA · EU Reg. 2022/350"
  },
  {
    handle: "NKNewsOrg", label: "North Korea Monitor", category: "state-funded",
    blocked: false, trust: 58, country: "KP",
    detail: "NK News (NKNews.org) is a paid subscription service monitoring North Korea. Independent from the North Korean government — not state-controlled, but reports on NK state media outputs.",
    source: "NK News editorial policy"
  },
  {
    handle: "KCNA_Watch", label: "DPRK State Monitor", category: "state-funded",
    blocked: false, trust: 55, country: "KP",
    detail: "KCNA Watch aggregates official North Korean state media (KCNA) content for monitoring purposes. The account itself is independent but content is sourced directly from North Korean state propaganda.",
    source: "KCNA Watch editorial note"
  },
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
