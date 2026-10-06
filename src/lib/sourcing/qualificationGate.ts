export interface QualificationResult {
  qualified: boolean;
  score: number;
  rejectionReason?: string;
  verifiedFlaws: string[];
}

export function evaluateLeadServiceNeed(flawsSummary: string[] = []): QualificationResult {
  const verifiedFlaws = flawsSummary.filter((f) => f && f.length > 5);

  if (verifiedFlaws.length === 0) {
    return {
      qualified: false,
      score: 0,
      verifiedFlaws: [],
      rejectionReason: "No actionable UI/UX or technical defects identified during site scraping",
    };
  }

  let score = verifiedFlaws.length * 25;

  // Higher weights for critical conversion & deliverability blockers
  if (verifiedFlaws.some((f) => f.toLowerCase().includes("mobile") || f.toLowerCase().includes("viewport"))) {
    score += 20;
  }
  if (verifiedFlaws.some((f) => f.toLowerCase().includes("cta") || f.toLowerCase().includes("hero"))) {
    score += 20;
  }
  if (verifiedFlaws.some((f) => f.toLowerCase().includes("ssl") || f.toLowerCase().includes("seo"))) {
    score += 15;
  }

  const finalScore = Math.min(score, 100);

  // Minimum threshold of 40 points required to pass qualification gate
  if (finalScore < 40) {
    return {
      qualified: false,
      score: finalScore,
      verifiedFlaws,
      rejectionReason: `Qualification score (${finalScore}/100) below minimum threshold of 40 points`,
    };
  }

  return {
    qualified: true,
    score: finalScore,
    verifiedFlaws,
  };
}
