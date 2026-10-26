import axios, { AxiosError } from 'axios';
import { LotteryCode, LOTTERIES } from '@kerala-lottery/shared';
import { SourceMetadata } from '../types';
import { calculateContentHash } from '../utils/hash';

const OFFICIAL_SOURCE_URL = process.env.KERALA_LOTTERY_SOURCE_URL || 'https://result.keralalotteries.com/';

const SOURCE_URLS: Record<LotteryCode, string> = {
  BT: `${OFFICIAL_SOURCE_URL}results/bhagyathara`,
  SS: `${OFFICIAL_SOURCE_URL}results/sthree-sakthi`,
  DL: `${OFFICIAL_SOURCE_URL}results/dhanalekshmi`,
  KN: `${OFFICIAL_SOURCE_URL}results/karunya-plus`,
  SK: `${OFFICIAL_SOURCE_URL}results/suvarna-keralam`,
  KR: `${OFFICIAL_SOURCE_URL}results/karunya`,
  SM: `${OFFICIAL_SOURCE_URL}results/samrudhi`,
};

export interface FetchSourceResult {
  content: string;
  metadata: SourceMetadata;
}

export const fetchLotterySource = async (
  lotteryCode: LotteryCode,
  timeout: number = 30000,
  retries: number = 3,
): Promise<FetchSourceResult> => {
  const url = SOURCE_URLS[lotteryCode];
  const lotteryName = LOTTERIES[lotteryCode].name;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent': 'Kerala-Lottery-Hub/1.0',
        },
        validateStatus: () => true, // Don't throw on any status
      });

      if (response.status === 404) {
        throw new Error(`Source not found for ${lotteryName}: ${response.status}`);
      }

      if (response.status === 403) {
        throw new Error(`Access forbidden for ${lotteryName}: check if source requires special access`);
      }

      if (response.status >= 500) {
        throw new Error(`Server error from official source: ${response.status}`);
      }

      if (response.status !== 200) {
        throw new Error(`Unexpected status ${response.status} from official source`);
      }

      const content = response.data;
      const contentHash = await calculateContentHash(content);

      return {
        content,
        metadata: {
          sourceType: 'web',
          sourceUrl: url,
          sourceFormat: 'html',
          retrievedAt: new Date(),
          contentHash,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
    }
  }

  throw new Error(
    `Failed to fetch ${lotteryName} after ${retries} attempts: ${lastError?.message || 'Unknown error'}`,
  );
};

export const fetchAllLotterySources = async (
  timeout: number = 30000,
  retries: number = 3,
): Promise<Record<LotteryCode, FetchSourceResult | Error>> => {
  const results: Record<string, FetchSourceResult | Error> = {};

  for (const code of Object.keys(LOTTERIES) as LotteryCode[]) {
    try {
      results[code] = await fetchLotterySource(code, timeout, retries);
    } catch (error) {
      results[code] = error instanceof Error ? error : new Error(String(error));
    }
  }

  return results as Record<LotteryCode, FetchSourceResult | Error>;
};
