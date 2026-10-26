import { z } from 'zod';

// Lottery schemas
export const LotteryCodes = ['BT', 'SS', 'DL', 'KN', 'SK', 'KR', 'SM'] as const;

export const CreateLotterySchema = z.object({
  code: z.enum(LotteryCodes),
  name: z.string().min(1),
  nameML: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  description: z.string().optional(),
});

export const LotteryQuerySchema = z.object({
  code: z.enum(LotteryCodes).optional(),
});

// Draw schemas
export const CreateDrawSchema = z.object({
  lotteryId: z.string().uuid(),
  drawNumber: z.string(),
  drawDate: z.coerce.date(),
  verificationStatus: z.enum([
    'UNVERIFIED',
    'PARTIALLY_VERIFIED',
    'FULLY_VERIFIED',
    'CACHED',
    'STALE',
    'REJECTED',
    'QUARANTINED',
  ]),
});

export const DrawQuerySchema = z.object({
  lotteryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  verificationStatus: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Prize Entry schemas
export const CreatePrizeEntrySchema = z.object({
  prizeTierId: z.string().uuid(),
  ticketNumber: z.string().regex(/^\d{6}$/, 'Ticket must be 6 digits'),
  lastFourDigits: z.string().regex(/^\d{4}$/, 'Last four digits must be 4 digits'),
});

// Analysis schemas
export const FrequencyAnalysisQuerySchema = z.object({
  lotteryCode: z.enum(LotteryCodes),
  prizeTier: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Candidate generation schemas
export const CandidateGenerationSchema = z.object({
  lotteryCode: z.enum(LotteryCodes),
  methodName: z.enum(['composite', 'exact_ending_freq', 'recency_weighted', 'positional', 'random']),
  prizeTier: z.string().optional(),
  candidateBudget: z.number().min(1).max(9999),
  configuration: z.record(z.unknown()).optional(),
});

// Backtesting schemas
export const BacktestingSchema = z.object({
  lotteryCode: z.enum(LotteryCodes),
  prizeTier: z.string().optional(),
  methods: z.array(z.enum(['composite', 'exact_ending_freq', 'recency_weighted', 'positional', 'random'])),
  minSampleSize: z.number().min(1).default(50),
  trainStartDate: z.coerce.date().optional(),
  testStartDate: z.coerce.date().optional(),
});

// Export schemas for API responses
export const SuccessResponseSchema = z.object({
  status: z.literal('success'),
  data: z.unknown(),
  timestamp: z.date(),
});

export const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  error: z.string(),
  details: z.unknown().optional(),
  timestamp: z.date(),
});

export type CreateLottery = z.infer<typeof CreateLotterySchema>;
export type CreateDraw = z.infer<typeof CreateDrawSchema>;
export type DrawQuery = z.infer<typeof DrawQuerySchema>;
export type FrequencyAnalysisQuery = z.infer<typeof FrequencyAnalysisQuerySchema>;
export type CandidateGeneration = z.infer<typeof CandidateGenerationSchema>;
export type Backtesting = z.infer<typeof BacktestingSchema>;
