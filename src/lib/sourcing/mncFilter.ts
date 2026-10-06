export interface TargetingEvaluation {
  isExcluded: boolean;
  category: "SMB" | "RISING_BUSINESS" | "MNC_EXCLUDED";
  reason?: string;
}

const MNC_KEYWORDS = [
  "google", "microsoft", "amazon", "apple", "facebook", "meta", "ibm", "oracle",
  "accenture", "infosys", "tcs", "wipro", "cognizant", "salesforce", "adobe",
  "sap", "cisco", "intel", "nvidia", "deloitte", "pwc", "kpmg", "ey", "mckinsey",
  "goldman", "jpmorgan", "bankofamerica", "walmart", "disney", "netflix", "nike",
  "boeing", "tesla", "ford", "shell", "pfizer", "samsung", "sony", "toyota", "honda"
];

const MNC_NAME_TERMS = [
  "corporation", "multinational", "conglomerate", "enterprise group",
  "global holdings", "group holdings", "international corp", "fortune 500"
];

const EXCLUDED_TLDS = [".gov", ".mil", ".edu"];

export function evaluateLeadTargeting(domain: string, companyName?: string): TargetingEvaluation {
  const normalizedDomain = domain.toLowerCase().trim();
  const normalizedName = (companyName || "").toLowerCase().trim();

  // 1. TLD Check
  if (EXCLUDED_TLDS.some((tld) => normalizedDomain.endsWith(tld))) {
    return {
      isExcluded: true,
      category: "MNC_EXCLUDED",
      reason: "Government, Military, or Educational Institution (Excluded from outreach)",
    };
  }

  // 2. Known MNC Brand Keyword Match
  const matchedMncKeyword = MNC_KEYWORDS.find((keyword) => normalizedDomain.includes(keyword));
  if (matchedMncKeyword) {
    return {
      isExcluded: true,
      category: "MNC_EXCLUDED",
      reason: `Domain matched enterprise MNC keyword '${matchedMncKeyword}'`,
    };
  }

  // 3. Company Name Corporate Term Match
  const matchedNameTerm = MNC_NAME_TERMS.find((term) => normalizedName.includes(term));
  if (matchedNameTerm) {
    return {
      isExcluded: true,
      category: "MNC_EXCLUDED",
      reason: `Company name indicates enterprise conglomerate structure ('${matchedNameTerm}')`,
    };
  }

  // 4. Rising Business vs SMB heuristic
  const isRising = normalizedDomain.includes("tech") || normalizedDomain.includes("io") || normalizedDomain.includes("ai") || normalizedDomain.includes("app");
  
  return {
    isExcluded: false,
    category: isRising ? "RISING_BUSINESS" : "SMB",
  };
}
