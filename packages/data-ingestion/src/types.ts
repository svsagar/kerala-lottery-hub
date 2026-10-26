import { LotteryCode } from '@kerala-lottery/shared';

export interface RawDrawData {
  lotteryCode: LotteryCode;
  drawNumber: string;
  drawDate: Date;
  prizeTiers: RawPrizeTier[];
  sourceDocument: SourceMetadata;
}

export interface RawPrizeTier {
  tierName: string;
  tierNumber: number;
  ticketNumbers: string[];
}

export interface SourceMetadata {
  sourceType: 'web' | 'pdf' | 'manual_upload';
  sourceUrl?: string;
  sourceFormat: 'html' | 'json' | 'pdf' | 'csv';
  retrievedAt: Date;
  contentHash: string;
}

export interface IngestionResult {
  success: boolean;
  draws: RawDrawData[];
  errors: IngestionError[];
  warnings: IngestionWarning[];
  metadata: IngestionMetadata;
}

export interface IngestionError {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  draw?: Partial<RawDrawData>;
}

export interface IngestionWarning {
  code: string;
  message: string;
  draw?: Partial<RawDrawData>;
}

export interface IngestionMetadata {
  sourceUrl: string;
  retrievedAt: Date;
  processingTime: number;
  drawsFound: number;
  drawsParsed: number;
  drawsValid: number;
}

export interface ParsedDocument {
  lotteryCode: LotteryCode;
  draws: RawDrawData[];
}
