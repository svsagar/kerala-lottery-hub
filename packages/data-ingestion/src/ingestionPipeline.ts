import { LotteryCode } from '@kerala-lottery/shared';
import { fetchLotterySource } from './sources/keralaLotterySource';
import { extractResultsFromHTML } from './parsers/htmlParser';
import {
  validateDraw,
  detectDuplicates,
  extractLastFourDigits,
} from './validation/drawValidator';
import {
  RawDrawData,
  IngestionResult,
  IngestionError,
  ParsedDocument,
} from './types';

export interface IngestionOptions {
  timeout?: number;
  retries?: number;
  validateOnly?: boolean;
}

export const runIngestionPipeline = async (
  lotteryCode: LotteryCode,
  options: IngestionOptions = {},
): Promise<IngestionResult> => {
  const startTime = Date.now();
  const { timeout = 30000, retries = 3, validateOnly = false } = options;

  const errors: IngestionError[] = [];
  const warnings: any[] = [];
  let draws: RawDrawData[] = [];
  let sourceUrl = '';

  try {
    // Step 1: Fetch from official source
    const sourceResult = await fetchLotterySource(lotteryCode, timeout, retries);
    sourceUrl = sourceResult.metadata.sourceUrl || '';

    // Step 2: Parse HTML
    try {
      draws = extractResultsFromHTML(
        sourceResult.content,
        lotteryCode,
        sourceResult.metadata,
      );
    } catch (error) {
      errors.push({
        code: 'PARSE_ERROR',
        message: `Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical',
      });
      return createIngestionResult(
        false,
        draws,
        errors,
        warnings,
        sourceUrl,
        startTime,
      );
    }

    // Step 3: Validate each draw
    const validDraws: RawDrawData[] = [];
    draws.forEach((draw) => {
      const validation = validateDraw(draw);
      if (!validation.isValid) {
        validation.errors.forEach((err) => errors.push(err));
      } else {
        validDraws.push(draw);
      }
      validation.warnings.forEach((w) => warnings.push(w));
    });

    // Step 4: Check for duplicates
    const duplicates = detectDuplicates(validDraws);
    if (duplicates.length > 0) {
      warnings.push({
        code: 'DUPLICATE_DRAWS',
        message: `Found ${duplicates.length} duplicate draw numbers: ${duplicates.join(', ')}`,
      });
    }

    // Step 5: Enrich data (add last four digits)
    const enrichedDraws = validDraws.map((draw) => ({
      ...draw,
      prizeTiers: draw.prizeTiers.map((tier) => ({
        ...tier,
        ticketNumbers: tier.ticketNumbers.map((ticket) => ticket.trim()),
      })),
    }));

    return createIngestionResult(
      errors.length === 0,
      enrichedDraws,
      errors,
      warnings,
      sourceUrl,
      startTime,
    );
  } catch (error) {
    errors.push({
      code: 'INGESTION_FAILED',
      message: `Ingestion pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'critical',
    });

    return createIngestionResult(
      false,
      draws,
      errors,
      warnings,
      sourceUrl,
      startTime,
    );
  }
};

const createIngestionResult = (
  success: boolean,
  draws: RawDrawData[],
  errors: IngestionError[],
  warnings: any[],
  sourceUrl: string,
  startTime: number,
): IngestionResult => {
  const processingTime = Date.now() - startTime;

  return {
    success,
    draws,
    errors,
    warnings,
    metadata: {
      sourceUrl,
      retrievedAt: new Date(),
      processingTime,
      drawsFound: draws.length,
      drawsParsed: draws.length,
      drawsValid: draws.filter((d) => !errors.some((e) => e.draw === d))
        .length,
    },
  };
};

export const runAllIngestionsInParallel = async (
  options: IngestionOptions = {},
): Promise<Record<LotteryCode, IngestionResult>> => {
  const lotteries: LotteryCode[] = [
    'BT',
    'SS',
    'DL',
    'KN',
    'SK',
    'KR',
    'SM',
  ];

  const results = await Promise.all(
    lotteries.map((code) => runIngestionPipeline(code, options)),
  );

  const resultMap: Record<string, IngestionResult> = {};
  lotteries.forEach((code, index) => {
    resultMap[code] = results[index];
  });

  return resultMap as Record<LotteryCode, IngestionResult>;
};
