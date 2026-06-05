// Default flagged accounts. Each entry: { handle, label, category, detail }
// 'handle' is the Twitter/X username (lowercase, no @).
// Users can add/remove accounts via the extension popup.

const MEDIACHECK_DEFAULT_ACCOUNTS = [
  // State-affiliated outlets
  {
    handle: "rt_com",
    label: "State Media",
    category: "state-affiliated",
    detail: "RT is funded by the Russian government and listed as a foreign agent in multiple countries."
  },
  {
    handle: "rt_america",
    label: "State Media",
    category: "state-affiliated",
    detail: "RT America — Russian state-funded broadcaster."
  },
  {
    handle: "xinhua_world",
    label: "State Media",
    category: "state-affiliated",
    detail: "Xinhua is the official state news agency of the People's Republic of China."
  },
  {
    handle: "cgtnofficial",
    label: "State Media",
    category: "state-affiliated",
    detail: "CGTN is a Chinese state-owned international television network."
  },
  {
    handle: "tass_agency",
    label: "State Media",
    category: "state-affiliated",
    detail: "TASS is the official Russian state news agency."
  },
  {
    handle: "rianovosti",
    label: "State Media",
    category: "state-affiliated",
    detail: "RIA Novosti is a Russian state-owned news agency."
  },
  {
    handle: "sptnkne",
    label: "State Media",
    category: "state-affiliated",
    detail: "Sputnik is a Russian state-owned international news agency."
  },
  {
    handle: "pressturkiye",
    label: "State Media",
    category: "state-affiliated",
    detail: "TRT World — Turkish state broadcaster."
  },
  {
    handle: "trtworld",
    label: "State Media",
    category: "state-affiliated",
    detail: "TRT World is funded by the Turkish government."
  },
  {
    handle: "presstv",
    label: "State Media",
    category: "state-affiliated",
    detail: "Press TV is an Iranian state-owned English-language news network."
  },
  {
    handle: "khamenei_ir",
    label: "State Official",
    category: "state-affiliated",
    detail: "Official account of Iran's Supreme Leader."
  },

  // Accounts with documented misinformation flags
  {
    handle: "disclosetv",
    label: "Unverified Claims",
    category: "misinformation",
    detail: "Frequently posts unverified or contested war-related claims without sourcing."
  },
  {
    handle: "warmonitors",
    label: "Unverified Claims",
    category: "misinformation",
    detail: "Aggregates unverified footage and claims; accuracy rate is contested."
  },

  // Satire / parody (to reduce confusion during breaking news)
  {
    handle: "theonion",
    label: "Satire",
    category: "satire",
    detail: "The Onion is a satirical publication. Content is not factual news."
  },
  {
    handle: "thebabylonbee",
    label: "Satire",
    category: "satire",
    detail: "The Babylon Bee is a satirical publication. Content is not factual news."
  }
];

// Category metadata: badge colour and icon character
const MEDIACHECK_CATEGORIES = {
  "state-affiliated": { color: "#e05c00", icon: "⚑", bgColor: "#fff3e0" },
  "misinformation":   { color: "#c62828", icon: "⚠", bgColor: "#ffebee" },
  "satire":           { color: "#1565c0", icon: "﹫", bgColor: "#e3f2fd" }
};
