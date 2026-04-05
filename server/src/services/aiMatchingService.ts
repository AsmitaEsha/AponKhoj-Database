import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const MIN_CONFIDENCE = 60;
const MAX_GEMINI_CANDIDATES = 20;

export interface FoundReport {
  name: string;
  age?: number | null;
  gender?: string | null;
  height?: string | null;
  district: string;
  address?: string | null;
  clothingDescription?: string | null;
  additionalInfo?: string | null;
}

export interface MissingReport {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  height?: string | null;
  district: string;
  address?: string | null;
  clothingDescription?: string | null;
  additionalInfo?: string | null;
  contactPersonName: string;
  contactPhone: string;
  photoUrl?: string | null;
  lastSeenDate?: Date | null;
}

export interface MatchResult {
  matched: boolean;
  matchedReport?: MissingReport;
  confidence?: number;
  reason?: string;
}

type ScoredCandidate = {
  report: MissingReport;
  score: number;
  reason: string;
};

function normalizeText(value?: string | null): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function words(value?: string | null): string[] {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ') : [];
}

function overlapScore(a?: string | null, b?: string | null): number {
  const wordsA = new Set(words(a));
  const wordsB = new Set(words(b));

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) {
      matches += 1;
    }
  }

  return matches / Math.max(wordsA.size, wordsB.size);
}

function numberLike(value?: string | null): number | null {
  if (!value) return null;
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function ageClose(foundAge?: number | null, missingAge?: number | null): boolean {
  if (foundAge == null || missingAge == null) return false;
  return Math.abs(foundAge - missingAge) <= 5;
}

function scoreCandidate(foundReport: FoundReport, missingReport: MissingReport): ScoredCandidate {
  const normalizedFoundName = normalizeText(foundReport.name);
  const normalizedMissingName = normalizeText(missingReport.name);
  const normalizedFoundDistrict = normalizeText(foundReport.district);
  const normalizedMissingDistrict = normalizeText(missingReport.district);
  const normalizedFoundGender = normalizeText(foundReport.gender);
  const normalizedMissingGender = normalizeText(missingReport.gender);

  let score = 0;
  const reasons: string[] = [];

  if (normalizedFoundDistrict && normalizedFoundDistrict === normalizedMissingDistrict) {
    score += 30;
    reasons.push('district matches');
  }

  if (normalizedFoundName && normalizedFoundName === normalizedMissingName) {
    score += 35;
    reasons.push('name matches exactly');
  } else {
    const nameOverlap = overlapScore(foundReport.name, missingReport.name);
    if (nameOverlap >= 0.75) {
      score += 25;
      reasons.push('name is highly similar');
    } else if (nameOverlap >= 0.5) {
      score += 15;
      reasons.push('name is similar');
    }
  }

  if (normalizedFoundGender && normalizedMissingGender && normalizedFoundGender === normalizedMissingGender) {
    score += 10;
    reasons.push('gender matches');
  }

  if (ageClose(foundReport.age, missingReport.age)) {
    score += 10;
    reasons.push('age is close');
  }

  const foundHeightNumber = numberLike(foundReport.height);
  const missingHeightNumber = numberLike(missingReport.height);
  if (foundHeightNumber != null && missingHeightNumber != null && Math.abs(foundHeightNumber - missingHeightNumber) <= 2) {
    score += 8;
    reasons.push('height is close');
  }

  const clothingOverlap = overlapScore(foundReport.clothingDescription, missingReport.clothingDescription);
  if (clothingOverlap >= 0.6) {
    score += 12;
    reasons.push('clothing description overlaps');
  }

  const infoOverlap = overlapScore(foundReport.additionalInfo, missingReport.additionalInfo);
  if (infoOverlap >= 0.5) {
    score += 10;
    reasons.push('additional details overlap');
  }

  return {
    report: missingReport,
    score,
    reason: reasons.length > 0 ? reasons.join(', ') : 'limited textual similarity',
  };
}

function pickTopCandidates(foundReport: FoundReport, missingReports: MissingReport[]): ScoredCandidate[] {
  return missingReports
    .map((report) => scoreCandidate(foundReport, report))
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_GEMINI_CANDIDATES);
}

export async function matchFoundWithMissing(
  foundReport: FoundReport,
  missingReports: MissingReport[]
): Promise<MatchResult> {
  if (missingReports.length === 0) {
    return { matched: false };
  }

  const topCandidates = pickTopCandidates(foundReport, missingReports);
  const bestCandidate = topCandidates[0];

  if (!bestCandidate) {
    return { matched: false };
  }

  const foundName = normalizeText(foundReport.name);
  const bestName = normalizeText(bestCandidate.report.name);
  const foundDistrict = normalizeText(foundReport.district);
  const bestDistrict = normalizeText(bestCandidate.report.district);

  if (foundName && foundName === bestName && foundDistrict && foundDistrict === bestDistrict) {
    return {
      matched: true,
      matchedReport: bestCandidate.report,
      confidence: 95,
      reason: 'name and district match exactly',
    };
  }

  if (bestCandidate.score >= 60) {
    return {
      matched: true,
      matchedReport: bestCandidate.report,
      confidence: Math.min(95, bestCandidate.score),
      reason: bestCandidate.reason,
    };
  }

  if (!genAI) {
    return { matched: false };
  }

  const missingListText = topCandidates
    .map((m) =>
      `ID:${m.report.id} | Name:${m.report.name} | Age:${m.report.age ?? 'Unknown'} | Gender:${m.report.gender ?? 'Unknown'} | Height:${m.report.height ?? 'Unknown'} | District:${m.report.district} | Clothing:${m.report.clothingDescription ?? 'N/A'} | Info:${m.report.additionalInfo ?? 'N/A'} | HeuristicScore:${m.score} | HeuristicReason:${m.reason}`
    )
    .join('\n');

  const foundText = `Name:${foundReport.name} | Age:${foundReport.age ?? 'Unknown'} | Gender:${foundReport.gender ?? 'Unknown'} | Height:${foundReport.height ?? 'Unknown'} | District:${foundReport.district} | Clothing:${foundReport.clothingDescription ?? 'N/A'} | Info:${foundReport.additionalInfo ?? 'N/A'}`;

  const prompt = `You are a person-matching assistant for a missing persons platform in Bangladesh.

A new FOUND PERSON report has been submitted:
${foundText}

Below are all currently active MISSING PERSON reports:
${missingListText}

Your task:
1. Compare the found person's details (age, gender, height, district, clothing, description) with every missing report.
2. If there is a strong or likely match, respond ONLY with this JSON (no markdown, no extra text):
{"matched": true, "matchedId": <ID number>, "confidence": <0-100>, "reason": "<brief reason>"}

3. If there is no meaningful match, respond ONLY with:
{"matched": false}

Rules:
- District must be the same or very nearby for a match.
- Gender must match if both are known.
- Age can have a tolerance of +-5 years.
- A match requires at least 3 fields to align well.
- Do NOT guess. Only return matched:true if reasonably confident.
- Return ONLY raw JSON. No markdown fences, no explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: geminiModel });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as {
      matched?: boolean;
      matchedId?: number;
      confidence?: number;
      reason?: string;
    };

    if (parsed.matched && typeof parsed.matchedId === 'number') {
      const matchedReport = missingReports.find((m) => m.id === parsed.matchedId);
      if (matchedReport) {
        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
        if (confidence < MIN_CONFIDENCE) {
          return { matched: false };
        }

        return {
          matched: true,
          matchedReport,
          confidence,
          reason: parsed.reason || 'Gemini found a likely match',
        };
      }
    }
    return { matched: false };
  } catch (err) {
    console.error('AI matching error:', err);
    // Always fail gracefully — report is already saved
    return { matched: false };
  }
}