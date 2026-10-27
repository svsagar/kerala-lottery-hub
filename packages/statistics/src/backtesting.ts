// Walk-forward backtesting with proper data leakage prevention

export interface BacktestFold {
  foldIndex: number;
  trainStartDate: Date;
  trainEndDate: Date;
  testDate: Date;
  candidateBudget: number;
}

export interface BacktestResult {
  foldIndex: number;
  testDate: Date;
  method: string;
  candidates: string[];
  hits: number;
  expectedHits: number;
  excessHits: number;
  hitRate: number;
}

export interface BacktestComparison {
  method: string;
  totalHits: number;
  totalFolds: number;
  avgHitRate: number;
  expectedHits: number;
  excessHits: number;
  rawPValue?: number;
  adjustedPValue?: number;
}

// Generate walk-forward folds without future-data leakage
export const generateWalkForwardFolds = (
  drawDates: Date[],
  minTrainingPeriod: number = 50,
): BacktestFold[] => {
  const folds: BacktestFold[] = [];
  const sorted = [...drawDates].sort((a, b) => a.getTime() - b.getTime());

  for (let i = minTrainingPeriod; i < sorted.length; i++) {
    folds.push({
      foldIndex: folds.length,
      trainStartDate: sorted[0],
      trainEndDate: sorted[i - 1],
      testDate: sorted[i],
      candidateBudget: 100,
    });
  }

  return folds;
};

// Calculate hits for candidates against actual result
export const calculateHits = (
  candidates: string[],
  actualWinningNumbers: string[],
): number => {
  const candidateSet = new Set(candidates);
  return actualWinningNumbers.filter((num) => candidateSet.has(num)).length;
};

// Calculate expected hits under random selection
export const calculateExpectedHits = (
  candidateBudget: number,
  universalSize: number = 10000,
  winningCount: number = 1,
): number => {
  return (candidateBudget / universalSize) * winningCount;
};

// Monte Carlo p-value estimation
export const estimateMonteCarloPValue = (
  observedHits: number,
  candidateBudget: number,
  winningCount: number,
  iterations: number = 10000,
  seed: number = 42,
): number => {
  let hitCount = 0;
  let state = seed;

  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  for (let i = 0; i < iterations; i++) {
    let hitsThisIteration = 0;

    for (let j = 0; j < winningCount; j++) {
      const randomNum = Math.floor(next() * 10000);
      if (randomNum < candidateBudget) {
        hitsThisIteration++;
      }
    }

    if (hitsThisIteration >= observedHits) {
      hitCount++;
    }
  }

  // Plus-one correction for Monte Carlo
  return (hitCount + 1) / (iterations + 1);
};

// Multiple comparison correction (Holm-Bonferroni)
export const applHolmCorrection = (pValues: number[]): number[] => {
  const indexed = pValues.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => a.p - b.p);

  const corrected = new Array(pValues.length);
  const m = pValues.length;

  for (let i = 0; i < indexed.length; i++) {
    const correctedP = indexed[i].p * (m - i);
    corrected[indexed[i].i] = Math.min(correctedP, 1.0);
  }

  return corrected;
};

// Bonferroni correction
export const applyBonferroniCorrection = (pValues: number[], alpha: number = 0.05): number[] => {
  const m = pValues.length;
  const threshold = alpha / m;
  return pValues.map((p) => Math.min(p * m, 1.0));
};

// Check data sufficiency
export const isDataSufficient = (
  sampleSize: number,
  minSampleSize: number = 50,
): boolean => {
  return sampleSize >= minSampleSize;
};

// Calculate confidence interval (simplified)
export const calculateConfidenceInterval = (
  hits: number,
  trials: number,
  confidence: number = 0.95,
): [number, number] => {
  const p = hits / trials;
  const z = 1.96; // 95% confidence
  const margin = z * Math.sqrt((p * (1 - p)) / trials);
  return [Math.max(0, p - margin), Math.min(1, p + margin)];
};
