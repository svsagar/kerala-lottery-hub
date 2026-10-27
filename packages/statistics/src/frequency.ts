// Frequency analysis and candidate generation

export interface FrequencyEntry {
  ending: string;
  frequency: number;
}

export interface CandidateResult {
  candidates: string[];
  method: string;
  timestamp: Date;
  configuration: Record<string, any>;
}

// Method A: Composite frequency
export const generateCompositeFrequencyCandidates = (
  endings: FrequencyEntry[],
  candidateCount: number,
  weights: { frequency?: number; recency?: number; positional?: number } = {},
): string[] => {
  const defaultWeights = {
    frequency: weights.frequency ?? 0.6,
    recency: weights.recency ?? 0.3,
    positional: weights.positional ?? 0.1,
  };

  // Score each ending by composite frequency
  const scored = endings.map((entry) => ({
    ending: entry.ending,
    score: entry.frequency * defaultWeights.frequency,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, candidateCount).map((entry) => entry.ending);
};

// Method B: Exact-ending frequency
export const generateExactEndingCandidates = (
  endings: FrequencyEntry[],
  candidateCount: number,
): string[] => {
  const sorted = [...endings].sort((a, b) => b.frequency - a.frequency);

  // Handle ties with deterministic tie-breaking (lexicographic)
  return sorted
    .slice(0, candidateCount * 2) // Get more to handle ties
    .sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return a.ending.localeCompare(b.ending);
    })
    .slice(0, candidateCount)
    .map((entry) => entry.ending);
};

// Method D: Positional digit frequency scoring
export interface DigitFrequency {
  digit: string;
  frequency: number;
  position: number;
}

export const scoreByPositionalDigits = (
  digitFrequencies: DigitFrequency[],
): Record<string, number> => {
  const scores: Record<string, number> = {};

  // Initialize all 4-digit combinations
  for (let i = 0; i < 10000; i++) {
    const ending = String(i).padStart(4, '0');
    scores[ending] = 0;
  }

  // Score each ending based on digit frequencies at each position
  digitFrequencies.forEach(({ digit, frequency, position }) => {
    for (let i = 0; i < 10000; i++) {
      const ending = String(i).padStart(4, '0');
      if (ending[position] === digit) {
        scores[ending] += frequency;
      }
    }
  });

  return scores;
};

export const generatePositionalCandidates = (
  digitFrequencies: DigitFrequency[],
  candidateCount: number,
): string[] => {
  const scores = scoreByPositionalDigits(digitFrequencies);

  const sorted = Object.entries(scores)
    .map(([ending, score]) => ({ ending, score }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.ending.localeCompare(b.ending);
    });

  return sorted.slice(0, candidateCount).map((entry) => entry.ending);
};

// Method E: Uniform random baseline
export const generateRandomCandidates = (
  candidateCount: number,
  seed: number,
): string[] => {
  // Deterministic random generation using seed
  let state = seed;
  const candidates: string[] = [];
  const used = new Set<string>();

  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  while (candidates.length < candidateCount) {
    const rand = next();
    const num = Math.floor(rand * 10000);
    const ending = String(num).padStart(4, '0');

    if (!used.has(ending)) {
      candidates.push(ending);
      used.add(ending);
    }
  }

  return candidates;
};

// Method C: Recency-weighted frequency
export interface RecencyWeightedEntry {
  ending: string;
  score: number;
}

export const generateRecencyWeightedCandidates = (
  weighted: RecencyWeightedEntry[],
  candidateCount: number,
): string[] => {
  const sorted = [...weighted].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.ending.localeCompare(b.ending);
  });

  return sorted.slice(0, candidateCount).map((entry) => entry.ending);
};
