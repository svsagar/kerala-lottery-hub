// Core domain types
export type LotteryCode = 'BT' | 'SS' | 'DL' | 'KN' | 'SK' | 'KR' | 'SM';

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PARTIALLY_VERIFIED = 'PARTIALLY_VERIFIED',
  FULLY_VERIFIED = 'FULLY_VERIFIED',
  CACHED = 'CACHED',
  STALE = 'STALE',
  REJECTED = 'REJECTED',
  QUARANTINED = 'QUARANTINED',
}

export interface Lottery {
  id: string;
  code: LotteryCode;
  name: string;
  nameML: string;
  dayOfWeek: number;
  description?: string;
}

export interface PrizeTier {
  id: string;
  tierName: string;
  tierNumber: number;
  prizeEntries: PrizeEntry[];
}

export interface PrizeEntry {
  id: string;
  ticketNumber: string;
  lastFourDigits: string;
}

export interface Draw {
  id: string;
  lotteryId: string;
  drawNumber: string;
  drawDate: Date;
  verificationStatus: VerificationStatus;
  prizeTiers: PrizeTier[];
  sourceDocumentId?: string;
}

export interface FrequencyData {
  ending: string;
  frequency: number;
  percentage: number;
}

export interface AnalysisResult {
  lotteryCode: LotteryCode;
  prizeTier: string;
  sampleSize: number;
  analysisDate: Date;
  data: FrequencyData[];
}

export interface CandidateSet {
  methodName: string;
  candidates: string[];
  configuration: Record<string, unknown>;
  generatedAt: Date;
}

export interface BacktestResult {
  methodName: string;
  observedHits: number;
  expectedHits: number;
  excessHits: number;
  rawPValue?: number;
  adjustedPValue?: number;
  sampleSize: number;
}

export interface MethodComparison {
  lotteryCode: LotteryCode;
  prizeTier: string;
  methods: BacktestResult[];
  evaluationFolds: number;
  candidateBudget: number;
  dataQuality: 'sufficient' | 'insufficient';
}
