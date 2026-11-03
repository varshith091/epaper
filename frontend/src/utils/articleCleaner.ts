export interface CleanedArticle {
  headline: string;
  content: string;
  category: string;
  sentiment: "Positive" | "Neutral" | "Critical";
  entities: string[];
}

export function detectArticleCategory(
  text: string,
  currentCategory?: string
): string {
  const lower = text.toLowerCase();

  let sportsScore = 0;
  let businessScore = 0;
  let politicsScore = 0;

  // Sports keywords
  const sportsRegexes = [
    /\b(cricket|football|olympics|badminton|hockey|tennis|fifa|ipl|golf|tournament|championship)\b/g,
    /\b(wicket|inning|batsman|bowler|striker|goalkeeper|athlete|medalist|trophy|match score|premier league|world cup)\b/g,
  ];
  for (const r of sportsRegexes) {
    const matches = lower.match(r);
    if (matches) sportsScore += matches.length * 3;
  }

  // Business keywords
  const businessRegexes = [
    /\b(investment|investments|shares|stocks|market|sensex|nifty|rupee|inflation|gdp|rbi|revenue|profit|deficit|dividend|valuation)\b/g,
    /\b(company|companies|corporate|firm|firms|subsidiary|subsidiaries|tender|tenders|bid|procurement|power sector|energy|trade|industry|economic|economy|business|commercial|manufacturer|finance ministry)\b/g,
  ];
  for (const r of businessRegexes) {
    const matches = lower.match(r);
    if (matches) businessScore += matches.length * 3;
  }

  // Politics keywords
  const politicsRegexes = [
    /\b(parliament|lok sabha|rajya sabha|election|electoral|voter|voters|bjp|congress|aap|supreme court|high court|chief minister|prime minister|governor|mla|mp|constituency)\b/g,
    /\b(cabinet|policy|order|notification|bill|legislation|political party|poll|civic body|assembly)\b/g,
  ];
  for (const r of politicsRegexes) {
    const matches = lower.match(r);
    if (matches) politicsScore += matches.length * 2;
  }

  if (businessScore > sportsScore && businessScore >= politicsScore && businessScore > 0) {
    return "Business";
  }
  if (politicsScore > sportsScore && politicsScore > businessScore && politicsScore > 0) {
    return "Politics";
  }
  if (sportsScore > businessScore && sportsScore >= politicsScore && sportsScore > 0) {
    return "Sports";
  }

  if (
    currentCategory &&
    currentCategory.toUpperCase() !== "GENERAL" &&
    currentCategory.toUpperCase() !== "ALL"
  ) {
    return currentCategory;
  }

  return "General";
}

export function extractEntities(text: string): string[] {
  const lower = text.toLowerCase();
  const entities: string[] = [];

  const entityRules: [RegExp, string][] = [
    [/\b(finance\s+ministry|procurement\s+policy)\b/i, "#FinanceMinistry"],
    [/\b(supreme\s+court|apex\s+court)\b/i, "#SupremeCourt"],
    [/\b(high\s+court)\b/i, "#HighCourt"],
    [/\b(rbi|reserve\s+bank)\b/i, "#RBI"],
    [/\b(election\s+commission|electoral\s+roll|voters)\b/i, "#ElectionCommission"],
    [/\b(power\s+ministry|power\s+sector)\b/i, "#PowerSector"],
    [/\b(dpiit|promotion\s+of\s+industry)\b/i, "#DPIIT"],
    [/\b(chinese|china)\b/i, "#ChinaTrade"],
    [/\b(parliament|lok\s+sabha|rajya\s+sabha)\b/i, "#Parliament"],
    [/\b(isro|space)\b/i, "#ISRO"],
    [/\b(stock\s+market|sensex|nifty)\b/i, "#StockMarket"],
    [/\b(bjp)\b/i, "#BJP"],
    [/\b(congress)\b/i, "#Congress"],
    [/\b(delhi|new\s+delhi)\b/i, "#Delhi"],
    [/\b(tbea|nanjing\s+electric)\b/i, "#PowerEquipment"],
    [/\b(exemption|relaxation\s+order)\b/i, "#PolicyUpdate"],
    [/\b(cricket|bcci|ipl)\b/i, "#CricketIndia"],
  ];

  for (const [regex, tag] of entityRules) {
    if (regex.test(lower) && !entities.includes(tag)) {
      entities.push(tag);
      if (entities.length >= 3) break;
    }
  }

  if (entities.length === 0) {
    entities.push("#TopStory");
  }

  return entities;
}

export function detectSentiment(text: string): "Positive" | "Neutral" | "Critical" {
  const lower = text.toLowerCase();

  let posScore = 0;
  let critScore = 0;

  const posWords = /\b(thaw|relief|growth|gain|record|profit|peace|relaxation|exemption|surplus|boost|success|improved|positive|rally|strengthen|victory|medal|win|approved)\b/g;
  const critWords = /\b(warning|loss|inflation|scam|arrest|protest|threat|deficit|fall|drop|crisis|breach|curb|restriction|penalty|crash|probe|dispute|tension|criticized)\b/g;

  const posMatches = lower.match(posWords);
  if (posMatches) posScore += posMatches.length;

  const critMatches = lower.match(critWords);
  if (critMatches) critScore += critMatches.length;

  if (posScore > critScore) return "Positive";
  if (critScore > posScore) return "Critical";
  return "Neutral";
}

/**
 * Strips out newspaper mastheads, editions, prices, print locations, and OCR noise,
 * and extracts the true news headline, clean article body, category, sentiment, and entity tags.
 */
export function cleanArticleData(
  rawContent: string,
  rawHeadline?: string,
  rawCategory?: string
): CleanedArticle {
  if (!rawContent) {
    return {
      headline: rawHeadline || "Untitled Article",
      content: "",
      category: rawCategory || "General",
      sentiment: "Neutral",
      entities: ["#News"],
    };
  }

  let text = rawContent;

  // 1. Remove newspaper header/masthead metadata
  const lower = text.toLowerCase();
  const qrIdx = lower.indexOf("scan qr code");
  if (qrIdx !== -1) {
    text = text.substring(qrIdx + "scan qr code".length);
  } else {
    const subIdx = lower.indexOf("to subscribe");
    if (subIdx !== -1) {
      const periodAfter = text.indexOf(".", subIdx);
      if (periodAfter !== -1 && periodAfter - subIdx < 120) {
        text = text.substring(periodAfter + 1);
      }
    } else {
      text = text.replace(
        /^[\s\S]*?(?:CITY EDITION|EDITION|\d+\s*Pages|₹\s*\d+|www\.[a-z0-9.-]+\.[a-z]+)[\s\S]*?(?:RNI\s*No\.[^\n.]*?[.\n]|Printed at[^\n.]*?[.\n])\s*/i,
        ""
      );
    }
  }

  // 2. Fix OCR hyphenated broken words: "govern- ment" -> "government", "in- vestments" -> "investments"
  text = text.replace(
    /([a-zA-Z]+)[-\u2010\u2011\u2012\u2013\u2014]\s*([a-zA-Z]+)/g,
    (_match, p1, p2) => p1 + p2
  );

  // 3. Fix OCR single character artifacts like "I n a " -> "In a "
  text = text.replace(/\bI\s+n\s+/g, "In ");

  text = text.trim();

  // 4. Check if the provided headline is generic (e.g. publication name like "THE HINDU")
  const isGenericHeadline =
    !rawHeadline ||
    /^(the\s+hindu|the\s+times\s+of\s+india|hindustan\s+times|indian\s+express|prabhat\s+khabar|newspaper|ai\s*e-?paper|delhi\s*city\s*edition)$/i.test(
      rawHeadline.trim()
    );

  let headline = rawHeadline || "";
  let content = text;

  if (isGenericHeadline && text) {
    const sentenceMatch = text.match(/^([\s\S]*?[.!?])(?:\s+|$)/);
    if (sentenceMatch && sentenceMatch[1].trim().length > 15) {
      headline = sentenceMatch[1].trim();
      content = text.substring(sentenceMatch[0].length).trim();
    } else {
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 0 && lines[0].length <= 150) {
        headline = lines[0].trim();
        content = lines.slice(1).join("\n").trim();
      } else {
        headline = text.substring(0, 100).trim() + "...";
        content = text.substring(100).trim();
      }
    }
  }

  const fullText = headline + " " + content;
  const detectedCat = detectArticleCategory(fullText, rawCategory);
  const detectedSentiment = detectSentiment(fullText);
  const detectedEntities = extractEntities(fullText);

  return {
    headline: headline || "Top Story",
    content: content || text,
    category: detectedCat,
    sentiment: detectedSentiment,
    entities: detectedEntities,
  };
}
