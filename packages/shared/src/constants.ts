import { LotteryCode } from './types';

export const LOTTERIES: Record<LotteryCode, { name: string; nameML: string; day: number }> = {
  BT: { name: 'Bhagyathara', nameML: 'ഭാഗ്യതര', day: 1 }, // Monday
  SS: { name: 'Sthree-Sakthi', nameML: 'സ്ത്രീശക്തി', day: 2 }, // Tuesday
  DL: { name: 'Dhanalekshmi', nameML: 'ധനലക്ഷ്മി', day: 3 }, // Wednesday
  KN: { name: 'Karunya Plus', nameML: 'കരുണ പ്ലസ്', day: 4 }, // Thursday
  SK: { name: 'Suvarna Keralam', nameML: 'സുവർണ്ണ കേരളം', day: 5 }, // Friday
  KR: { name: 'Karunya', nameML: 'കരുണ', day: 6 }, // Saturday
  SM: { name: 'Samrudhi', nameML: 'സമൃദ്ധി', day: 0 }, // Sunday
};

export const METHODS = {
  COMPOSITE: 'composite',
  EXACT_ENDING_FREQ: 'exact_ending_freq',
  RECENCY_WEIGHTED: 'recency_weighted',
  POSITIONAL: 'positional',
  RANDOM: 'random',
} as const;

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  PARTIALLY_VERIFIED: 'PARTIALLY_VERIFIED',
  FULLY_VERIFIED: 'FULLY_VERIFIED',
  CACHED: 'CACHED',
  STALE: 'STALE',
  REJECTED: 'REJECTED',
  QUARANTINED: 'QUARANTINED',
} as const;

export const TICKET_NUMBER_LENGTH = 6;
export const LAST_FOUR_DIGITS_LENGTH = 4;

// Statistical defaults
export const BACKTESTING_DEFAULTS = {
  MIN_SAMPLE_SIZE: 50,
  MONTE_CARLO_ITERATIONS: 10000,
  ALPHA: 0.05,
  RECENCY_DECAY_LAMBDA: 0.1,
  CANDIDATE_BUDGET: 100,
} as const;

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;
