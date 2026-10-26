import { JSDOM } from 'jsdom';
import { LotteryCode } from '@kerala-lottery/shared';
import { RawDrawData, RawPrizeTier, ParsedDocument, SourceMetadata } from '../types';

export interface HTMLParserOptions {
  lotteryCode: LotteryCode;
  sourceMetadata: SourceMetadata;
}

export const parseHTMLDocument = (
  html: string,
  options: HTMLParserOptions,
): ParsedDocument => {
  const { lotteryCode, sourceMetadata } = options;
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const draws: RawDrawData[] = [];

  // Target result rows - adjust selector based on actual HTML structure
  const resultRows = document.querySelectorAll('tr[data-result-row], tbody tr');

  resultRows.forEach((row) => {
    try {
      // Extract draw number (usually first column)
      const drawNumberCell = row.querySelector('td:first-child, td:nth-child(1)');
      const drawNumber = drawNumberCell?.textContent?.trim();

      if (!drawNumber) return;

      // Extract draw date (usually second column)
      const dateCell = row.querySelector('td:nth-child(2)');
      const dateStr = dateCell?.textContent?.trim();

      if (!dateStr) return;

      // Parse date
      const drawDate = new Date(dateStr);
      if (isNaN(drawDate.getTime())) return;

      // Extract prize tiers (remaining columns typically contain prize data)
      const prizeTiers: RawPrizeTier[] = [];
      const prizeColumns = row.querySelectorAll('td:nth-child(n+3)');

      // Map columns to prize tiers
      const prizeNames = [
        'First Prize',
        'Second Prize',
        'Third Prize',
        'Fourth Prize',
        'Fifth Prize',
      ];

      prizeColumns.forEach((col, index) => {
        const ticketText = col.textContent?.trim();
        if (ticketText && prizeNames[index]) {
          prizeTiers.push({
            tierName: prizeNames[index],
            tierNumber: index + 1,
            ticketNumbers: [ticketText],
          });
        }
      });

      if (prizeTiers.length > 0) {
        draws.push({
          lotteryCode,
          drawNumber,
          drawDate,
          prizeTiers,
          sourceDocument: sourceMetadata,
        });
      }
    } catch (error) {
      // Skip rows that fail to parse
      console.error('Failed to parse row:', error);
    }
  });

  return {
    lotteryCode,
    draws,
  };
};

export const extractResultsFromHTML = (
  html: string,
  lotteryCode: LotteryCode,
  sourceMetadata: SourceMetadata,
): RawDrawData[] => {
  const parsed = parseHTMLDocument(html, {
    lotteryCode,
    sourceMetadata,
  });
  return parsed.draws;
};
